// @flow
import type {Config} from 'easy-three';
import typeof ConfigMap from './configMap';

export type FastifyExampleConfig = Config<ConfigMap>;
export type ServerConfig = $PropertyType<FastifyExampleConfig, 'server'>;
