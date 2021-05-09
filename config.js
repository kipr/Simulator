/* eslint-env node */

module.exports = {
  libwallaby: {
    root: getEnvVarOrDefault('LIBWALLABY_ROOT', null),
  },
  caching: {
    staticMaxAge: getEnvVarOrDefault('CACHING_STATIC_MAX_AGE', 5 * 60 * 1000),
  }
};

function getEnvVarOrDefault(variableName, defaultValue) {
  return process.env[variableName] !== undefined
    ? process.env[variableName]
    : defaultValue;
}