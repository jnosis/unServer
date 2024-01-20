import type { Hono } from 'hono';

export function getEndPoints(root: string, router: Hono) {
  const endPoints = router.routes
    .filter(({ handler }) => handler.length <= 1)
    .map(({ path, method }) => `${method} ${root}${path}`).flat();

  return endPoints;
}
