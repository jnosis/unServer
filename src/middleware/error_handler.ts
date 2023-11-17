import { ErrorRequestHandler as ErrorHandler } from 'opine';
import type { Handler } from 'hono';
import log from '~/middleware/logger.ts';
import { convertToMessage } from '~/util/message.ts';

type Err = {
  status: number;
  method: string;
  baseUrl: string;
  param?: string;
  message: string;
};

export const throwError = (options: Err) => {
  throw options;
};

export const errorHandler: ErrorHandler = (err: Err, _req, res, _next) => {
  const msg = convertToMessage(err);
  log.error(msg);
  res
    .setStatus(err.status || 500)
    .json({ message: err.message || 'Something is wrong' });
};

export const honoErrorHandler: Handler = async (c, next) => {
  try {
    await next();
  } catch (err) {
    const msg = convertToMessage(err);
    const message = { message: err.message || 'Something is wrong' };
    log.error(msg);
    if (isErr(err)) {
      return c.json({ message }, err.status || 500);
    }
    return c.json({ message }, 500);
  }
};

function isErr(err: unknown): err is Err {
  return (
    !!(err as Err).method &&
    !!(err as Err).baseUrl &&
    !!(err as Err).status
  );
}
