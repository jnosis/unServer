import { Hono } from 'hono';
import log from '~/middleware/logger.ts';
import { getHEndPoints } from '~/util/endpoints.ts';
import { convertToMessage } from '~/util/message.ts';

type API = { path: string; router: Hono };

const hono = new Hono();

export default function apiRouter(apis: API[]) {
  const endPoints: { [path: string]: string[] } = {};

  apis.forEach((api) => {
    endPoints[api.path] = getHEndPoints(`/api${api.path}`, api.router);
    hono.route(api.path, api.router);
  });

  hono.get('/', (c) => {
    const { method, path } = c.req;

    const msg = convertToMessage({ method, baseUrl: path, status: 200 });
    log.debug(msg);
    return c.json(endPoints);
  });

  return hono;
}
