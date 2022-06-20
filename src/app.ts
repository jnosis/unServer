import { Application, oakCors } from '../deps.ts';
import router from './router/router.ts';

const app = new Application();

app.use(oakCors());

app.use(router.routes());

app.use(async (context, next) => {
  try {
    await next();
  } catch (error) {
    context.response.status = error.status;
    const { message = 'unknown error', status = 500, stack = null } = error;
    context.response.body = { message, status, stack };
    context.response.type = 'json';
  }
});

await app.listen({ port: 8080 });
