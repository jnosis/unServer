import { genSaltSync, hashSync as h, compareSync as cp } from 'bcrypt';
import config from '../config.ts';

const { bcrypt } = config;

export function hash(password: string) {
  const salt = genSaltSync(bcrypt.saltRound);
  return h(password, salt);
}

export function compare(password: string, hashedPassword: string) {
  return cp(password, hashedPassword);
}
