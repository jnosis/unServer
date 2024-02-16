import { Hono } from 'hono';
import { cors, secureHeaders } from 'hono/middleware';
import { UserController } from '~/controller/auth.ts';
import { WorkController } from '~/controller/work.ts';
import { errorHandler } from '~/middleware/error_handler.ts';
import log from '~/middleware/logger.ts';
import { userRepository } from '~/model/auth.ts';
import { workRepository } from '~/model/work.ts';
import apiRouter from '~/router/api.ts';
import userRouter from '~/router/auth.ts';
import workRouter from '~/router/work.ts';
import config from '~/config.ts';

const app = new Hono();

app.use('*', secureHeaders());
app.use('*', cors({ ...config.cors, credentials: true }));
app.onError(errorHandler);

app.get('/', (c) => {
  return c.text('Welcome to unServer');
});

app.route(
  '/api',
  apiRouter([{
    path: '/auth',
    router: userRouter(new UserController(userRepository)),
  }, {
    path: '/works',
    router: workRouter(new WorkController(workRepository)),
  }]),
);

Deno.serve({
  port: 3000,
  onListen: ({ hostname, port }) => {
    log.info(`Server running on ${hostname}:${port}`);
  },
}, app.fetch);
