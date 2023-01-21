import { faker } from 'faker';
import { SuperDeno } from 'superdeno';
import { WorkData, WorkInputData } from '~/types.ts';
import { createNewUser } from '~/tests/auth_utils.ts';
import db from '~/db.ts';

export async function clearCollection() {
  return await db.getDatabase.collection('works').deleteMany({});
}

export function makeWorkDetails(username: string): WorkInputData {
  const title = faker.commerce.product();
  return {
    title,
    description: faker.commerce.productDescription(),
    techs: {},
    repo: {
      url: `https://github.com/${username}/${title}`,
      branch: faker.git.branch(),
    },
    projectUrl: faker.internet.url(),
    thumbnail: {
      fileName: faker.random.words(10),
      fileUrl: faker.image.imageUrl(),
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
