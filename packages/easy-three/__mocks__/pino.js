import abstractLogging from 'abstract-logging';
import objectMap from 'object.map';

const pino = jest.fn(() => {
  pino.__logger = objectMap(abstractLogging, () => jest.fn());
  return pino.__logger;
});

export default pino;
