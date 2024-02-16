import { Hono } from 'hono';
import log from '~/middleware/logger.ts';
import { getEndPoints } from '~/util/endpoints.ts';
import { convertToMessage } from '~/util/message.ts';

type API = { path: string; router: Hono };

const hono = new Hono();

export default function apiRouter(apis: API[]) {
  const endPoints: { [path: string]: string[] } = {};

  apis.forEach((api) => {
    endPoints[api.path] = getEndPoints(`/api${api.path}`, api.router);
    hono.route(api.path, api.router);
  });

  hono.get('/', (c) => {
    const { method, path } = c.req;

    const [msg, args] = convertToMessage({ method, path, status: 200 });
    log.debug(msg, ...args);
    return c.json(endPoints);
  });

  return hono;
}
