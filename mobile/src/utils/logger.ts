const noop = (..._args: unknown[]) => {};

const logger = __DEV__
  ? { log: console.log, warn: console.warn, error: console.error, info: console.info }
  : { log: noop, warn: noop, error: noop, info: noop };

export default logger;
