import type { IUserController } from '~/types.ts';
import { Hono } from 'hono';
import { z } from 'zod';
import { isAuth } from '~/middleware/auth.ts';
import { validate } from '~/middleware/validator.ts';

const auth = new Hono();

const validateCredential = validate({
  username: z.string().min(1, { message: 'Username should be not empty' }),
  password: z.string().min(1, { message: 'Password should be not empty' }),
});

const hValidateSignup = [
  validateCredential,
  validate({
    name: z.string().min(1, { message: 'Name should be not empty' }),
    email: z.string().email('Invalid email'),
  }),
];

export default function userRouter(userController: IUserController) {
  auth.post('/signup', ...hValidateSignup, userController.signup);
  auth.post('/login', validateCredential, userController.login);
  auth.post('/logout', userController.logout);
  auth.get('/me', isAuth, userController.me);

  return auth;
}
