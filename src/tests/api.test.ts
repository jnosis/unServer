import { Hono } from 'hono';
import { assertEquals } from '@std/assert';
import { describe, it } from '@std/testing/bdd';
import apiRouter from '~/router/api.ts';
import { createRouter } from '~/tests/api_utils.ts';

describe('Api Router', () => {
  it('gets end points', async () => {
    const app = new Hono();
    const { root, router, path } = createRouter();

    app.route('/api', apiRouter([{ path: root, router }]));

    const response = await app.request('/api', { method: 'get' });

    assertEquals(await response.json(), { [root]: [`GET /api${root}${path}`] });
  });

  it('gets data from added routers', async () => {
    const app = new Hono();
    const { root, router, path, data } = createRouter();

    app.route('/api', apiRouter([{ path: root, router }]));

    const response = await app.request(`/api${root}${path}`);

    assertEquals(await response.json(), { ...data });
  });
});
