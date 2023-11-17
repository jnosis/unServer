import type { Hono } from 'hono';
import listEndPoints from 'express-list-endpoints';
import { IRouter } from 'opine';

export function getEndPoints(root: string, router: IRouter) {
  const endPoints = listEndPoints(router).map(({ path, methods }) =>
    methods.map((method) => `${method} ${root}${path}`)
  ).flat();

  return endPoints;
}

export function getHEndPoints(root: string, router: Hono) {
  const endPoints = router.routes.map(({ path, method }) =>
    `${method} ${root}${path}`
  ).flat();

  return endPoints;
}
