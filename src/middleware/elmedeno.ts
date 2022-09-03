import { NextFunction, OpineRequest, OpineResponse } from 'opine';
import { Elmedeno } from '../util/elmedeno.ts';

const elmedeno = new Elmedeno();

export const elmedenoMiddleware = async (
  req: OpineRequest,
  res: OpineResponse,
  next: NextFunction,
) => {
  await elmedeno.protect(req, res);
  next();
};
