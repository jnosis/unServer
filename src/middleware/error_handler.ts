import { ErrorRequestHandler as ErrorHandler } from 'opine';
import { Err } from '../types.ts';
import log from './logger.ts';
import { convertToMessage } from './../util/message.ts';

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
