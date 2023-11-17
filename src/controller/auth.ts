import type { Context } from 'hono';
import type { CookieOptions, OpineRequest, OpineResponse } from 'opine';
import type {
  AuthEnv,
  AuthToken,
  IHUserController,
  IUserController,
  UserModel,
} from '~/types.ts';
import { deleteCookie, setCookie } from 'hono/helper';
import { compare, hash } from '~/helper/bcrypt.ts';
import { createJwtToken } from '~/helper/jwt.ts';
import { throwError } from '~/middleware/error_handler.ts';
import log from '~/middleware/logger.ts';
import { convertToMessage } from '~/util/message.ts';
import config from '~/config.ts';

export class UserController implements IUserController {
  #userRepository: UserModel;
  constructor(userRepository: UserModel) {
    this.#userRepository = userRepository;
  }

  signup = async (req: OpineRequest, res: OpineResponse<AuthToken>) => {
    const { username, password, name, email } = req.body;
    const { method, originalUrl } = req;
    const found = await this.#userRepository.findByUsername(username);
    if (found) {
      return throwError({
        method,
        baseUrl: originalUrl,
        status: 409,
        message: `${username} already exists`,
      });
    }

    const hashed = hash(password);
    const userId = await this.#userRepository.create({
      username,
      password: hashed,
      name,
      email,
    });
    const token = await createJwtToken(userId);
    const msg = convertToMessage({
      method,
      baseUrl: originalUrl,
      status: 201,
    });
    log.debug(msg);

    setToken(res, token);
    res.setStatus(201).json({ token, username });
  };

  login = async (req: OpineRequest, res: OpineResponse<AuthToken>) => {
    const { method, originalUrl } = req;
    const { username, password } = req.body;
    const user = await this.#userRepository.findByUsername(username);
    if (!user) {
      return throwError({
        method,
        baseUrl: originalUrl,
        status: 401,
        message: `Invalid username or password`,
      });
    }
    const isValidPassword = compare(password, user.password);
    if (!isValidPassword) {
      return throwError({
        method,
        baseUrl: originalUrl,
        status: 401,
        message: `Invalid username or password`,
      });
    }

    const token = await createJwtToken(user.id);
    const msg = convertToMessage({
      method,
      baseUrl: originalUrl,
      status: 200,
    });
    log.debug(msg);

    setToken(res, token);
    res.setStatus(200).json({ token, username });
  };

  logout = (req: OpineRequest, res: OpineResponse) => {
    const { method, originalUrl } = req;
    res.cookie('token', '', { httpOnly: true, sameSite: 'None', secure: true });
    const msg = convertToMessage({
      method,
      baseUrl: originalUrl,
      status: 200,
    });
    log.debug(msg);

    res.setStatus(200).json({ message: 'User has been logged out' });
  };

  me = async (req: OpineRequest, res: OpineResponse<AuthToken>) => {
    const { method, originalUrl } = req;
    const user = await this.#userRepository.findById(req.body.userId);
    if (!user) {
      return throwError({
        method,
        baseUrl: originalUrl,
        status: 404,
        message: 'User not found',
      });
    }

    const msg = convertToMessage({
      method,
      baseUrl: originalUrl,
      status: 200,
    });
    log.debug(msg);
    res.setStatus(200).json({ token: req.body.token, username: user.username });
  };
}

export class HUserController implements IHUserController {
  #userRepository: UserModel;
  constructor(userRepository: UserModel) {
    this.#userRepository = userRepository;
  }

  signup = async (c: Context) => {
    const { username, password, name, email } = await c.req.json();
    const { method, path } = c.req;
    const found = await this.#userRepository.findByUsername(username);
    if (found) {
      return throwError({
        method,
        baseUrl: path,
        status: 409,
        message: `${username} already exists`,
      });
    }

    const hashed = hash(password);
    const userId = await this.#userRepository.create({
      username,
      password: hashed,
      name,
      email,
    });
    const token = await createJwtToken(userId);
    const msg = convertToMessage({
      method,
      baseUrl: path,
      status: 201,
    });
    log.debug(msg);

    setHToken(c, token);
    return c.jsonT({ token, username }, 201);
  };

  login = async (c: Context) => {
    const { method, path } = c.req;
    const { username, password } = await c.req.json();
    const user = await this.#userRepository.findByUsername(username);
    if (!user) {
      return throwError({
        method,
        baseUrl: path,
        status: 401,
        message: `Invalid username or password`,
      });
    }
    const isValidPassword = compare(password, user.password);
    if (!isValidPassword) {
      return throwError({
        method,
        baseUrl: path,
        status: 401,
        message: `Invalid username or password`,
      });
    }

    const token = await createJwtToken(user.id);
    const msg = convertToMessage({
      method,
      baseUrl: path,
      status: 200,
    });
    log.debug(msg);

    setHToken(c, token);
    return c.jsonT({ token, username }, 200);
  };

  logout = (c: Context) => {
    const { method, path } = c.req;
    deleteCookie(c, 'token', {
      httpOnly: true,
      sameSite: 'None',
      secure: true,
    });
    const msg = convertToMessage({
      method,
      baseUrl: path,
      status: 200,
    });
    log.debug(msg);

    return c.jsonT({ message: 'User has been logged out' }, 200);
  };

  me = async (c: Context<AuthEnv>) => {
    const { method, path } = c.req;
    const user = await this.#userRepository.findById(c.get('userId'));
    if (!user) {
      return throwError({
        method,
        baseUrl: path,
        status: 404,
        message: 'User not found',
      });
    }

    const msg = convertToMessage({
      method,
      baseUrl: path,
      status: 200,
    });
    log.debug(msg);
    return c.jsonT({ token: c.get('token'), username: user.username }, 200);
  };
}

function setToken(res: OpineResponse, token: string) {
  const options: CookieOptions = {
    maxAge: config.jwt.expiresInSec,
    httpOnly: true,
    sameSite: 'None',
    secure: true,
  };

  res.cookie('token', token, options);
}

function setHToken(c: Context, token: string) {
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
  };

  setCookie(c, 'token', token, options);
}
