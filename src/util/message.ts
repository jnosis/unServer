import type { LogLevel } from 'logtape';
import { blue, bold, cyan, green, magenta, red, yellow } from '@std/fmt/colors';

type MessageOptions = {
  method: string;
  path: string;
  status: number;
  start: number;
  message?: string;
};

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
  if (isMessageOptions(options)) {
    const { method, path, status, start, message } = options;
    const routeMsg = `${method} ${path} ${colorStatus(status)} `;
    const elapsed = '- ' + time(start);
    const msg = message ? `${message} ${elapsed}` : elapsed;
    return routeMsg + msg;
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

function isMessageOptions(options: unknown): options is MessageOptions {
  return typeof (options as MessageOptions).method === 'string' &&
    typeof (options as MessageOptions).path === 'string' &&
    typeof (options as MessageOptions).status === 'number' &&
    typeof (options as MessageOptions).start === 'number' &&
    (typeof (options as MessageOptions).message === 'string' ||
      (options as MessageOptions).message === undefined);
}
