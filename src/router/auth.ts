import type { IHUserController, IUserController } from '~/types.ts';
import { Hono } from 'hono';
import { Router } from 'opine';
import { z } from 'zod';
import { isAuth, isHAuth } from '~/middleware/auth.ts';
import { validate } from '~/middleware/validator.ts';

const router = Router();

const validateCredential = validate({
  username: z.string().min(1, { message: 'Username should be not empty' }),
  password: z.string().min(1, { message: 'Password should be not empty' }),
});

const validateSignup = [
  ...validateCredential,
  ...validate({
    name: z.string().min(1, { message: 'Name should be not empty' }),
    email: z.string().email('Invalid email'),
  }),
];

export default function userRouter(userController: IUserController) {
  router.post('/signup', validateSignup, userController.signup);
  router.post('/login', validateCredential, userController.login);
  router.post('/logout', userController.logout);
  router.get('/me', isAuth, userController.me);

  return router;
}

const auth = new Hono();

export function hUserRouter(userController: IHUserController) {
  auth.post('/signup', userController.signup);
  auth.post('/login', userController.login);
  auth.post('/logout', userController.logout);
  auth.get('/me', isHAuth, userController.me);

  return auth;
}
