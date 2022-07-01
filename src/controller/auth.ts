import { OpineRequest, OpineResponse } from '../../deps.ts';
import { UserModel, IUserController } from '../types.ts';

export class UserController implements IUserController {
  constructor(private userRepository: UserModel) {}

  signup = async (_req: OpineRequest, res: OpineResponse) => {
    //
  };

  login = async (req: OpineRequest, res: OpineResponse) => {
    //
  };

  logout = async (req: OpineRequest, res: OpineResponse) => {
    //
  };

  me = async (req: OpineRequest, res: OpineResponse) => {
    //
  };
}
