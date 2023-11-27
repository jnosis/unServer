import { faker } from 'faker';
import { Hono } from 'hono';

export function createRouter() {
  const root = faker.system.directoryPath();
  const path = '/' + faker.word.sample();
  const data = JSON.parse(faker.datatype.json());

  const router = new Hono().get(path, (c) => {
    return c.json(data);
  });

  return { root, router, path, data };
}
