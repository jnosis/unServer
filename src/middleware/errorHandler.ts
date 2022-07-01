import { ErrorRequestHandler as ErrorHandler } from '../../deps.ts';
import { Err } from '../types.ts';

export const throwError = (options: Err) => {
  throw options;
};

export const errorHandler: ErrorHandler = (err: Err, _req, res, _next) => {
  console.log(err);
  res.setStatus(err.status || 500).send(err.message || 'Something is wrong');
};
