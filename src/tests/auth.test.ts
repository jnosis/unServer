import { faker } from 'faker';
import { Hono } from 'hono';
import { assertEquals, assertExists } from '@std/assert';
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  it,
} from '@std/testing/bdd';
import { resolvesNext, stub } from '@std/testing/mock';
import { UserController } from '~/controller/auth.ts';
import { errorHandler, notFoundHandler } from '~/middleware/error_handler.ts';
import { logger } from '~/middleware/logger.ts';
import { userRepository } from '~/model/auth.ts';
import userRouter from '~/router/auth.ts';
import {
  clearCollection,
  createNewUser,
  createToken,
  makeUserDetails,
} from '~/tests/auth_utils.ts';

describe('Auth APIs', () => {
  let app: Hono;

  beforeAll(() => {
    app = new Hono();
    app.use(logger);
    app.onError(errorHandler);
    app.notFound(notFoundHandler);
    app.route('/auth', userRouter(new UserController(userRepository)));
  });

  beforeEach(async () => {
    await clearCollection();
  });

  afterAll(async () => {
    await clearCollection();
  });

  describe('POST to /auth/signup', () => {
    it('returns 201 and authorization token', async () => {
      const user = makeUserDetails();
      const response = await app.request('/auth/signup', {
        method: 'post',
        body: JSON.stringify(user),
      });

      assertEquals(response.status, 201);
    });

    it('returns 409 when username has already been taken', async () => {
      const user = makeUserDetails();
      const firstSignup = await app.request('/auth/signup', {
        method: 'post',
        body: JSON.stringify(user),
      });
      assertEquals(firstSignup.status, 201);

      const response = await app.request('/auth/signup', {
        method: 'post',
        body: JSON.stringify(user),
      });

      assertEquals(response.status, 409);
      assertEquals(
        (await response.json()).message,
        `${user.username} already exists`,
      );
    });

    it('returns 400 when username field is invalid', async () => {
      const user = makeUserDetails();
      const response = await app.request('/auth/signup', {
        method: 'post',
        body: JSON.stringify({ ...user, username: '' }),
      });

      assertEquals(response.status, 400);
      assertEquals(
        (await response.json()).message,
        'Username should be not empty',
      );
    });

    it('returns 400 when password field is invalid', async () => {
      const user = makeUserDetails();
      const response = await app.request('/auth/signup', {
        method: 'post',
        body: JSON.stringify({ ...user, password: '' }),
      });

      assertEquals(response.status, 400);
      assertEquals(
        (await response.json()).message,
        'Password should be not empty',
      );
    });

    it('returns 400 when name field is invalid', async () => {
      const user = makeUserDetails();
      const response = await app.request('/auth/signup', {
        method: 'post',
        body: JSON.stringify({ ...user, name: '' }),
      });

      assertEquals(response.status, 400);
      assertEquals((await response.json()).message, 'Name should be not empty');
    });

    it('returns 400 when email field is invalid', async () => {
      const user = makeUserDetails();
      const response = await app.request('/auth/signup', {
        method: 'post',
        body: JSON.stringify({ ...user, email: faker.string.alpha(13) }),
      });

      assertEquals(response.status, 400);
      assertEquals((await response.json()).message, 'Invalid email');
    });
  });

  describe('POST to /auth/login', () => {
    it('returns 200 and authorization token when login info are valid', async () => {
      const { username, password } = await createNewUser(app);

      const response = await app.request('/auth/login', {
        method: 'post',
        body: JSON.stringify({ username, password }),
      });

      assertEquals(response.status, 200);
      assertExists((await response.json()).token);
    });

    it('returns 401 when username is not found', async () => {
      const wrongUsername = faker.internet.userName();
      const { password } = await createNewUser(app);

      const response = await app.request('/auth/login', {
        method: 'post',
        body: JSON.stringify({ username: wrongUsername, password }),
      });

      assertEquals(response.status, 401);
      assertEquals(
        (await response.json()).message,
        'Invalid username or password',
      );
    });

    it('returns 401 when password is incorrect', async () => {
      const { username } = await createNewUser(app);
      const wrongPassword = faker.internet.password();

      const response = await app.request('/auth/login', {
        method: 'post',
        body: JSON.stringify({ username, password: wrongPassword }),
      });

      assertEquals(response.status, 401);
      assertEquals(
        (await response.json()).message,
        'Invalid username or password',
      );
    });
  });

  describe('POST to /auth/logout', () => {
    it('returns 200 and removes cookie', async () => {
      await createNewUser(app);

      const response = await app.request('/auth/logout', { method: 'post' });

      assertEquals(response.status, 200);
      assertEquals(
        response.headers.getSetCookie(),
        ['token=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=None'],
      );
      assertEquals((await response.json()).message, 'User has been logged out');
    });
  });

  describe('GET to /auth/me', () => {
    it('returns user details when valid token is present in Authorization header', async () => {
      const { username, token } = await createNewUser(app);

      const response = await app.request('/auth/me', {
        method: 'get',
        headers: { Authorization: `Bearer ${token}` },
      });

      assertEquals(response.status, 200);
      assertEquals(await response.json(), { username, token });
    });

    it('returns user details when valid token is present in cookie', async () => {
      const { username, token, res } = await createNewUser(app);

      const { headers } = res;

      const response = await app.request('/auth/me', {
        method: 'get',
        headers: { Cookie: headers.getSetCookie().join('') },
      });

      assertEquals(response.status, 200);
      assertEquals(await response.json(), { username, token });
    });

    it('returns 401 when token is not found', async () => {
      const response = await app.request('/auth/me', { method: 'get' });

      assertEquals(response.status, 401);
      assertEquals((await response.json()).message, 'Authorization Error');
    });

    it('returns 401 when token is invalid', async () => {
      const response = await app.request('/auth/me', {
        method: 'get',
        headers: { Authorization: `Bearer ${faker.string.sample()}` },
      });

      assertEquals(response.status, 401);
      assertEquals((await response.json()).message, 'Authorization Error');
    });

    it('returns 401 when user does not exist', async () => {
      const _token = await createToken();
      const response = await app.request('/auth/me', {
        method: 'get',
        headers: { Authorization: `Bearer ${faker.string.sample()}` },
      });

      assertEquals(response.status, 401);
      assertEquals((await response.json()).message, 'Authorization Error');
    });

    it('returns 404 when userRepository returns undefined', async () => {
      const { token, username, password, name, email } = await createNewUser(
        app,
      );
      const user = { id: '', username, password, name, email };

      const stubbed = stub(
        userRepository,
        'findById',
        resolvesNext([user, undefined]),
      );
      const response = await app.request('/auth/me', {
        method: 'get',
        headers: { Authorization: `Bearer ${token}` },
      });
      stubbed.restore();

      assertEquals(response.status, 404);
      assertEquals((await response.json()).message, 'User not found');
    });
  });

  describe('unused userRepository methods', () => {
    it('returns all user', async () => {
      let list: string[] = [];
      let cnt = 0;
      while (cnt++ < Math.floor(Math.random() * 5)) {
        const user = await createNewUser(app);
        list = [...list, user.username];
      }

      const users = await userRepository.getAll();

      assertEquals(users.length, list.length);
      assertEquals(users.map((user) => user.username), list);
    });

    it('updates user data', async () => {
      const user = await createNewUser(app);
      const email = faker.internet.email();

      const updated = await userRepository.update(user.username, { email });

      assertEquals(updated?.email, email);
      assertEquals(updated?.username, user.username);
    });

    it('removes user data', async () => {
      const user = await createNewUser(app);

      const num = await userRepository.remove(user.username);
      const found = await userRepository.findByUsername(user.username);

      assertEquals(num, 1);
      assertEquals(found, undefined);
    });
  });
});
