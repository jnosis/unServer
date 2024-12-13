import { hash as h, verify } from '@stdext/crypto/hash/bcrypt';
import config from '~/config.ts';

const bcryptOptions = { cost: config.bcrypt.saltRound };

export function hash(password: string) {
  return h(password, bcryptOptions);
}

export function compare(password: string, hashedPassword: string) {
  return verify(password, hashedPassword, bcryptOptions);
}
