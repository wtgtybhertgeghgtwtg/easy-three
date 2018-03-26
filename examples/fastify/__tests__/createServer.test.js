// @flow
import createServer from '../src/createServer';

describe('the server', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const logger = {
    child: jest.fn(() => logger),
    debug: jest.fn(),
    error: jest.fn(),
    fatal: jest.fn(),
    info: jest.fn(),
    trace: jest.fn(),
    warn: jest.fn(),
  };

  it('irreverently greets on GET /.', async () => {
    const server = createServer(logger);
    const {payload} = await server.inject({
      method: 'GET',
      url: '/',
    });
    expect(payload).toEqual("How you doin'?");
  });

  it('irreverently bids farewell on close.', done => {
    const server = createServer(logger);
    server.close(() => {
      expect(logger.info).toHaveBeenCalledWith("See ya'!");
      done();
    });
  });
});
