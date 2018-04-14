// @flow
import type {Config as _Config, ConfigMap} from 'env-and-files';
import typeof BaseConfig from './baseConfig';

export type Config<CMap: ConfigMap> = _Config<{...BaseConfig, ...CMap}>;

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
