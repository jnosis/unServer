import { Router } from 'opine';
import { getEndPoints } from '../util/endpoints.ts';

const router = Router();

type API = { path: string; router: typeof router };

export default function apiRouter(apis: API[]) {
  const endPoints: { [path: string]: string[] } = {};

  apis.forEach((api) => {
    endPoints[api.path] = getEndPoints(`/api${api.path}`, api.router);
    router.use(api.path, api.router);
  });

  router.get('/', (_req, res) => {
    res.send(endPoints);
  });

  return router;
}
