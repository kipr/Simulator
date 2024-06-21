/* eslint-env node */

const fs = require('fs');

let dependencies = {};
try {
  dependencies = JSON.parse(fs.readFileSync('dependencies/dependencies.json', 'utf8'));
} catch (e) {
  console.error('Error reading dependencies/dependencies.json! The server will be crippled.');
  console.error('Please run python3 dependencies/build.py to generate.');
  console.error(e);
}

const serviceAccountKeyString = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_STRING;
const serviceAccountKeyFile = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_FILE;

let serviceAccountKey;
if (serviceAccountKeyString) {
  serviceAccountKey = JSON.parse(serviceAccountKeyString);
} else if (serviceAccountKeyFile) {
  serviceAccountKey = JSON.parse(fs.readFileSync(serviceAccountKeyFile, 'utf8'));
} else {
  throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY_STRING or FIREBASE_SERVICE_ACCOUNT_KEY_FILE must be set');
}

module.exports = {
  get: () => {
    return {
      server: {
        port: getEnvVarOrDefault('SERVER_PORT', 3000),
        feedbackWebhookURL: getEnvVarOrDefault('FEEDBACK_WEBHOOK_URL', ''),
        dependencies
      },
      caching: {
        staticMaxAge: getEnvVarOrDefault('CACHING_STATIC_MAX_AGE', 60 * 60 * 1000),
      },
      dbUrl: getEnvVarOrDefault('API_URL', 'https://db-prerelease.botballacademy.org'),
      firebase: {
        // Firebase API keys are not secret, so the real value is okay to keep in code
        apiKey: getEnvVarOrDefault('FIREBASE_API_KEY', 'AIzaSyBiVC6umtYRy-aQqDUBv8Nn1txWLssix04'),
        serviceAccountKey,
      },
      mailgun: {
        apiKey: getEnvVarOrDefault('MAILGUN_API_KEY', ''),
        domain: getEnvVarOrDefault('MAILGUN_DOMAIN', ''),
      },
    };
  },
};

function getEnvVarOrDefault(variableName, defaultValue) {
  return process.env[variableName] !== undefined
    ? process.env[variableName]
    : defaultValue;
}

// function getEnvVarOrThrow(variableName) {
//   if (process.env[variableName] === undefined) {
//     throw new Error(`Required environment variable is not set: ${variableName}`);
//   }

//   return process.env[variableName];
// }