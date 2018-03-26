let errorFunc = jest.fn();
let infoFunc = jest.fn();
let warnFunc = jest.fn();

const pino = jest.fn(() => ({
  error: errorFunc,
  info: infoFunc,
  warn: warnFunc,
}));
pino.__setErrorFunc = newErrorFunc => {
  errorFunc = newErrorFunc;
};
pino.__setInfoFunc = newInfoFunc => {
  infoFunc = newInfoFunc;
};
pino.__setWarnFunc = newWarnFunc => {
  warnFunc = newWarnFunc;
};

module.exports = pino;
