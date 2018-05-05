// @flow
/* eslint-disable consistent-return */
import assert from 'assert';
import assignDeep from 'assign-deep';
import death from 'death';
import {loadConfig, type ConfigMap} from 'env-and-files';
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
  return loadConfig(assignDeep(baseConfig, configMap)).then(
    config => {
      const logger = pino({level: config.logger.level || 'info'});
      logger.trace('The logger has been initialized.');
      logger.debug('Configuration has been loaded.');
      return pTry(() => start(config, logger)).then(
        shutdown => {
          logger.info('The application has been initialized.');
          // As much as I'd like to make this mandatory, I don't really want to call `process.exit` if they don't provide it.
          if (typeof shutdown !== 'function') {
            return logger.warn(
              '"start" should return a function or a Promise resolving to a function.',
            );
          }
          death((signal, error) => {
            if (error) {
              logger.fatal(error, 'Aborting due to fatal error.');
            }
            logger.info({signal}, 'Shutting down.');
            return pTry(() => shutdown(signal, error)).then(
              () =>
                logger.info('The application has been gracefully shut down.'),
              shutdownError =>
                // Omae wa mou shindeiru
                logger.error(
                  shutdownError,
                  'An error was encountered while attempting to shut down.',
                ),
            );
          });
        },
        error => {
          logger.fatal(
            error,
            'An error was encountered while attempting to initialize.',
          );
          throw error;
        },
      );
    },
    error => {
      pino().fatal(
        error,
        'Configuration could not be loaded.  Application will not start.',
      );
      throw error;
    },
  );
}
