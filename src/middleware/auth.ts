import { OpineRequest, OpineResponse, NextFunction } from '../../deps.ts';
import { verifyJwtToken } from '../helper/jwt.ts';
import * as userRepository from '../model/auth.ts';
import { throwError } from './../middleware/error_handler.ts';

const AUTH_ERROR = {
  status: 401,
  message: 'Authorization Error',
};

export const isAuth = async (
  req: OpineRequest,
  _res: OpineResponse,
  next: NextFunction
) => {
  const authHeader = req.get('Authorization');
  const { method, originalUrl } = req;
  if (!(authHeader && authHeader.startsWith('Bearer '))) {
    return throwError({
      method,
      baseUrl: originalUrl,
      ...AUTH_ERROR,
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = await verifyJwtToken(token);
    const user = await userRepository.findById(decoded.id);
    if (!user) {
      return throwError({
        method,
        baseUrl: originalUrl,
        ...AUTH_ERROR,
      });
    }
    req.body.userId = user.id;
    req.body.token = token;
    next();
  } catch (_e) {
    return throwError({
      method,
      baseUrl: originalUrl,
      ...AUTH_ERROR,
    });
  }
};
