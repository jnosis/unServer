import { NextFunction, OpineRequest, OpineResponse } from 'opine';
import { Elmedeno } from 'elmedeno';

const elmedeno = new Elmedeno('opine');

export const elmedenoMiddleware = async (
  req: OpineRequest,
  res: OpineResponse,
  next: NextFunction,
) => {
  await elmedeno.protect(req, res);
  next();
};
