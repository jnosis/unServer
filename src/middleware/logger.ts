import { createMiddleware } from 'hono/helper';
import { ConsoleHandler, getLogger, setup } from '$std/log/mod.ts';
import { convertToMessage } from '~/util/message.ts';

setup({
  handlers: {
    functionFmt: new ConsoleHandler('DEBUG', {
      formatter: (logRecord) => {
        const time = logRecord.datetime.toLocaleString('en', {
          hour12: false,
          timeZone: 'Asia/Seoul',
          timeZoneName: 'short',
        });
        const args = logRecord.args.length > 0
          ? `${logRecord.args.join(' ')} `
          : '';
        return `${time} [${logRecord.levelName}] ${args}${logRecord.msg}`;
      },
    }),
  },

  loggers: {
    default: {
      level: 'DEBUG',
      handlers: ['functionFmt'],
    },
  },
});

export const log = getLogger();

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
