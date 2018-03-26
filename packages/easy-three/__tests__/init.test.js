// @flow
import death from 'death';
import pino from 'pino';
import init from '../src';

jest.mock('death');
jest.mock('pino');

describe('init', () => {
  describe('invariants', () => {
    it('throws if "configMap" is undefined.', () => {
      // $FlowFixMe
      expect(() => init()).toThrow('"config" must be a ConfigMap object.');
    });

    it('throws if "configMap" is not an object.', () => {
      // $FlowFixMe
      expect(() => init('Not an object.')).toThrow(
        '"config" must be a ConfigMap object.',
      );
    });

    it('throws if "configMap" is null.', () => {
      // $FlowFixMe
      expect(() => init(null)).toThrow('"config" must be a ConfigMap object.');
    });

    it('throws if "start" is not a function.', () => {
      // $FlowFixMe
      expect(() => init({}, 'Not a function.')).toThrow(
        '"start" must be a function.',
      );
    });
  });

  describe('logger config', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      delete process.env.LOG_LEVEL;
      delete process.env.LOG_PRETTY;
    });

    // Terrible test name.
    it('defaults to non-pretty "info".', done => {
      init({}, () => {
        expect(pino).toHaveBeenCalledWith({
          level: 'info',
          prettyPrint: false,
        });
        done();
        return () => {};
      });
    });

    it('passes "LOG_LEVEL" as the log level.', done => {
      const logLevel = 'trace';
      process.env.LOG_LEVEL = logLevel;
      init({}, () => {
        expect(pino).toHaveBeenCalledWith({
          level: logLevel,
          prettyPrint: false,
        });
        done();
        return () => {};
      });
    });

    it('is pretty if "LOG_PRETTY" equals true.', done => {
      process.env.LOG_PRETTY = 'true';
      init({}, () => {
        expect(pino).toHaveBeenCalledWith({
          level: 'info',
          prettyPrint: true,
        });
        done();
        return () => {};
      });
    });
  });

  describe('initialization the application', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    const variableName = 'SOME_CONFIG_VARIABLE';

    it('logs a ConfigError if it there is one.', done => {
      const start = jest.fn();
      pino.__setErrorFunc(error => {
        expect(error.message).toEqual('Configuration could not be loaded.');
        expect(start).not.toHaveBeenCalled();
        done();
      });
      delete process.env[variableName];
      init({groupOne: {propOne: {required: true, variableName}}}, start);
    });

    it('passes loaded config to "start".', done => {
      const variableValue = 'Some value.';
      process.env[variableName] = variableValue;
      init({groupOne: {propOne: variableName}}, config => {
        expect(config.groupOne.propOne).toEqual(variableValue);
        done();
        return () => {};
      });
    });

    it('passes the logger to "start".', done => {
      const message = 'Some message.';
      pino.__setInfoFunc(info => {
        expect(info).toEqual(message);
        done();
      });
      init({}, (config, logger) => {
        logger.info(message);
        return () => {};
      });
    });

    it('logs the error if "start" throws.', done => {
      const message = 'Some message.';
      pino.__setErrorFunc(error => {
        expect(error.message).toEqual(message);
        done();
      });
      init({}, () => {
        throw new Error(message);
      });
    });

    it('logs the error if "start" rejects.', done => {
      const message = 'Some message.';
      pino.__setErrorFunc(error => {
        expect(error.message).toEqual(message);
        done();
      });
      init({}, async () => {
        throw new Error(message);
      });
    });

    it('gives a warning if "start" does not return a function or a Promise that resolves to a function.', done => {
      pino.__setWarnFunc(warn => {
        expect(warn).toEqual(
          '"start" should return a function or a Promise resolving to a function.',
        );
        expect(death).not.toHaveBeenCalled();
        done();
      });
      // $FlowFixMe
      init({}, () => {});
    });
  });

  describe('shutdown', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('calls "shutdown" on death.', done => {
      const shutdown = jest.fn();
      death.__setOnDeath(() => {
        death.__die();
        expect(shutdown).toHaveBeenCalled();
        done();
      });
      init({}, () => shutdown);
    });

    it('logs the error if "shutdown" throws.', done => {
      const message = 'Some message.';
      const shutdown = () => {
        throw new Error(message);
      };
      pino.__setErrorFunc(error => {
        expect(error.message).toEqual(message);
        done();
      });
      death.__setOnDeath(death.__die);
      init({}, () => shutdown);
    });

    it('logs the error if "shutdown" rejects.', done => {
      const message = 'Some message.';
      const shutdown = async () => {
        throw new Error(message);
      };
      pino.__setErrorFunc(error => {
        expect(error.message).toEqual(message);
        done();
      });
      death.__setOnDeath(death.__die);
      init({}, () => shutdown);
    });
  });
});
