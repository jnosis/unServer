import type { Context, Next } from 'hono';
import type { AuthEnv } from '~/types.ts';
import { getCookie } from '~/helper/cookie.ts';
import { throwError } from '~/helper/error.ts';
import { verifyJwtToken } from '~/helper/jwt.ts';
import { userRepository } from '~/model/auth.ts';

const AUTH_ERROR = {
  status: 401,
  message: 'Authorization Error',
} as const;

export const isAuth = async (c: Context<AuthEnv>, next: Next) => {
  let token;

  const authHeader = c.req.header('Authorization');

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else {
    token = getCookie(c.req.raw.headers, 'token');
  }

  if (!token) {
    return throwError(AUTH_ERROR.status, AUTH_ERROR.message);
  }

  try {
    const decoded = await verifyJwtToken(token);
    const user = await userRepository.findById(decoded.id as string);
    if (!user) {
      return throwError(AUTH_ERROR.status, AUTH_ERROR.message);
    }
    c.set('userId', user.id);
    c.set('token', token);
    await next();
  } catch (e) {
    throw e;
  }
};
