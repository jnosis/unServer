import { Hono } from'hono';
import { getEndPoints } from '~/util/endpoints.ts';

type API = { path: string; router: Hono };

const hono = new Hono();

export default function apiRouter(apis: API[]) {
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
