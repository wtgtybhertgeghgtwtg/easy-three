// @flow
/* eslint-disable consistent-return */
import assert from 'assert';
import assignDeep from 'assign-deep';
import death from 'death';
import loadConfig, {type ConfigMap} from 'env-and-files';
import isobject from 'isobject';
import pTry from 'p-try';
import pino from 'pino';
import baseConfig from './baseConfig';
import type {Config, Logger} from './types';

type Shutdown = (signal?: string, error?: Error) => void | Promise<void>;

type Start<CMap: ConfigMap> = (
  config: Config<CMap>,
  logger: Logger,
) => Shutdown | Promise<Shutdown>;

export default function init<CMap: ConfigMap>(
  configMap: CMap,
  start: Start<CMap>,
) {
  assert(isobject(configMap), '"config" must be a ConfigMap object.');
  assert(typeof start === 'function', '"start" must be a function.');
  loadConfig(assignDeep(baseConfig, configMap), (error, config) => {
    const logger = pino({
      level: config.logger.level || 'info',
      prettyPrint: config.logger.pretty === 'true',
    });
    logger.trace('The logger has been initialized.');
    if (error) {
      return logger.fatal(
        {error},
        'Configuration could not be loaded.  Application will not start.',
      );
    }
    logger.debug('Configuration has been loaded.');
    pTry(() => start(config, logger)).then(
      shutdown => {
        logger.info('The application has been initialized.');
        // As much as I'd like to make this mandatory, I don't really want to call `process.exit` if they don't provide it.
        if (typeof shutdown !== 'function') {
          return logger.warn(
            '"start" should return a function or a Promise resolving to a function.',
          );
        }
        death((signal, err) => {
          if (err) {
            logger.fatal({error: err}, 'Aborting due to fatal error.');
          }
          logger.info({signal}, 'Shutting down.');
          pTry(() => shutdown(signal, err)).then(
            () => logger.info('The application has been gracefully shut down.'),
            shutdownError =>
              logger.error(
                {error: shutdownError},
                'An error was encountered while attempting to shut down.',
              ),
          );
        });
      },
      startError =>
        logger.fatal(
          {error: startError},
          'An error was encountered while attempting to initialize.',
        ),
    );
  });
}
