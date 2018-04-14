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
      death((signal, err) => pTry(() => shutdown(signal, err)).catch(logError));
    }, logError);
  });
}
