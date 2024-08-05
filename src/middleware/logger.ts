import { createMiddleware } from 'hono/factory';
import { log } from '~/util/logger.ts';

export const logger = createMiddleware(async (c, next) => {
  const { method, path } = c.req;
  const start = Date.now();

  await next();

  const status = c.res.status;
  const message =
    c.res.headers.get('Content-Type')?.includes('application/json')
      ? (await c.res.clone().json()).message
      : '';

  if (status < 400) {
    log.debug('', { method, path, status, message, start });
  } else {
    log.error('', { method, path, status, message, start });
  }
});
