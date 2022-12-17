import { faker } from 'faker';
import { assertEquals } from 'testing/asserts.ts';
import { afterAll, beforeAll, beforeEach, describe, it } from 'testing/bdd.ts';
import { type SuperDeno, superdeno } from 'superdeno';
import { json, type Opine, opine } from 'opine';
import {} from '../types.ts';
import { userRepository } from '../model/auth.ts';
import { workRepository } from '../model/work.ts';
import { UserController } from '../controller/auth.ts';
import { WorkController } from '../controller/work.ts';
import userRouter from '../router/auth.ts';
import workRouter from '../router/work.ts';
import { errorHandler } from '../middleware/error_handler.ts';
import {
  clearCollection as clearWorkCollection,
  createNewWorks,
  makeWorkDetails,
} from './work_utils.ts';
import {
  clearCollection as clearAuthCollection,
  createNewUser,
} from './auth_utils.ts';

describe('Works APIs', () => {
  let app: Opine;
  let request: SuperDeno;

  beforeAll(() => {
    app = opine();
    app.use(json());
    app.use('/auth', userRouter(new UserController(userRepository)));
    app.use('/works', workRouter(new WorkController(workRepository)));
    app.use(errorHandler);

    request = superdeno(app);
  });

  beforeEach(async () => {
    await clearWorkCollection();
    await clearAuthCollection();
  });

  afterAll(async () => {
    await clearWorkCollection();
    await clearAuthCollection();
  });

  describe('POST to /works', () => {
    it('returns 201 and creates work', async () => {
      const { username, token } = await createNewUser(request);
      const work = makeWorkDetails(username);

      const response = await request.post('/works').set({
        Authorization: `Bearer ${token}`,
      }).send(work);

      const {
        title,
        description,
        techs,
        repo,
        projectURL,
        thumbnail,
      } = response.body;
      const created = {
        title,
        description,
        techs,
        repo,
        projectURL,
        thumbnail,
      };

      assertEquals(response.status, 201);
      assertEquals({ ...created }, { ...work });
    });

    it('returns 400 when title field is invalid', async () => {
      const { username, token } = await createNewUser(request);
      const work = makeWorkDetails(username);
      work.title = '';

      const response = await request.post('/works').set({
        Authorization: `Bearer ${token}`,
      }).send(work);

      assertEquals(response.status, 400);
      assertEquals(response.body.message, 'Title should be not empty');
    });

    it('returns 400 when repository url field is invalid', async () => {
      const { username, token } = await createNewUser(request);
      const work = makeWorkDetails(username);
      work.repo.url = faker.random.alpha(20);

      const response = await request.post('/works').set({
        Authorization: `Bearer ${token}`,
      }).send(work);

      assertEquals(response.status, 400);
      assertEquals(response.body.message, 'Invalid repository url');
    });

    it('returns 400 when project url field is invalid', async () => {
      const { username, token } = await createNewUser(request);
      const work = makeWorkDetails(username);
      work.projectURL = faker.random.alpha(20);

      const response = await request.post('/works').set({
        Authorization: `Bearer ${token}`,
      }).send(work);

      assertEquals(response.status, 400);
      assertEquals(response.body.message, 'Invalid project url');
    });
  });

  describe('GET to /works', () => {
    it('returns all works', async () => {
      const n = Math.floor(Math.random() * 5);
      const { works } = await createNewWorks(request, n);

      const response = await request.get('/works');

      assertEquals(response.status, 200);
      assertEquals(response.body, works);
      assertEquals(response.body.length, n);
    });
  });

  describe('GET to /works/:id', () => {
    it('returns 404 when work does not exist', async () => {
      const title = faker.commerce.product();

      const response = await request.get(`/works/${title}`);

      assertEquals(response.status, 404);
      assertEquals(response.body.message, `Work title(${title}) not found`);
    });

    it('returns 200 and the work object when work exists', async () => {
      const { works } = await createNewWorks(request);
      const work = works[0];

      const response = await request.get(`/works/${work.title}`);

      assertEquals(response.status, 200);
      assertEquals(response.body, { ...work });
    });
  });

  describe('PUT to /works/:id', () => {
    it('returns 404 when work does not exist', async () => {
      const { username, token } = await createNewUser(request);
      const work = makeWorkDetails(username);

      const response = await request.put(`/works/${work.title}`).set({
        Authorization: `Bearer ${token}`,
      }).send(work);

      assertEquals(response.status, 404);
      assertEquals(
        response.body.message,
        `Work title(${work.title}) not found`,
      );
    });

    it('returns 404 when work title does not matched', async () => {
      const { token, works } = await createNewWorks(request);
      const work = works[0];

      const updated = { ...work, title: faker.commerce.product() };

      const response = await request.put(`/works/${work.title}`).set({
        Authorization: `Bearer ${token}`,
      }).send(updated);

      assertEquals(response.status, 404);
      assertEquals(response.body.message, 'Update access forbidden');
    });

    it('returns 200 and the work object when work exists', async () => {
      const { token, works } = await createNewWorks(request);
      const work = works[0];

      const response = await request.put(`/works/${work.title}`).set({
        Authorization: `Bearer ${token}`,
      }).send(work);

      const {
        _id,
        id,
        title,
        description,
        techs,
        repo,
        projectURL,
        thumbnail,
      } = response.body;
      const updated = {
        _id,
        id,
        title,
        description,
        techs,
        repo,
        projectURL,
        thumbnail,
      };

      assertEquals(response.status, 200);
      assertEquals({ ...updated }, { ...work });
    });
  });

  describe('DELETE to /works/:id', () => {
    it('returns 404 when work does not exist', async () => {
      const { token } = await createNewUser(request);

      const response = await request.delete('/works/something').set({
        Authorization: `Bearer ${token}`,
      });

      assertEquals(response.status, 404);
      assertEquals(response.body.message, `Work title(something) not found`);
    });

    it('returns 204 and the work should be deleted when work exists', async () => {
      const { token, works } = await createNewWorks(request);
      const work = works[0];

      const response = await request.delete(`/works/${work.title}`).set({
        Authorization: `Bearer ${token}`,
      });

      assertEquals(response.status, 204);
    });
  });
});
