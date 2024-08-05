import type { LogLevel, LogRecord } from 'logtape';
import { configure, getConsoleSink, getLogger } from 'logtape';
import { blue, bold, cyan, green, magenta, red, yellow } from '@std/fmt/colors';

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

export const colorLog = (level: LogLevel, message: string) => {
  const out: { [key: string]: string } = {
    info: blue(message),
    debug: message,
    warning: yellow(message),
    error: red(message),
    fatal: bold(red(message)),
  };

  return out[level];
};

export const formatMsg = (options: unknown): string => {
  if (isMsgOptions(options)) {
    const { start } = options;
    const elapsed = '- ' + time(start);
    if (isRouteMsgOptions(options)) {
      const { method, path, status, message } = options;
      const routeMsg = `${method} ${path} ${colorStatus(status)} `;
      const msg = message ? `${message} ${elapsed}` : elapsed;
      return routeMsg + msg;
    }
    return elapsed;
  }
  return '';
};

export function time(start: number) {
  return (Date.now() - start) + 'ms';
}

export const colorStatus = (status: number) => {
  const out: { [key: string]: string } = {
    7: magenta(`${status}`),
    5: red(`${status}`),
    4: yellow(`${status}`),
    3: cyan(`${status}`),
    2: green(`${status}`),
    1: green(`${status}`),
    0: yellow(`${status}`),
  };

  const calculateStatus = (status / 100) | 0;

  return out[calculateStatus];
};

type MsgOptions = {
  start: number;
};

type RouteMsgOptions = {
  method: string;
  path: string;
  status: number;
  start: number;
  message?: string;
};

function isMsgOptions(options: unknown): options is MsgOptions {
  return typeof (options as RouteMsgOptions).start === 'number';
}

function isRouteMsgOptions(options: unknown): options is RouteMsgOptions {
  return isMsgOptions(options) &&
    typeof (options as RouteMsgOptions).method === 'string' &&
    typeof (options as RouteMsgOptions).path === 'string' &&
    typeof (options as RouteMsgOptions).status === 'number' &&
    (typeof (options as RouteMsgOptions).message === 'string' ||
      (options as RouteMsgOptions).message === undefined);
}
