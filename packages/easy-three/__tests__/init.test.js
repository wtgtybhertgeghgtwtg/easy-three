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
    it('defaults to non-pretty "info".', async () => {
      await init({}, () => () => {});
      expect(pino).toHaveBeenCalledWith({
        level: 'info',
        prettyPrint: false,
      });
    });

    it('passes "LOG_LEVEL" as the log level.', async () => {
      const logLevel = 'trace';
      process.env.LOG_LEVEL = logLevel;
      await init({}, () => () => {});
      expect(pino).toHaveBeenCalledWith({
        level: logLevel,
        prettyPrint: false,
      });
    });

    it('is pretty if "LOG_PRETTY" equals true.', async () => {
      process.env.LOG_PRETTY = 'true';
      await init({}, () => () => {});
      expect(pino).toHaveBeenCalledWith({
        level: 'info',
        prettyPrint: true,
      });
    });
  });

  describe('initialization the application', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    const variableName = 'SOME_CONFIG_VARIABLE';

    it('logs a ConfigError if it there is one and rejects.', async () => {
      const start = jest.fn();
      delete process.env[variableName];
      await expect(
        init({groupOne: {propOne: {required: true, variableName}}}, start),
      ).rejects.toThrow('Configuration could not be loaded.');
      expect(pino.__logger.fatal).toHaveBeenCalledWith(
        expect.any(Error),
        'Configuration could not be loaded.  Application will not start.',
      );
      expect(start).not.toHaveBeenCalled();
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

    it('passes the logger to "start".', async () => {
      const message = 'Some message.';
      await init({}, (config, logger) => {
        logger.info(message);
        return () => {};
      });
      expect(pino.__logger.info).toHaveBeenCalledWith(message);
    });

    it('logs the error and rejects if "start" throws.', async () => {
      const message = 'Some message.';
      await expect(
        init({}, () => {
          throw new Error(message);
        }),
      ).rejects.toThrow(message);
      expect(pino.__logger.fatal).toHaveBeenCalledWith(
        expect.any(Error),
        'An error was encountered while attempting to initialize.',
      );
    });

    it('logs the error and rejects if "start" rejects.', async () => {
      const message = 'Some message.';
      await expect(
        init({}, async () => {
          throw new Error(message);
        }),
      ).rejects.toThrow(message);
      expect(pino.__logger.fatal).toHaveBeenCalledWith(
        expect.any(Error),
        'An error was encountered while attempting to initialize.',
      );
    });

    it('gives a warning if "start" does not return a function or a Promise that resolves to a function.', async () => {
      // $FlowFixMe
      await init({}, () => {});
      expect(pino.__logger.warn).toHaveBeenCalledWith(
        '"start" should return a function or a Promise resolving to a function.',
      );
      expect(death).not.toHaveBeenCalled();
    });
  });

  describe('shutdown', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('calls "shutdown" on death.', async () => {
      const shutdown = jest.fn();
      await init({}, () => shutdown);
      expect(shutdown).not.toHaveBeenCalled();
      await death.__die();
      expect(shutdown).toHaveBeenCalled();
    });

    it('logs the error if "shutdown" passes one.', async () => {
      const error = new Error('Some message.');
      await init({}, () => () => {});
      await death.__die(undefined, error);
      expect(pino.__logger.fatal).toHaveBeenCalledWith(
        error,
        'Aborting due to fatal error.',
      );
    });

    it('logs the error if "shutdown" throws.', async () => {
      const error = new Error('Some message.');
      const shutdown = () => {
        throw error;
      };
      await init({}, () => shutdown);
      await death.__die();
      expect(pino.__logger.error).toHaveBeenCalledWith(
        error,
        'An error was encountered while attempting to shut down.',
      );
    });

    it('logs the error if "shutdown" rejects.', async () => {
      const error = new Error('Some message.');
      const shutdown = async () => {
        throw error;
      };
      await init({}, () => shutdown);
      await death.__die();
      expect(pino.__logger.error).toHaveBeenCalledWith(
        error,
        'An error was encountered while attempting to shut down.',
      );
    });
  });
});
