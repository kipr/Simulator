/* eslint-env node */

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest/presets/js-with-ts',
  testEnvironment: 'node',
  roots: ['./test/'],

  // By default, jest will ignore all files in node_modules.
  // But since babylonjs is published as modules, we need to tell jest to transform it (along with transforming our own code).
  // The pattern below will continue ignoring all other node_modules EXCEPT for babylonjs.
  transformIgnorePatterns: [
    "/node_modules/(?!(@babylonjs/core)/)"
  ]
};