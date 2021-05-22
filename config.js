/* eslint-env node */

module.exports = {
  get: () => {
    return {
      libwallaby: {
        root: getEnvVarOrThrow('LIBWALLABY_ROOT'),
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

function getEnvVarOrThrow(variableName) {
  if (process.env[variableName] === undefined) {
    throw new Error(`Required environment variable is not set: ${variableName}`);
  }

  return process.env[variableName];
}