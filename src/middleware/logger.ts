import type { ConsoleHandlerOptions, LogRecord } from '$std/log/mod.ts';
import type { HttpArgs } from '~/types.ts';
import { createMiddleware } from 'hono/helper';
import { ConsoleHandler, Logger as BaseLogger } from '$std/log/mod.ts';
import { convertToMessage, formatArgs } from '~/util/message.ts';

export const formatter = (logRecord: LogRecord) => {
  const time = logRecord.datetime.toLocaleString('en', {
    hour12: false,
    timeZone: 'Asia/Seoul',
    timeZoneName: 'short',
  });
  const args = formatArgs(logRecord.args);
  return `${time} [${logRecord.levelName}] ${args}${logRecord.msg}`;
};

type Args = HttpArgs | [];

class Logger {
  #log: BaseLogger;
  constructor(options: ConsoleHandlerOptions) {
    this.#log = new BaseLogger('default', 'DEBUG', {
      handlers: [new ConsoleHandler('DEBUG', options)],
    });
  }

  get level() {
    return this.#log.level;
  }

  get levelName() {
    return this.#log.levelName;
  }

  get loggerName() {
    return this.#log.loggerName;
  }

  get handlers() {
    return this.#log.handlers;
  }

  debug(msg: string, ...args: Args) {
    return this.#log.debug(msg, ...args);
  }

  info(msg: string, ...args: Args) {
    return this.#log.info(msg, ...args);
  }

  warn(msg: string, ...args: Args) {
    return this.#log.warn(msg, ...args);
  }

  error(msg: string, ...args: Args) {
    return this.#log.error(msg, ...args);
  }

  critical(msg: string, ...args: Args) {
    return this.#log.critical(msg, ...args);
  }
}

export const log = new Logger({ formatter });

export const logger = createMiddleware(async (c, next) => {
  const { method, path } = c.req;
  const start = Date.now();

  await next();

  const status = c.res.status;
  const message =
    c.res.headers.get('Content-Type')?.includes('application/json')
      ? (await c.res.json()).message
      : '';
  const [msg, args] = convertToMessage({
    method,
    path,
    status,
    start,
    message,
  });
  if (status < 400) log.debug(msg, ...args);
  else log.error(msg, ...args);
});
