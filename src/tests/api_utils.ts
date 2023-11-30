import { faker } from 'faker';
import { Hono } from 'hono';

export function createRouter() {
  const root = faker.system.directoryPath();
  const path = '/' + faker.word.sample();
  const data = createData();

  const router = new Hono().get(path, (c) => {
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
