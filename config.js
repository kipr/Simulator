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