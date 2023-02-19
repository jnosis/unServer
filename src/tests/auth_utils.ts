import { faker } from 'faker';
import { SuperDeno } from 'superdeno';
import { UserSignupData } from '~/types.ts';
import { createJwtToken } from '~/helper/jwt.ts';
import db from '~/mongodb.ts';

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

export async function createToken() {
  return await createJwtToken(faker.database.mongodbObjectId());
}
