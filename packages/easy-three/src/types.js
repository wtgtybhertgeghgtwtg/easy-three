// @flow
import type {Config as BaseConfig, ConfigMap} from 'env-and-files';

export type Config<CMap: ConfigMap> = BaseConfig<{
  logger: {level: string, pretty: string},
  ...CMap,
}>;

export type LogFunction = (obj: Object | string, message?: string) => void;

// Roughly what `pino` gives.
export type Logger = {
  debug: LogFunction,
  error: LogFunction,
  fatal: LogFunction,
  info: LogFunction,
  trace: LogFunction,
  warn: LogFunction,
};
