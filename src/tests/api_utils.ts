import type { Handler } from 'hono';
import { Hono } from 'hono';
import { createMiddleware } from 'hono/helper';
import { faker } from 'faker';

export function createRouter() {
  const root = faker.system.directoryPath();
  const path = '/' + faker.word.sample();
  const data = createData();

  const router = new Hono().get(path, ...createHandlers(), (c) => {
    return c.json(data);
  });

  return { root, router, path, data };
}

function createData() {
  const properties = ['foo', 'bar', 'bike', 'a', 'b', 'name', 'prop'];
  const data: Record<string, string | number> = {};

  for (const property of properties) {
    if (faker.datatype.boolean()) continue;
    data[property] = faker.datatype.boolean()
      ? faker.string.sample()
      : faker.number.int();
  }

  return data;
}

function createHandlers() {
  let handlers: Handler[] = [];
  let cnt = 0;

  while (cnt++ < Math.floor(Math.random() * 5)) {
    handlers = [
      ...handlers,
      createMiddleware(async (_, next) => {
        await next();
      }),
    ];
  }

  return handlers;
}
