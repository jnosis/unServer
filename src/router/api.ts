import { Hono } from 'hono';
import { Router } from 'opine';
import log from '~/middleware/logger.ts';
import { getEndPoints, getHEndPoints } from '~/util/endpoints.ts';
import { convertToMessage } from '~/util/message.ts';

const router = Router();

type API = { path: string; router: typeof router };

export default function apiRouter(apis: API[]) {
  const endPoints: { [path: string]: string[] } = {};

  apis.forEach((api) => {
    endPoints[api.path] = getEndPoints(`/api${api.path}`, api.router);
    router.use(api.path, api.router);
  });

  router.get('/', (req, res) => {
    const { method, originalUrl } = req;

    const msg = convertToMessage({ method, baseUrl: originalUrl, status: 200 });
    log.debug(msg);
    res.send(endPoints);
  });

  return router;
}

type HAPI = { path: string; router: Hono };

const hono = new Hono();

export function hApiRouter(apis: HAPI[]) {
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
