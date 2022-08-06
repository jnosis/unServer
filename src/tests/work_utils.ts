import { faker } from 'faker';
import type { SuperDeno } from 'superdeno';
import { WorkData, WorkInputData } from '../types.ts';
import db from '../db.ts';
import { createNewUser } from './auth_utils.ts';

export async function clearCollection() {
  return await db.getDatabase.collection('works').deleteMany({});
}

export function makeWorkDetails(username: string): WorkInputData {
  const title = faker.commerce.productName();
  return {
    title,
    description: faker.commerce.productDescription(),
    techs: {},
    repo: {
      url: `https://github.com/${username}/${title}`,
      branch: faker.git.branch(),
    },
    thumbnail: {
      fileName: faker.random.words(10),
      fileURL: faker.image.imageUrl(),
    },
  };
}

export async function createNewWorks(request: SuperDeno, n = 1) {
  const { username, token } = await createNewUser(request);
  let works: (WorkData & { _id: string })[] = [];
  let cnt = 0;

  while (cnt++ < n) {
    const work = makeWorkDetails(username);
    const response = await request.post('/works').set({
      Authorization: `Bearer ${token}`,
    }).send(work);
    const { _id, id } = response.body;
    works = [...works, { ...work, _id, id }];
  }
  return {
    works,
    username,
    token,
  };
}
