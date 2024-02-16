import type { Context } from 'hono';
import type { AuthEnv, IUserController, UserModel } from '~/types.ts';
import { deleteCookie, setCookie } from 'hono/helper';
import { compare, hash } from '~/helper/bcrypt.ts';
import { createJwtToken } from '~/helper/jwt.ts';
import { throwError } from '~/middleware/error_handler.ts';
import config from '~/config.ts';

export class UserController implements IUserController {
  #userRepository: UserModel;
  constructor(userRepository: UserModel) {
    this.#userRepository = userRepository;
  }

  signup = async (c: Context) => {
    const { username, password, name, email } = await c.req.json();
    const found = await this.#userRepository.findByUsername(username);
    if (found) {
      return throwError(409, `${username} already exists`);
    }

    const hashed = hash(password);
    const userId = await this.#userRepository.create({
      username,
      password: hashed,
      name,
      email,
    });
    const token = await createJwtToken(userId);

    setToken(c, token);
    return c.json({ token, username }, 201);
  };

  login = async (c: Context) => {
    const { username, password } = await c.req.json();
    const user = await this.#userRepository.findByUsername(username);
    if (!user) {
      return throwError(401, `Invalid username or password`);
    }
    const isValidPassword = compare(password, user.password);
    if (!isValidPassword) {
      return throwError(401, `Invalid username or password`);
    }

    const token = await createJwtToken(user.id);

    setToken(c, token);
    return c.json({ token, username }, 200);
  };

  logout = (c: Context) => {
    deleteCookie(c, 'token', {
      httpOnly: true,
      sameSite: 'None',
      secure: true,
    });

    return c.json({ message: 'User has been logged out' }, 200);
  };

  me = async (c: Context<AuthEnv>) => {
    const user = await this.#userRepository.findById(c.get('userId'));
    if (!user) {
      return throwError(404, 'User not found');
    }

    return c.json({ token: c.get('token'), username: user.username }, 200);
  };
}

function setToken(c: Context, token: string) {
  type CookieOptions = {
    domain?: string;
    expires?: Date;
    httpOnly?: boolean;
    maxAge?: number;
    path?: string;
    secure?: boolean;
    signingSecret?: string;
    sameSite?: 'Strict' | 'Lax' | 'None';
    partitioned?: boolean;
  };
  const options: CookieOptions = {
    maxAge: config.jwt.expiresInSec,
    httpOnly: true,
    sameSite: 'None',
    secure: true,
    path: '/',
  };

  setCookie(c, 'token', token, options);
}
