import { Hono } from 'hono';
import { assertEquals, assertGreater } from '$std/assert/mod.ts';
import { afterAll, beforeAll, beforeEach, describe, it } from 'testing/bdd.ts';
import { UserController } from '~/controller/auth.ts';
import { UploadController } from '~/controller/upload.ts';
import { errorHandler, notFoundHandler } from '~/middleware/error_handler.ts';
import { logger } from '~/middleware/logger.ts';
import { userRepository } from '~/model/auth.ts';
import { uploadRepository } from '~/model/upload.ts';
import userRouter from '~/router/auth.ts';
import uploadRouter from '~/router/upload.ts';
import {
  clearCollection as clearAuthCollection,
  createNewUser,
} from '~/tests/auth_utils.ts';
import { clearBucket, makeFileDetails } from '~/tests/file_utils.ts';
import config from '~/config.ts';

describe('Upload APIs', () => {
  let app: Hono;

  beforeAll(() => {
  });

  beforeEach(async () => {
    app = new Hono();
    app.use(logger);
    app.onError(errorHandler);
    app.notFound(notFoundHandler);
    app.route('/auth', userRouter(new UserController(userRepository)));
    app.route('/upload', uploadRouter(new UploadController(uploadRepository)));
    await clearBucket();
    await clearAuthCollection();
  });

  afterAll(async () => {
    await clearBucket();
    await clearAuthCollection();
  });

  describe('POST to /upload', () => {
    it('returns 201 and upload file', async () => {
      const { token } = await createNewUser(app);
      const file = makeFileDetails({
        isImage: true,
        size: Math.floor(Math.random() * (config.upload.maxFileSize) / 100) + 1,
      });

      const response = await app.request('/upload', {
        method: 'post',
        headers: { Authorization: `Bearer ${token}` },
        body: file,
      });

      const { path, name } = await response.json();

      assertEquals(response.status, 201);
      assertEquals(name, (file.get('file') as File).name);
      assertGreater(path.length, 0);
    });

    it('returns 400 when file dose not have a path', async () => {
      const { token } = await createNewUser(app);
      const nonFile = { _: 'This dose not have a path' };

      const response = await app.request('/upload', {
        method: 'post',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(nonFile),
      });

      assertEquals(response.status, 400);
      assertEquals(
        (await response.json()).message,
        'Required',
      );
    });

    it('returns 400 when file is not a file', async () => {
      const { token } = await createNewUser(app);
      const nonFile = { path: '/path', _: 'This is not a file' };

      const response = await app.request('/upload', {
        method: 'post',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(nonFile),
      });

      assertEquals(response.status, 400);
      assertEquals(
        (await response.json()).message,
        'File should be File',
      );
    });

    it('returns 400 when path field is invalid', async () => {
      const { token } = await createNewUser(app);
      const file = makeFileDetails();
      file.set('path', '');

      const response = await app.request('/upload', {
        method: 'post',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: file,
      });

      assertEquals(response.status, 400);
      assertEquals(
        (await response.json()).message,
        'Invalid path',
      );
    });

    it('returns 400 when file size is not image', async () => {
      const { token } = await createNewUser(app);
      const file = makeFileDetails();

      const response = await app.request('/upload', {
        method: 'post',
        headers: { Authorization: `Bearer ${token}` },
        body: file,
      });

      assertEquals(response.status, 400);
      assertEquals(
        (await response.json()).message,
        'Only image files are accepted',
      );
    });

    it('returns 400 when file size is zero', async () => {
      const { token } = await createNewUser(app);
      const file = makeFileDetails({ isImage: true });

      const response = await app.request('/upload', {
        method: 'post',
        headers: { Authorization: `Bearer ${token}` },
        body: file,
      });

      assertEquals(response.status, 400);
      assertEquals(
        (await response.json()).message,
        'Input file',
      );
    });

    it('returns 400 when file size greater than max size', async () => {
      const { token } = await createNewUser(app);
      const file = makeFileDetails({
        isImage: true,
        size: config.upload.maxFileSize + 1,
      });

      const response = await app.request('/upload', {
        method: 'post',
        headers: { Authorization: `Bearer ${token}` },
        body: file,
      });

      assertEquals(response.status, 400);
      assertEquals(
        (await response.json()).message,
        'Max size is 50MB',
      );
    });
  });
});
