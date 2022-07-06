import { Router } from 'opine';
import { IUserController } from './../types.ts';
import { isAuth } from './../middleware/auth.ts';

const router = Router();

export default function userRouter(userController: IUserController) {
  router.post('/signup', userController.signup);
  router.post('/login', userController.login);
  router.post('/logout', userController.logout);
  router.get('/me', isAuth, userController.me);

  return router;
}
