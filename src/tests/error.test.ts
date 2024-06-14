import { faker } from 'faker';
import { Hono } from 'hono';
import { assertEquals } from '@std/assert';
import { describe, it } from '@std/testing/bdd';
import {
  errorHandler,
  notFoundHandler,
  throwError,
} from '~/middleware/error_handler.ts';

describe('Error', () => {
  const app = new Hono();
  app.onError(errorHandler);
  app.notFound(notFoundHandler);
  app.get('/empty', (_) => {
    return throwError(500, '');
  });
  app.get('/internal_server_error', (_) => {
    throw new Error();
  });

  it('Not found handler', async () => {
    const path = faker.system.directoryPath();
    const response = await app.request(path, { method: 'get' });

    assertEquals(response.status, 404);
    assertEquals((await response.json()).message, `Route(${path}) not found`);
  });

  describe('Error handler', () => {
    it('empty message', async () => {
      const response = await app.request('/empty', { method: 'get' });

      assertEquals(response.status, 500);
      assertEquals((await response.json()).message, 'Something is wrong');
    });

    it('returns 500 when error is not HTTPException', async () => {
      const response = await app.request('/internal_server_error', {
        method: 'get',
      });

      assertEquals(response.status, 500);
      assertEquals(await response.text(), 'Internal Server Error');
    });
  });
});
