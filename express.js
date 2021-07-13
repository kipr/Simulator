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
        return res.status(400).json({
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
            res.set('Content-Type', 'application/javascript');
            res.status(200).send(data);
          });
        });
      });
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
