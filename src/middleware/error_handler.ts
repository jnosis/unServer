import type { ErrorHandler } from 'hono';
import { HTTPException } from 'hono';
import log from '~/middleware/logger.ts';
import { convertToMessage } from '~/util/message.ts';

export const throwError = (status: number, message: string) => {
  throw new HTTPException(status, { message });
};

export const errorHandler: ErrorHandler = (err, c) => {
  const { method, path } = c.req;
  const message = err.message || 'Something is wrong';
  const raw = { method, path, message };
  if (err instanceof HTTPException) {
    const [msg, args] = convertToMessage({ ...raw, status: err.status });
    log.error(msg, ...args);
    const res = err.getResponse();
    return c.json({ message }, res);
  }
  const [msg, args] = convertToMessage({ ...raw, status: 500 });
  log.error(msg, ...args);
  return c.text('Internal Server Error', 500);
};
