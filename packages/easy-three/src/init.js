// @flow
/* eslint-disable consistent-return */
import assert from 'assert';
import death from 'death';
import loadConfig, {type ConfigMap} from 'env-and-files';
import isobject from 'isobject';
import pTry from 'p-try';
import pino from 'pino';
import type {Config, Logger} from './types';

type Start<CMap: ConfigMap> = (
  config: Config<CMap>,
  logger: Logger,
) => Shutdown | Promise<Shutdown>;

type Shutdown = () => void | Promise<void>;

export default function init<CMap: ConfigMap>(
  configMap: CMap,
  start: Start<CMap>,
) {
  assert(isobject(configMap), '"config" must be a ConfigMap object.');
  assert(typeof start === 'function', '"start" must be a function.');
  loadConfig(
    {
      logger: {
        level: 'LOG_LEVEL',
        pretty: 'LOG_PRETTY',
      },
      ...configMap,
    },
    (error, config) => {
      const logger = pino({
        level: config.logger.level || 'info',
        prettyPrint: config.logger.pretty === 'true',
      });
      if (error) {
        return logger.error(error);
      }
      // Inline it as `logger::error` when that syntax is supported.
      const logError = logger.error.bind(logger);
      pTry(() => start(config, logger)).then(shutdown => {
        // As much as I'd like to make this mandatory, I don't really want to call `process.exit` if they don't provide it.
        if (typeof shutdown !== 'function') {
          return logger.warn(
            '"start" should return a function or a Promise resolving to a function.',
          );
        }
        death(() => pTry(shutdown).catch(logError));
      }, logError);
    },
  );
}
