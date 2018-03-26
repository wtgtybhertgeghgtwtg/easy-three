// @flow
import type {Logger} from 'easy-three';
import {promisify} from 'util';
import createServer from './createServer';
import type {FastifyExampleConfig} from './types';

export default async function start(
  config: FastifyExampleConfig,
  logger: Logger,
) {
  // Create the server.
  const server = createServer(logger);

  // Start listening.
  await server.listen(config.server.port);

  // Return the function that will run on shutdown.
  return promisify(server.close);
}
