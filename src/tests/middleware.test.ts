import { json, opine } from 'opine';
import { superdeno } from 'superdeno';
import { assertEquals } from 'testing/asserts.ts';
import { describe, it } from 'testing/bdd.ts';
import rateLimit from '~/middleware/rate_limiter.ts';
import { createRouter } from '~/tests/api_utils.ts';
import config from '~/config.ts';

const windowMs = config.rateLimit.windowMs;
const maxRequest = config.rateLimit.maxRequest;

describe('Middleware', { sanitizeResources: false, sanitizeOps: false }, () => {
  it('rate limit', async () => {
    const app = opine();
    const { root, router, path, data } = createRouter();

    app.use(json());
    app.use(rateLimit);
    app.use(root, router);

    const request = superdeno(app);

    let cnt = 0;

    while (cnt++ < maxRequest) {
      const response = await request.get(`${root}${path}`);
      assertEquals(response.body, { ...data });
    }

    const response = await request.get(`${root}${path}`);

    assertEquals(response.status, 429);
    assertEquals(
      response.body.message,
      `You can only make ${maxRequest} requests every ${windowMs}ms`,
    );
  });
});
