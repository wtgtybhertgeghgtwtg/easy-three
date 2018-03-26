const sourceConfig = require('./config.source');

module.exports = {
  ...sourceConfig,
  moduleNameMapper: {'../src': '<rootDir>/dist'},
  // Since examples don't have a distribution.
  // https://github.com/facebook/jest/issues/5866
  // projects: ['packages/*'],
};
