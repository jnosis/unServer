import { createMiddleware } from 'hono/factory';
import * as v from 'valibot';
import { throwError } from '~/helper/error.ts';

export const validate = (schema: v.ObjectEntries) => {
  return createMiddleware(async (c, next) => {
    const validation = v.object(schema);
    const contentType = c.req.header('Content-Type');

    const result = await v.safeParseAsync(
      validation,
      isFormData(contentType || '')
        ? await c.req.parseBody()
        : await c.req.json(),
    );

    if (!result.success) {
      return throwError(400, result.issues[0].message);
    }

    await next();
  });
};

function isFormData(contentType: string): boolean {
  return contentType.includes('multipart/form-data');
}
