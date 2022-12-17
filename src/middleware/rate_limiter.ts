import rateLimit from 'https://esm.sh/express-rate-limit@6.7.0';
import {
  NextFunction,
  OpineRequest,
  OpineResponse,
  RequestHandler,
} from 'opine';
import config from '../config.ts';
import { errorHandler } from './error_handler.ts';

const windowMs = config.rateLimit.windowMs;
const max = config.rateLimit.maxRequest;

export default rateLimit({
  windowMs,
  max,
  message: `You can only make ${max} requests every ${windowMs}ms`,
  handler: (req, res, next, options) => {
    const { method, url } = req as OpineRequest;

    const err = {
      status: options.statusCode,
      method,
      message: options.message,
      baseUrl: url,
    };
    errorHandler(
      err,
      req as OpineRequest,
      res as OpineResponse,
      next as NextFunction,
    );
  },
}) as unknown as RequestHandler;
