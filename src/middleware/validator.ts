import { createMiddleware } from 'hono/helper';
import { z, ZodRawShape } from 'zod';
import { throwError } from '~/middleware/error_handler.ts';

export const validate = (schema: ZodRawShape) => {
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
