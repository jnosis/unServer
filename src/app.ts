import { Hono } from'hono';
import { cors } from'hono/cors';
import { secureHeaders } from'hono/secure-headers';
import { UserController } from '~/controller/auth.ts';
import { UploadController } from '~/controller/upload.ts';
import { WorkController } from '~/controller/work.ts';
import { errorHandler, notFoundHandler } from '~/middleware/error_handler.ts';
import { log, logger } from '~/middleware/logger.ts';
import { userRepository } from '~/model/auth.ts';
import { uploadRepository } from '~/model/upload.ts';
import { workRepository } from '~/model/work.ts';
import apiRouter from '~/router/api.ts';
import userRouter from '~/router/auth.ts';
import uploadRouter from '~/router/upload.ts';
import workRouter from '~/router/work.ts';
import { time } from '~/util/message.ts';
import config from '~/config.ts';

const start = Date.now();

const app = new Hono();

app.use('*', secureHeaders());
app.use('*', cors({ ...config.cors, credentials: true }));
app.use(logger);

app.notFound(notFoundHandler);
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
  }, {
    path: '/upload',
    router: uploadRouter(new UploadController(uploadRepository)),
  }]),
);

Deno.serve({
  port: 3000,
  onListen: ({ hostname, port }) => {
    log.info(`Server running on ${hostname}:${port} - ${time(start)}`);
  },
}, app.fetch);
