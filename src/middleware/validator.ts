import type { NextFunction, OpineRequest, OpineResponse } from 'opine';
import { createMiddleware } from 'hono/helper';
import { z, ZodRawShape } from 'zod';
import { throwError } from '~/middleware/error_handler.ts';

export const validate = (schema: ZodRawShape) => [async (
  req: OpineRequest,
  _res: OpineResponse,
  next: NextFunction,
) => {
  const validation = z.object(schema);
  const result = await validation.safeParseAsync(req.body);

  if (result.success) {
    return next();
  }

  const { method, originalUrl } = req;

  return throwError({
    method,
    baseUrl: originalUrl,
    status: 400,
    message: result.error.errors[0].message,
  });
}];

export const hValidate = (schema: ZodRawShape) => {
  return createMiddleware(async (c, next) => {
    const validation = z.object(schema);
    const result = await validation.safeParseAsync(await c.req.json());

    if (!result.success) {
      const { method, path } = c.req;

      return throwError({
        method,
        baseUrl: path,
        status: 400,
        message: result.error.errors[0].message,
      });
    }

    await next();
  });
};
