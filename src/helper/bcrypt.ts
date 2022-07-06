import { genSalt, hash as h, compare as cp } from 'bcrypt';
import config from '../config.ts';

const { bcrypt } = config;

export async function hash(password: string) {
  const salt = await genSalt(bcrypt.saltRound);
  return await h(password, salt);
}

export async function compare(password: string, hashedPassword: string) {
  return await cp(password, hashedPassword);
}
