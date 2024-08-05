import type { LogRecord } from 'logtape';
import { createMiddleware } from 'hono/factory';
import { colorLog, formatMsg } from '~/util/message.ts';
import { configure, getConsoleSink, getLogger } from 'logtape';

export const formatter = (record: LogRecord) => {
  const time = new Date(record.timestamp).toLocaleString('en', {
    hour12: false,
    timeZone: 'Asia/Seoul',
    timeZoneName: 'short',
  });

  const msg = colorLog(
    record.level,
    `${time} [${record.level.toUpperCase()}] ${
      record.message[0] ? record.message + ' ' : ''
    }${formatMsg(record.properties)}`,
  );

  return [
    msg,
  ];
};

await configure({
  sinks: {
    console: getConsoleSink({ formatter }),
  },
  filters: {},
  loggers: [
    { category: 'unserver', level: 'debug', sinks: ['console'] },
    { category: ['logtape', 'meta'], level: 'warning', sinks: ['console'] },
  ],
});

export const log = getLogger(['unserver']);

export const logger = createMiddleware(async (c, next) => {
  const { method, path } = c.req;
  const start = Date.now();

  await next();

  const status = c.res.status;
  const message =
    c.res.headers.get('Content-Type')?.includes('application/json')
      ? (await c.res.clone().json()).message
      : '';

  if (status < 400) {
    log.debug('', { method, path, status, message, start });
  } else {
    log.error('', { method, path, status, message, start });
  }
});
