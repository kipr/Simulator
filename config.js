/* eslint-env node */

module.exports = {
  get: () => {
    return {
      server: {
        port: getEnvVarOrDefault('SERVER_PORT', 3000),
        libwallabyRoot: getEnvVarOrDefault('LIBWALLABY_ROOT', './libwallaby'),
        feedbackWebhookURL: getEnvVarOrDefault('FEEDBACK_WEBHOOK_URL', 'https://discord.com/api/webhooks/932033545344520302/INtF5qz2M4EllekYvYLKip-Hbyw-TTHkr6JQRoJQ0FafZ0_6dBrgvpw4O8YB5zN2vSAK'),
      },
      caching: {
        staticMaxAge: getEnvVarOrDefault('CACHING_STATIC_MAX_AGE', 60 * 60 * 1000),
      }
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