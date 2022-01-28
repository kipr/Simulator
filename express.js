/* eslint-env node */

const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const fs = require('fs');
const uuid = require('uuid');
const { exec } = require('child_process');
const app = express();
const sourceDir = 'dist';
const { get: getConfig } = require('./config');
var FormData = require('form-data');

let config;
try {
  config = getConfig();
} catch (e) {
  process.exitCode = 1;
  throw e;
}

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(bodyParser.json());
app.use(morgan('combined'));

app.post('/compile', (req, res) => {
  // const body = JSON.parse();

  if (!('code' in req.body)) {
    return res.status(400).json({
      error: "Expected code key in body"
    });
  }

  if (typeof req.body.code !== 'string') {
    return res.status(400).json({
      error: "Expected code key in body to be a string"
    });
  }

  // Wrap user's main() in our own "main()" that exits properly
  // Required because Asyncify keeps emscripten runtime alive, which would prevent cleanup code from running
  const augmentedCode = `${req.body.code}
    #include <emscripten.h>

    EM_JS(void, on_stop, (), {
      if (Module.context.onStop) Module.context.onStop();
    })
  
    void simMainWrapper()
    {
      main();
      on_stop();
      emscripten_force_exit(0);
    }
  `;

  
  const id = uuid.v4();
  const path = `/tmp/${id}.c`;
  fs.writeFile(path, augmentedCode, err => {
    if (err) {
      return res.status(500).json({
        error: "Failed to write ${}"
      });
    }

    exec(`emcc -s WASM=0 -s INVOKE_RUN=0 -s ASYNCIFY -s EXIT_RUNTIME=1 -s "EXPORTED_FUNCTIONS=['_main', '_simMainWrapper']" -I${config.server.libwallabyRoot}/include -L${config.server.libwallabyRoot}/lib -lkipr -o ${path}.js ${path}`, (err, stdout, stderr) => {
      if (err) {
        return res.status(200).json({
          stdout,
          stderr
        });
      }
  
      fs.readFile(`${path}.js`, (err, data) => {
        if (err) {
          return res.status(400).json({
            error: `Failed to open ${path}.js for reading`
          });
        }

        fs.unlink(`${path}.js`, err => {
          if (err) {
            return res.status(500).json({
              error: `Failed to delete ${path}.js`
            });
          }
          fs.unlink(`${path}`, err => {
            if (err) {
              return res.status(500).json({
                error: `Failed to delete ${path}`
              });
            }
            res.status(200).json({
              result: data.toString(),
              stdout,
              stderr,
            });
          });
        });
      });
    });
  });
  
  
});

app.post('/feedback', (req, res) => {
  const hook = config.server.feedbackWebhookURL;
  const body = req.body;

  const feedbackForm = new FormData();

  feedbackForm.append('username', 'KIPR Simulator Feedback');
  feedbackForm.append('avatar_url', 'https://www.kipr.org/wp-content/uploads/2018/08/botguy-copy.jpg');

  let content = `User Feedback Recieved:\n\`\`\`${body.feedback} \`\`\``;
  
  content += `Sentiment:`;
  switch (body.sentiment) {
    case 0: content += 'No sentiment! This is probably a bug'; break;
    case 1: content += ':frowning2:'; break;
    case 2: content += ':expressionless:'; break;
    case 3: content += ':smile:'; break;
  }
  content += '\n';

  if (body.email !== null && body.email !== '') {
    content += `User Email: ${body.email}\n`;
  }
  
  // function for including anonymous data. This needs to be a promise,
  // because the file write/read is async, but we don't always do it
  // after the promise is resolved, we'll then actually do the request
  //
  // resolve contains the path to the userdata file, or null if none.
  // reject on write error
  // 
  // after this function is resolved, the file at path (if non-null)
  // must be deleted, although this should only happen after webhook
  // post request is sent
  const includeAnonData = (body) => new Promise((resolve, reject) => { 
    if (!body.includeAnonData) {
      resolve(null);
      return;
    }

    content += `User Code:\n\`\`\`${body.state.code} \`\`\``;
    content += `Browser User-Agent: ${body.userAgent}\n`;

    // TODO: it would be nice if we could avoid write/read operations and instead
    // just do this virtually w/o a real file object getting written
    const id = uuid.v4();
    const path = `/tmp/${id}.json`;

    fs.writeFile(path, 
      JSON.stringify(req.body.state, undefined, 2),
      err => {
        if (err) {
          reject(`Failed to write user data - please try again`);
        }

        feedbackForm.append("file", 
          fs.createReadStream(path),
          { filename: 'userdata.json' }
        );
        resolve(path);
      }
    );
  });

  includeAnonData(body)
    .then(path => {
      feedbackForm.append('content', content);
      
      // can't just handle this directly because then we might
      // be modifying the result multiple times, which isn't allowed
      let deleteError = false;

      feedbackForm.submit(hook,
        (error) => {
          if (path !== null) {
            fs.unlink(path, err => {
              if (err) {
                console.log(`Failed to delete ${path}`);
                deleteError = true;
              }
            });
          }
          if (deleteError) {
            res.status(500).json({
              error: 'Failed to delete user data after submit! Your feedback has been recieved, but please submit another feedback form with this error message!'
            });
          } else if (error) {
            res.status(500).json({
              error: 'Failed to send feedback!'
            });
          } else {
            res.status(200).json({
              message: 'Feedback submitted! Thank you!'
            });
          }
        }
      );
    })
    .catch(() => {
      res.status(500).json({
        error: 'Could not send feedback!'
      });
    });
});

app.use('/static', express.static(`${__dirname}/static`, {
  maxAge: config.caching.staticMaxAge,
}));

app.use('/dist', express.static(`${__dirname}/dist`));

app.use(express.static(sourceDir, {
  maxAge: config.caching.staticMaxAge,
}));


app.use('*', (req, res) => {
  res.sendFile(`${__dirname}/${sourceDir}/index.html`);
});



app.listen(config.server.port, () => {
  console.log(`Express web server started: http://localhost:${config.server.port}`);
  console.log(`Serving content from /${sourceDir}/`);
});
