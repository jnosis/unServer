import { Router } from 'opine';

const router = Router();

type API = { path: string; router: typeof router };

export default function apiRouter(apis: API[]) {
  apis.forEach((api) => router.use(api.path, api.router));

  return router;
}
