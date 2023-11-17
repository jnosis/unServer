import { Hono } from 'hono';
import { cors as honoCors, secureHeaders } from 'hono/middleware';
import { CorsOptions, opineCors } from 'cors';
import { json, opine } from 'opine';
import { UserController } from '~/controller/auth.ts';
import { WorkController } from '~/controller/work.ts';
import { elmedenoMiddleware } from '~/middleware/elmedeno.ts';
import { errorHandler } from '~/middleware/error_handler.ts';
import log from '~/middleware/logger.ts';
import rateLimit from '~/middleware/rate_limiter.ts';
import { userRepository } from '~/model/auth.ts';
import { workRepository } from '~/model/work.ts';
import apiRouter from '~/router/api.ts';
import userRouter from '~/router/auth.ts';
import workRouter from '~/router/work.ts';
import config from '~/config.ts';

const { cors } = config;

const app = opine();
const hono = new Hono();

const corsOptions: CorsOptions = {
  origin: cors.origin,
  optionsSuccessStatus: 200,
  credentials: true,
};

app.use(json());
app.use(elmedenoMiddleware);
app.use(opineCors(corsOptions));
app.use(rateLimit);
hono.use('*', secureHeaders());
hono.use('*', honoCors());

app.get('/', (_req, res) => {
  res.send('Welcome to unServer');
});
hono.get('/', (c) => {
  return c.text('Welcome to unServer');
});

app.use(
  '/api',
  apiRouter([{
    path: '/auth',
    router: userRouter(new UserController(userRepository)),
  }, {
    path: '/works',
    router: workRouter(new WorkController(workRepository)),
  }]),
);

app.use(errorHandler);
hono.onError((err, c) => {
  console.error(`${err}`);
  return c.text('');
});

Deno.serve({
  port: 3000,
  onListen: ({ hostname, port }) => {
    log.info(`Server running on ${hostname}:${port}`);
  },
}, hono.fetch);
// app.listen({ port: 3000 }, () => {
//   log.info(`Server is started...`);
// });
