let dyingFunc;
let onDeath = jest.fn();

const death = jest.fn(newDyingFunc => {
  dyingFunc = newDyingFunc;
  onDeath();
});
death.__die = () => dyingFunc();
death.__setOnDeath = newOnDeath => {
  onDeath = newOnDeath;
};

module.exports = death;
