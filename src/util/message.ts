import type { HttpArgs } from '~/types.ts';
import { cyan, green, magenta, red, yellow } from '@std/fmt/colors';

type MessageOptions = {
  method: string;
  path: string;
  status: number;
  start: number;
  message?: string;
};

export const convertToMessage = (
  options: MessageOptions,
): [string, HttpArgs] => {
  const { method, path, status, start, message } = options;
  const elapsed = '- ' + time(start);
  const msg = message ? `${message} ${elapsed}` : elapsed;
  const args: HttpArgs = [method, path, status];
  return [msg, args];
};

export function time(start: number) {
  return (Date.now() - start) + 'ms';
}

export const formatArgs = (args: unknown[]): string => {
  return args.length > 0
    ? isHttpArgs(args)
      ? `${[args[0], args[1], colorStatus(args[2])].join(' ')} `
      : args.join(' ')
    : '';
};

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

function isHttpArgs(args: unknown[]): args is HttpArgs {
  return args.length === 3
    ? (typeof args[0] === 'string' && typeof args[1] === 'string' &&
      typeof args[2] === 'number')
    : false;
}
