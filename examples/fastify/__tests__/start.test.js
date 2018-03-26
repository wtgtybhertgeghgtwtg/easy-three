// @flow
import createServer from '../src/createServer';
import start from '../src/start';

jest.mock('../src/createServer', () => {
  const close = jest.fn(callback => callback());
  const listen = jest.fn();
  function createServerMock() {
    return {close, listen};
  }
  createServerMock.__close = close;
  createServerMock.__listen = listen;
  return createServerMock;
});

describe('start', () => {
  const logger = {
    child: jest.fn(() => logger),
    debug: jest.fn(),
    error: jest.fn(),
    fatal: jest.fn(),
    info: jest.fn(),
    trace: jest.fn(),
    warn: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('starts the server listening on the given port.', async () => {
    const port = '8080';
    await start(
      {logger: {level: 'info', pretty: undefined}, server: {port}},
      logger,
    );
    // $FlowFixMe
    expect(createServer.__listen).toHaveBeenCalledWith(port);
  });

  it('closes the server on shutdown.', async () => {
    const shutdown = await start(
      {
        logger: {level: undefined, pretty: undefined},
        server: {port: '8080'},
      },
      logger,
    );
    // $FlowFixMe
    expect(createServer.__close).not.toHaveBeenCalled();
    await shutdown();
    // $FlowFixMe
    expect(createServer.__close).toHaveBeenCalled();
  });
});
