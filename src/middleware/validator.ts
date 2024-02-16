import { createMiddleware } from 'hono/helper';
import { z, ZodRawShape } from 'zod';
import { throwError } from '~/middleware/error_handler.ts';

export const validate = (schema: ZodRawShape) => {
  return createMiddleware(async (c, next) => {
    const validation = z.object(schema);
    const result = await validation.safeParseAsync(await c.req.json());

    if (!result.success) {
      return throwError(400, result.error.errors[0].message);
    }

    await next();
  });
};
