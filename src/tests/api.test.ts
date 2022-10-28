import { assertEquals } from 'testing/asserts.ts';
import { describe, it } from 'testing/bdd.ts';
import { superdeno } from 'superdeno';
import { json, opine } from 'opine';
import apiRouter from '../router/api.ts';
import { createRouter } from './api_utils.ts';

describe('Api Router', () => {
  it('gets data from added routers', async () => {
    const app = opine();
    const { root, router, path, data } = createRouter();

    app.use(json());
    app.use('/api', apiRouter([{ path: root, router }]));

    const request = superdeno(app);

    const response = await request.get(`/api${root}${path}`);

    assertEquals(response.body, { ...data });
  });
});
