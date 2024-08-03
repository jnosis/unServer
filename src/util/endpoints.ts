import type { Env, Hono, Schema } from 'hono';

export function getEndPoints<
  E extends Env,
  S extends Schema,
  BasePath extends string,
>(root: string, router: Hono<E, S, BasePath>) {
  const endPoints = router.routes
    .filter(({ handler }) => handler.length <= 1)
    .map(({ path, method }) => `${method} ${root}${path}`).flat();

  return endPoints;
}
