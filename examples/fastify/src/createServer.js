// @flow
import type {Logger} from 'easy-three';
import fastify from 'fastify';

export default function createServer(logger: Logger) {
  return fastify({logger})
    .addHook('onClose', (instance, done) => {
      // This message is just an excuse to use the logger and the shutdown hook.
      logger.info("See ya'!");
      done();
    })
    .get('/', async () => "How you doin'?");
}
