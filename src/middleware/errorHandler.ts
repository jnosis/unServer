import { ErrorRequestHandler as ErrorHandler } from '../../deps.ts';
import { Err } from '../types.ts';
import log from './logger.ts';

export const throwError = (options: Err) => {
  throw options;
};

export const errorHandler: ErrorHandler = (err: Err, _req, res, _next) => {
  log.error(
    `${err.method} /${err.path}/${err.param} ${err.status} ${err.message}`
  );
  res.setStatus(err.status || 500).send(err.message || 'Something is wrong');
};
