import { Router } from 'opine';
import { faker } from 'faker';

export function createRouter() {
  const router = Router();
  const root = faker.system.directoryPath();
  const path = '/' + faker.random.word();
  const data = JSON.parse(faker.datatype.json());

  router.get(path, (_requestBase, res) => {
    res.json(data);
  });

  return { root, router, path, data };
}
