import type { IUserController } from '~/types.ts';
import { Hono } from 'hono';
import * as v from 'valibot';
import { isAuth } from '~/middleware/auth.ts';
import { validate } from '~/middleware/validator.ts';

const validateCredential = validate({
  username: v.pipe(v.string(), v.minLength(1, 'Username should be not empty')),
  password: v.pipe(v.string(), v.minLength(1, 'Password should be not empty')),
});

const validateSignup = [
  validateCredential,
  validate({
    name: v.pipe(v.string(), v.minLength(1, 'Name should be not empty')),
    email: v.pipe(v.string(), v.email('Invalid email')),
  }),
];

export default function userRouter(userController: IUserController) {
  const auth = new Hono()
    .post('/signup', ...validateSignup, userController.signup)
    .post('/login', validateCredential, userController.login)
    .post('/logout', userController.logout)
    .get('/me', isAuth, userController.me);

  return auth;
}
