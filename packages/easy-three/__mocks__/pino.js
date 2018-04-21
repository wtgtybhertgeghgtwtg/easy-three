let debugFunc = jest.fn();
let errorFunc = jest.fn();
let fatalFunc = jest.fn();
let infoFunc = jest.fn();
let traceFunc = jest.fn();
let warnFunc = jest.fn();

const pino = jest.fn(() => ({
  debug: debugFunc,
  error: errorFunc,
  fatal: fatalFunc,
  info: infoFunc,
  trace: traceFunc,
  warn: warnFunc,
}));
pino.__setDebugFunc = newDebugFunc => {
  debugFunc = newDebugFunc;
};
pino.__setErrorFunc = newErrorFunc => {
  errorFunc = newErrorFunc;
};
pino.__setFatalFunc = newFatalFunc => {
  fatalFunc = newFatalFunc;
};
pino.__setInfoFunc = newInfoFunc => {
  infoFunc = newInfoFunc;
};
pino.__setTraceFunc = newTraceFunc => {
  traceFunc = newTraceFunc;
};
pino.__setWarnFunc = newWarnFunc => {
  warnFunc = newWarnFunc;
};

module.exports = pino;
