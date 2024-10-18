import { sign, verify } from 'hono/jwt';
import config from '~/config.ts';

const { jwt } = config;

const exp = Math.round((Date.now() + jwt.expiresInSec * 1000) / 1000);

export async function createJwtToken(id: string) {
  return await sign({ exp, id }, jwt.secretKey, 'HS512');
}

export async function verifyJwtToken(token: string) {
  try {
    return await verify(token, jwt.secretKey, 'HS512');
  } catch (_) {
    return { id: undefined };
  }
}
