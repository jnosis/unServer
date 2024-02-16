import type { Context, Next } from 'hono';
import { getCookie } from '~/helper/cookie.ts';
import { verifyJwtToken } from '~/helper/jwt.ts';
import { userRepository } from '~/model/auth.ts';
import { throwError } from '~/middleware/error_handler.ts';

const AUTH_ERROR = {
  status: 401,
  message: 'Authorization Error',
};

export const isAuth = async (c: Context, next: Next) => {
  let token;

  const authHeader = c.req.header('Authorization');
  c.set('test', 'test');
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
    const user = await userRepository.findById(decoded.id);
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
