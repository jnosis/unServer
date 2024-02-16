import type { ErrorHandler } from 'hono';
import { HTTPException } from 'hono';

export const throwError = (status: number, message: string) => {
  throw new HTTPException(status, { message });
};

export const errorHandler: ErrorHandler = (err, c) => {
  const message = err.message || 'Something is wrong';
  if (err instanceof HTTPException) {
    const res = err.getResponse();
    return c.json({ message }, res);
  }
  return c.text('Internal Server Error', 500);
};
