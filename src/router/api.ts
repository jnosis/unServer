import type { Env, Schema } from 'hono';
import type { AuthEnv } from '~/types.ts';
import { Hono } from 'hono';
import { getEndPoints } from '~/util/endpoints.ts';

type BlankSchema = Record<string | number | symbol, never>;
type API<
  E extends Env = AuthEnv,
  S extends Schema = BlankSchema,
  BasePath extends string = '/',
> = {
  path: string;
  router: Hono<E, S, BasePath>;
};

// deno-lint-ignore no-explicit-any
type AnyAPI = API<AuthEnv, any, any>;

const hono = new Hono<AuthEnv>();

export default function apiRouter(apis: Array<API | AnyAPI>) {
  const endPoints: { [path: string]: string[] } = {};

  apis.forEach((api) => {
    endPoints[api.path] = getEndPoints(`/api${api.path}`, api.router);
    hono.route(api.path, api.router);
  });

  hono.get('/', (c) => {
    return c.json(endPoints);
  });

  return hono;
}
