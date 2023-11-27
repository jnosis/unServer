import type { Hono } from 'hono';
import type { UserSignupData } from '~/types.ts';
import { faker } from 'faker';
import { createJwtToken } from '~/helper/jwt.ts';
import db from '~/mongodb.ts';

export async function clearCollection() {
  return await db.getDatabase.collection('auth').deleteMany({});
}

export function makeUserDetails(): UserSignupData {
  return {
    username: faker.person.middleName(),
    password: faker.internet.password(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
  };
}

export async function createNewUser(app: Hono) {
  const user = makeUserDetails();
  const createdUser = await app.request('/auth/signup', {
    method: 'post',
    body: JSON.stringify(user),
  });
  return {
    ...user,
    token: (await createdUser.json()).token,
    res: createdUser,
  };
}

export async function createToken() {
  return await createJwtToken(faker.database.mongodbObjectId());
}
