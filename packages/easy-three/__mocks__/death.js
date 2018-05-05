let dyingFunc;

const death = jest.fn(newDyingFunc => {
  dyingFunc = newDyingFunc;
});
death.__die = (signal, error) => dyingFunc(signal, error);

module.exports = death;
