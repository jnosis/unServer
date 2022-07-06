import type { OpineRequest, OpineResponse } from 'opine';
import { UserModel, IUserController } from '../types.ts';
import { hash, compare } from '../helper/bcrypt.ts';
import { createJwtToken } from '../helper/jwt.ts';
import log from './../middleware/logger.ts';
import { throwError } from './../middleware/error_handler.ts';
import { convertToMessage } from './../util/message.ts';

export class UserController implements IUserController {
  constructor(private userRepository: UserModel) {}

  signup = async (req: OpineRequest, res: OpineResponse) => {
    const { username, password, name, email } = req.body;
    const { method, baseUrl } = req;
    const found = await this.userRepository.findByUsername(username);
    if (found) {
      return throwError({
        method,
        baseUrl,
        status: 409,
        message: `${username} already exists`,
      });
    }

    const hashed = await hash(password);
    const userId = await this.userRepository.create({
      username,
      password: hashed,
      name,
      email,
    });
    const token = await createJwtToken(userId);
    const msg = convertToMessage({
      method,
      baseUrl,
      status: 201,
    });
    log.debug(msg);

    res.setStatus(201).json({ token, username });
  };

  login = async (req: OpineRequest, res: OpineResponse) => {
    const { method, baseUrl } = req;
    const { username, password } = req.body;
    const user = await this.userRepository.findByUsername(username);
    if (!user) {
      return throwError({
        method,
        baseUrl,
        status: 401,
        message: `Invalid username or password`,
      });
    }
    const isValidPassword = await compare(password, user.password);
    if (!isValidPassword) {
      return throwError({
        method,
        baseUrl,
        status: 401,
        message: `Invalid username or password`,
      });
    }

    const token = await createJwtToken(user.id);
    const msg = convertToMessage({
      method,
      baseUrl,
      status: 201,
    });
    log.debug(msg);
    res.setStatus(201).json({ token, username });
  };

  logout = async (req: OpineRequest, res: OpineResponse) => {
    //
  };

  me = async (req: OpineRequest, res: OpineResponse) => {
    const { method, originalUrl } = req;
    const user = await this.userRepository.findById(req.body.userId);
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
