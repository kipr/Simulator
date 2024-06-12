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
const { WebhookClient } = require('discord.js');
const proxy = require('express-http-proxy');
const axios = require('axios').default;
const { FirebaseTokenManager } = require('./firebaseAuth');
const formData = require('form-data');
const Mailgun = require('mailgun.js');

let config;
try {
  config = getConfig();
} catch (e) {
  process.exitCode = 1;
  throw e;
}

const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: 'api',
  key: config.mailgun.apiKey,
});

const firebaseTokenManager = new FirebaseTokenManager(config.firebase.serviceAccountKey);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(bodyParser.json());
app.use(morgan('combined'));

app.use('/api', proxy(config.dbUrl));

// If we have libkipr (C) artifacts and emsdk, we can compile.
if (config.server.dependencies.libkipr_c && config.server.dependencies.emsdk_env) {

  app.post('/compile', (req, res) => {
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

      // ...process.env causes a linter error for some reason.
      // We work around this by doing it manually.
      
      const env = {};
      for (const key of Object.keys(process.env)) {
        env[key] = process.env[key];
      }
      
      env['PATH'] = `${config.server.dependencies.emsdk_env.PATH}:${process.env.PATH}`;
      env['EMSDK'] = config.server.dependencies.emsdk_env.EMSDK;
      env['EM_CONFIG'] = config.server.dependencies.emsdk_env.EM_CONFIG;
  
      exec(`emcc -s WASM=0 -s INVOKE_RUN=0 -s ASYNCIFY -s EXIT_RUNTIME=1 -s "EXPORTED_FUNCTIONS=['_main', '_simMainWrapper']" -I${config.server.dependencies.libkipr_c}/include -L${config.server.dependencies.libkipr_c}/lib -lkipr -o ${path}.js ${path}`, {
        env
      }, (err, stdout, stderr) => {
        if (err) {
          console.log(stderr);
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
}


app.post('/feedback', (req, res) => {
  const hookURL = config.server.feedbackWebhookURL;
  if (!hookURL) {
    res.status(500).json({
      message: 'The feedback URL is not set on the server. If this is a developoment environment, make sure the feedback URL environment variable is set.'
    });
    return;
  }

  const body = req.body;

  let content = `User Feedback Recieved:\n\`\`\`${body.feedback} \`\`\``;
  
  content += `Sentiment: `;
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

  let files = null;

  if (body.includeAnonData) {
    content += `Browser User-Agent: ${body.userAgent}\n`;
    files = [{
      attachment: Buffer.from(JSON.stringify(body.state, undefined, 2)),
      name: 'userdata.json'
    }];
  }

  let webhook;
  try {
    webhook = new WebhookClient({ url: hookURL });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'An error occured on the server. If you are a developer, your webhook url is likely wrong.'
    });
    // TODO: write the feedback to a file if an error occurs?
    return;
  }

  webhook.send({
    content: content,
    username: 'KIPR Simulator Feedback',
    avatarURL: 'https://www.kipr.org/wp-content/uploads/2018/08/botguy-copy.jpg',
    files: files
  })
    .then(() => {
      res.status(200).json({
        message: 'Feedback submitted! Thank you!'
      });
    })
    .catch(() => {
      res.status(500).json({
        message: 'An error occured on the server while sending feedback.'
      });
      // TODO: write the feedback to a file if an error occurs?
    });
});

// API TO START PARENTAL CONSENT FLOW, INCLUDING SENDING EMAIL TO PARENT
// anonymous since parental consent page has no authentication
// TODO: don't have a separate endpoint for starting the flow
app.post('/parental-consent-start/:userId', (req, res) => {
  const userId = req.params['userId'];

  if (!('dateOfBirth' in req.body)) {
    return res.status(400).json({
      error: "Expected dateOfBirth key in body"
    });
  }

  if (typeof req.body.dateOfBirth !== 'string') {
    return res.status(400).json({
      error: "Expected dateOfBirth key in body to be a string"
    });
  }

  if (!('parentEmailAddress' in req.body)) {
    return res.status(400).json({
      error: "Expected parentEmailAddress key in body"
    });
  }

  if (typeof req.body.parentEmailAddress !== 'string') {
    return res.status(400).json({
      error: "Expected parentEmailAddress key in body to be a string"
    });
  }

  if (!('autoDelete' in req.body)) {
    return res.status(400).json({
      error: "Expected autoDelete key in body"
    });
  }

  if (typeof req.body.autoDelete !== 'boolean') {
    return res.status(400).json({
      error: "Expected autoDelete key in body to be a boolean"
    });
  }

  console.log('getting parental consent for user', userId);
  const firebaseIdToken = firebaseTokenManager.getToken();
  getParentalConsent(userId, firebaseIdToken)
    .then(currentConsent => {
      if (currentConsent !== null && currentConsent.legalAcceptance?.state !== 'not-started') {
        // TODO: it's okay for "not-started" consent to exist...?
        console.error('Consent already exists for user');
        res.status(400).send();
        return;
      }

      // Send email to parent
      console.log('sending email to parent');
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      sendParentalConsentEmail(userId, req.body.parentEmailAddress, baseUrl)
        .then(sendEmailResult => {
          // Update user consent in db
          const nextUserConsent = {
            dateOfBirth: req.body.dateOfBirth,
            legalAcceptance: {
              state: 'awaiting-parental-consent',
              version: 1,
              sentAt: new Date().toISOString(),
              parentEmailAddress: req.body.parentEmailAddress,
              autoDelete: req.body.autoDelete,
            },
          };

          // setParentalConsentAwaiting(userId, req.body.dateOfBirth, req.body.parentEmailAddress, firebaseIdToken)
          setNextUserConsent(userId, nextUserConsent, firebaseIdToken)
            .then(setConsentResult => {
              res.status(200).send(nextUserConsent);
            })
            .catch(setConsentError => {
              console.error('Failed to set consent', setConsentError);
              res.status(400).send();
            });
        })
        .catch(sendEmailError => {
          console.error('Failed to send parent consent email', sendEmailError);
          res.status(500).send();
        });
    })
    .catch(getConsentError => {
      console.error('Failed to get current consent state', getConsentError);
      res.status(400).send();
    });
});

// API TO GRANT PARENTAL CONSENT TO USER
// anonymous since parental consent page has no authentication
app.post('/parental-consent/:userId', (req, res) => {
  const userId = req.params['userId'];

  if (!req.is('application/pdf')) {
    console.error('Content-Type is not pdf');
    res.status(400).send();
    return;
  }

  const contentLength = Number(req.header('Content-Length'));
  if (isNaN(contentLength) || contentLength === 0) {
    console.error('Content-Length must be non-zero');
    res.status(400).send();
    return;
  }

  const MAX_CONTENT_LENGTH = 200 * 1000;
  if (contentLength > MAX_CONTENT_LENGTH) {
    console.error('Content-Length of', contentLength, 'exceeds the max of', MAX_CONTENT_LENGTH);
    res.status(400).send();
    return;
  }

  const firebaseIdToken = firebaseTokenManager.getToken();
  getParentalConsent(userId, firebaseIdToken)
    .then(currentConsent => {
      if (currentConsent?.legalAcceptance?.state !== 'awaiting-parental-consent') {
        console.error('Current state is not awaiting parental consent');
        res.status(400).send();
        return;
      }

      const consentRequestSentAt = currentConsent?.legalAcceptance?.sentAt;
      const consentRequestSentAtMs = consentRequestSentAt ? Date.parse(consentRequestSentAt) : NaN;
      if (isNaN(consentRequestSentAtMs)) {
        console.error('Sent at time is not valid');
        res.status(500).send();
        return;
      }

      const currMs = new Date().getTime();
      if (currMs - consentRequestSentAtMs > 48 * 60 * 60 * 1000) {
        console.error('Consent was requested too long ago');
        res.status(400).send();
        return;
      }

      streamToBuffer(req)
        .then(bodyBuffer => {
          // Save parental consent PDF
          storeParentalConsentPdf(bodyBuffer, firebaseIdToken)
            .then(storeResponse => {
              const parentalConsentUri = storeResponse.cloudStorageUri;

              const nextUserConsent = {
                ...currentConsent,
                legalAcceptance: {
                  state: 'obtained-parental-consent',
                  version: 1,
                  receivedAt: new Date().toISOString(),
                  parentEmailAddress: currentConsent.legalAcceptance.parentEmailAddress,
                  parentalConsentUri: parentalConsentUri,
                },
              };

              setNextUserConsent(userId, nextUserConsent, firebaseIdToken)
              // setParentalConsentObtained(userId, currentConsent, parentalConsentUri, firebaseIdToken)
                .then(setConsentResult => {
                  sendParentalConsentConfirmation(currentConsent.legalAcceptance.parentEmailAddress, bodyBuffer)
                    .then(sendConfirmationResult => {
                      res.status(200).send();
                    })
                    .catch(sendConfirmationError => {
                      console.error('Failed to send confirmation email', sendConfirmationError);
                      res.status(500).send();
                    });
                })
                .catch(setConsentError => {
                  console.error('Failed to set consent', setConsentError);
                  res.status(400).send();
                });
            })
            .catch(e => {
              console.error('Failed to store parental consent PDF', e);
              res.status(500).send();
            });
        })
        .catch(bufferError => {
          console.error('Failed to get buffer for stream', bufferError);
          res.status(500).send();
        });
    })
    .catch(getConsentError => {
      console.error('Failed to get current consent state', getConsentError);
      res.status(400).send();
    });
});

app.use('/static', express.static(`${__dirname}/static`, {
  maxAge: config.caching.staticMaxAge,
}));

// Expose cpython artifacts
if (config.server.dependencies.cpython) {
  console.log('CPython artifacts are enabled.');
  app.use('/cpython', express.static(`${config.server.dependencies.cpython}`, {
    maxAge: config.caching.staticMaxAge,
  }));
}

// Expose libkipr (Python) artifacts
if (config.server.dependencies.libkipr_python) {
  console.log('libkipr (Python) artifacts are enabled.');
  app.use('/libkipr/python', express.static(`${config.server.dependencies.libkipr_python}`, {
    maxAge: config.caching.staticMaxAge,
  }));
}

app.use('/dist', express.static(`${__dirname}/dist`, {
  setHeaders: setCrossOriginIsolationHeaders,
}));

app.use(express.static(sourceDir, {
  maxAge: config.caching.staticMaxAge,
  setHeaders: setCrossOriginIsolationHeaders,
}));

app.get('/login', (req, res) => {
  res.sendFile(`${__dirname}/${sourceDir}/login.html`);
});

app.get('/parental-consent/*', (req, res) => {
  res.sendFile(`${__dirname}/${sourceDir}/parental-consent.html`);
});

app.use('*', (req, res) => {
  setCrossOriginIsolationHeaders(res);
  res.sendFile(`${__dirname}/${sourceDir}/index.html`);
});



app.listen(config.server.port, () => {
  console.log(`Express web server started: http://localhost:${config.server.port}`);
  console.log(`Serving content from /${sourceDir}/`);
});

// Cross-origin isolation required for using features like SharedArrayBuffer
function setCrossOriginIsolationHeaders(res) {
  res.header("Cross-Origin-Opener-Policy", "same-origin");
  res.header("Cross-Origin-Embedder-Policy", "require-corp");
}

function getParentalConsent(userId, token) {
  const requestConfig = {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  };

  return axios.get(`${config.dbUrl}/user/${userId}`, requestConfig)
    .then(response => {
      return response.data;
    })
    .catch(error => {
      if (error.response && error.response.status === 404) {
        return null;
      }

      console.error('ERROR:', error)
      throw error;
    });
}

function storeParentalConsentPdf(pdfData, token) {
  const requestConfig = {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/pdf',
    },
  };
  
  return axios.post(`${config.dbUrl}/v1/big_store`, pdfData, requestConfig)
    .then(response => response.data);
}

function setNextUserConsent(userId, nextUserConsent, token) {
  const requestConfig = {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  };

  return axios.post(`${config.dbUrl}/user/${userId}`, nextUserConsent, requestConfig)
    .then(response => {
      return response.data;
    });
}

function sendParentalConsentEmail(userId, parentEmailAddress, baseUrl) {
  const domain = config.mailgun.domain;
  const consentLink = `${baseUrl}/parental-consent/${userId}`;

  // TODO: compose final email
  const mailgunData = {
    from: `test@${domain}`,
    to: parentEmailAddress,
    subject: `Parental consent for Botball Simulator`,
    template: 'Test template',
    'h:X-Mailgun-Variables': JSON.stringify({
      consentlink: consentLink
    }),
    // 'h:Reply-To': 'reply-to@example.com',
  };

  return mg.messages.create(domain, mailgunData);
}

function sendParentalConsentConfirmation(parentEmailAddress, pdfData) {
  const domain = config.mailgun.domain;

  // TODO: compose final email
  const mailgunData = {
    from: `test@${domain}`,
    to: parentEmailAddress,
    template: 'parental consent confirmation',
    attachment: {
      data: pdfData,
      filename: 'KIPR_Simulator_Consent.pdf',
      contentType: 'application/pdf',
    },
  };

  return mg.messages.create(domain, mailgunData);
}

async function streamToBuffer(stream) {
  const bufs = [];
  for await (const chunk of stream) {
    bufs.push(chunk);
  }

  return Buffer.concat(bufs);
}