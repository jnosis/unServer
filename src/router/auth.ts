import { Router } from '../../deps.ts';
import { IUserController } from './../types.ts';

const router = Router();

export default function userRouter(userController: IUserController) {
  router.post('/signup', userController.signup);
  router.post('/login', userController.login);
  router.post('/logout', userController.logout);
  router.get('/me', userController.me);

  return router;
}
