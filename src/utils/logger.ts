import pino, { Logger, LoggerOptions } from 'pino';

const serviceName = 'discord-selfbot-modular';
const isProduction = process.env.NODE_ENV === 'production';
const level = process.env.LOG_LEVEL ?? (isProduction ? 'info' : 'debug');

const options: LoggerOptions = {
  level,
  base: { service: serviceName },
  timestamp: pino.stdTimeFunctions.isoTime,
};

if (!isProduction) {
  options.transport = {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'HH:MM:ss.l',
      ignore: 'pid,hostname',
    },
  };
}

const logger = pino(options);

export const getLogger = (bindings?: pino.Bindings | string): Logger => {
  if (!bindings) {
    return logger;
  }

  if (typeof bindings === 'string') {
    return logger.child({ module: bindings });
  }

  return logger.child(bindings);
};

export default logger;
