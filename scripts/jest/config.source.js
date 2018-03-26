const {workspaces} = require('../../package.json');

module.exports = {
  collectCoverageFrom: ['src/**/*.js', '!src/{index,types}.js'],
  projects: workspaces,
  testEnvironment: 'node',
  testMatch: ['**/*.test.js'],
};
