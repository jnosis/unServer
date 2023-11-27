import type { Hono } from 'hono';
import type { WorkData, WorkInputData } from '~/types.ts';
import { faker } from 'faker';
import { createNewUser } from '~/tests/auth_utils.ts';
import { supabaseWithAuth } from '~/supabase.ts';

export async function clearTable() {
  return await supabaseWithAuth.from('works').delete().neq('title', '');
}

export function makeWorkDetails(username: string): WorkInputData {
  const title = faker.commerce.product();
  return {
    title,
    description: faker.commerce.productDescription(),
    techs: [],
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

export async function createNewWorks(app: Hono, n = 1) {
  const { username, token } = await createNewUser(app);
  let works: WorkData[] = [];
  let cnt = 0;

  while (cnt++ < n) {
    const work = makeWorkDetails(username);
    const response = await app.request('/works', {
      method: 'post',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(work),
    });
    const { created_at, id } = await response.json();
    works = [...works, { ...work, created_at, id }];
  }
  return {
    works,
    username,
    token,
  };
}
