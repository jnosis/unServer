import { faker } from 'faker';
import { Hono } from 'hono';
import { assertEquals } from '$std/assert/mod.ts';
import { afterAll, beforeAll, beforeEach, describe, it } from 'testing/bdd.ts';
import { UserController } from '~/controller/auth.ts';
import { WorkController } from '~/controller/work.ts';
import { errorHandler } from '~/middleware/error_handler.ts';
import { userRepository } from '~/model/auth.ts';
import { workRepository } from '~/model/work.ts';
import userRouter from '~/router/auth.ts';
import workRouter from '~/router/work.ts';
import {
  clearCollection as clearAuthCollection,
  createNewUser,
} from '~/tests/auth_utils.ts';
import {
  clearTable as clearWorkTable,
  createNewWorks,
  makeWorkDetails,
} from '~/tests/work_utils.ts';

describe('Works APIs', () => {
  let app: Hono;

  beforeAll(() => {
    app = new Hono();
    app.use('*', errorHandler);
    app.route('/auth', userRouter(new UserController(userRepository)));
    app.route('/works', workRouter(new WorkController(workRepository)));
  });

  beforeEach(async () => {
    await clearWorkTable();
    await clearAuthCollection();
  });

  afterAll(async () => {
    await clearWorkTable();
    await clearAuthCollection();
  });

  describe('POST to /works', () => {
    it('returns 201 and creates work', async () => {
      const { username, token } = await createNewUser(app);
      const work = makeWorkDetails(username);

      const response = await app.request('/works', {
        method: 'post',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(work),
      });

      const {
        title,
        description,
        techs,
        repo,
        projectUrl,
        thumbnail,
      } = await response.json();
      const created = {
        title,
        description,
        techs,
        repo,
        projectUrl,
        thumbnail,
      };

      assertEquals(response.status, 201);
      assertEquals({ ...created }, { ...work });
    });

    it('returns 400 when title field is invalid', async () => {
      const { username, token } = await createNewUser(app);
      const work = makeWorkDetails(username);
      work.title = '';

      const response = await app.request('/works', {
        method: 'post',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(work),
      });

      assertEquals(response.status, 400);
      assertEquals(
        (await response.json()).message,
        'Title should be not empty',
      );
    });

    it('returns 400 when repository url field is invalid', async () => {
      const { username, token } = await createNewUser(app);
      const work = makeWorkDetails(username);
      work.repo.url = faker.random.alpha(20);

      const response = await app.request('/works', {
        method: 'post',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(work),
      });

      assertEquals(response.status, 400);
      assertEquals((await response.json()).message, 'Invalid repository url');
    });

    it('returns 400 when project url field is invalid', async () => {
      const { username, token } = await createNewUser(app);
      const work = makeWorkDetails(username);
      work.projectUrl = faker.random.alpha(20);

      const response = await app.request('/works', {
        method: 'post',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(work),
      });

      assertEquals(response.status, 400);
      assertEquals((await response.json()).message, 'Invalid project url');
    });
  });

  describe('GET to /works', () => {
    it('returns all works', async () => {
      const n = Math.floor(Math.random() * 5);
      const { works } = await createNewWorks(app, n);

      const response = await app.request('/works', { method: 'get' });

      const body = await response.json();
      assertEquals(response.status, 200);
      assertEquals(body, works);
      assertEquals(body.length, n);
    });
  });

  describe('GET to /works/:id', () => {
    it('returns 404 when work does not exist', async () => {
      const title = faker.commerce.product();

      const response = await app.request(`/works/${title}`, { method: 'get' });

      assertEquals(response.status, 404);
      assertEquals(
        (await response.json()).message,
        `Work title(${title}) not found`,
      );
    });

    it('returns 200 and the work object when work exists', async () => {
      const { works } = await createNewWorks(app);
      const work = works[0];

      const response = await app.request(`/works/${work.title}`, {
        method: 'get',
      });

      assertEquals(response.status, 200);
      assertEquals(await response.json(), { ...work });
    });
  });

  describe('PUT to /works/:id', () => {
    it('returns 404 when work does not exist', async () => {
      const { username, token } = await createNewUser(app);
      const work = makeWorkDetails(username);

      const response = await app.request(`/works/${work.title}`, {
        method: 'put',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(work),
      });

      assertEquals(response.status, 404);
      assertEquals(
        (await response.json()).message,
        `Work title(${work.title}) not found`,
      );
    });

    it('returns 404 when work title does not matched', async () => {
      const { token, works } = await createNewWorks(app);
      const work = works[0];

      const updated = { ...work, title: faker.commerce.product() };

      const response = await app.request(`/works/${work.title}`, {
        method: 'put',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(updated),
      });

      assertEquals(response.status, 404);
      assertEquals((await response.json()).message, 'Update access forbidden');
    });

    it('returns 200 and the work object when work exists', async () => {
      const { token, works } = await createNewWorks(app);
      const work = works[0];

      const response = await app.request(`/works/${work.title}`, {
        method: 'put',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(work),
      });

      const {
        id,
        title,
        description,
        techs,
        repo,
        projectUrl,
        thumbnail,
        created_at,
      } = await response.json();
      const updated = {
        id,
        title,
        description,
        techs,
        repo,
        projectUrl,
        thumbnail,
        created_at,
      };

      assertEquals(response.status, 200);
      assertEquals({ ...updated }, { ...work });
    });
  });

  describe('DELETE to /works/:id', () => {
    it('returns 404 when work does not exist', async () => {
      const { token } = await createNewUser(app);

      const response = await app.request('/works/something', {
        method: 'delete',
        headers: { Authorization: `Bearer ${token}` },
      });

      assertEquals(response.status, 404);
      assertEquals(
        (await response.json()).message,
        `Work title(something) not found`,
      );
    });

    it('returns 204 and the work should be deleted when work exists', async () => {
      const { token, works } = await createNewWorks(app);
      const work = works[0];

      const response = await app.request(`/works/${work.title}`, {
        method: 'delete',
        headers: { Authorization: `Bearer ${token}` },
      });

      assertEquals(response.status, 204);
    });
  });
});
