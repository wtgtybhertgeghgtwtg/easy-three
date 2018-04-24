# easy-three

> Initialize an application and shut it down gracefully.

Pretty much just a wrapper around [`env-and-files`](https://www.npmjs.com/package/env-and-files), [`pino`](https://www.npmjs.com/package/pino), and [`death`](https://www.npmjs.com/package/death).

## Install

```
yarn add easy-three
```

## Usage

```js
const init = require('easy-three');

// A config map for `env-and-files`.  This describes configuration that will be passed to the application.
const configMap = {
  server: {
    port: {
      required: true,
      variableName: 'PORT',
    },
  },
  sql: {
    password: {
      filePath: '/path/to/secret',
      required: true,
    },
  },
};

// The actual application.  If configuration loads correctly, this will be called with configuration and a `pino` logger instance.
function start(config, logger) {
  // Application code goes here.
  // Return a function to be passed to `death`.  This will be called on, uh, death.
  return (signal, error) => {
    // Close your server, release resources, maybe say goodbye to the user.
  };
}

// Start the thing.
init(configMap, start);
```

## API

### init(configMap, start)

Load the configuration, start the application, listen for shutdown.

#### configMap

Type: `Object`

A config map to be passed to `env-and-files`. See the [`env-and-files` usage](https://github.com/wtgtybhertgeghgtwtg/env-and-files#usage) for examples of what that looks like.

#### start(config, logger)

Type: `Function`

A function to be called if configuration loads properly. Should return a shutdown function to be called on termination.

## License

MIT © Matthew Fernando Garcia
