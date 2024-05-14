import { createMiddleware } from 'hono/helper';
import { z, ZodRawShape } from 'zod';
import { throwError } from '~/middleware/error_handler.ts';

export const validate = (schema: ZodRawShape) => {
  return createMiddleware(async (c, next) => {
    const validation = z.object(schema);
    const contentType = c.req.header('Content-Type');

    const result = await validation.safeParseAsync(
      isFormData(contentType || '')
        ? await c.req.parseBody()
        : await c.req.json(),
    );

    if (!result.success) {
      return throwError(400, result.error.errors[0].message);
    }

    await next();
  });
};

function isFormData(contentType: string): boolean {
  return contentType.includes('multipart/form-data');
}
