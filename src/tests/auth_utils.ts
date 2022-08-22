import { faker } from 'faker';
import type { SuperDeno } from 'superdeno';
import { UserSignupData } from '../types.ts';
import db from '../db.ts';

export async function clearCollection() {
  return await db.getDatabase.collection('auth').deleteMany({});
}

export function makeUserDetails(): UserSignupData {
  return {
    username: faker.name.middleName(),
    password: faker.internet.password(),
    name: faker.name.findName(),
    email: faker.internet.email(),
  };
}

export async function createNewUser(request: SuperDeno) {
  const user = makeUserDetails();
  const createdUser = await request.post('/auth/signup').send(user);
  return {
    ...user,
    token: createdUser.body.token,
    res: createdUser,
  };
}
