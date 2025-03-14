import { Hono } from 'hono';
import { StorageError } from 'supabase/storage';
import { assertEquals, assertGreater } from '@std/assert';
import { format } from '@std/fmt/bytes';
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  it,
} from '@std/testing/bdd';
import { stub } from '@std/testing/mock';
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
import {
  clearBucket,
  makeFileDetails,
  uploadFile,
} from '~/tests/file_utils.ts';
import config from '~/config.ts';
import { isAuth } from '~/middleware/auth.ts';

describe('Upload APIs', () => {
  let app: Hono;

  beforeAll(() => {
    app = new Hono();
    app.use(logger);
    app.onError(errorHandler);
    app.notFound(notFoundHandler);
    app.route('/auth', userRouter(new UserController(userRepository)));
    app.route('/upload', uploadRouter(new UploadController(uploadRepository)));
  });

  beforeEach(async () => {
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
        'Invalid type: Expected string but received undefined',
      );
    });

    it('returns 400 when file is not a file', async () => {
      const { token } = await createNewUser(app);
      const nonFile = { path: '/path', _: 'This is not a file' };
      const req = {
        method: 'post',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(nonFile),
      };

      const response = await app.request('/upload', req);

      assertEquals(response.status, 400);
      assertEquals(
        (await response.json()).message,
        'File should be File',
      );

      const u = new Hono()
        .onError(errorHandler)
        .post(
          '/upload',
          isAuth,
          (new UploadController(uploadRepository)).upload,
        );
      const responseWithoutValidation = await u.request('/upload', req);

      assertEquals(responseWithoutValidation.status, 400);
      assertEquals(
        (await responseWithoutValidation.json()).message,
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

    it('returns 400 when file is not image', async () => {
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
        `Max size is ${format(config.upload.maxFileSize, { binary: true })}`,
      );
    });

    it('returns 500 when error has occurred at uploading', async () => {
      const { token } = await createNewUser(app);
      const file = makeFileDetails({
        isImage: true,
        size: Math.floor(Math.random() * (config.upload.maxFileSize) / 100) + 1,
      });

      const stubbed = stub(uploadRepository, 'upload', () => {
        return Promise.resolve({
          data: null,
          error: new StorageError('Something wrong'),
        });
      });
      const response = await app.request('/upload', {
        method: 'post',
        headers: { Authorization: `Bearer ${token}` },
        body: file,
      });
      stubbed.restore();

      assertEquals(response.status, 500);
      assertEquals(
        (await response.json()).message,
        `File(${file.get('path')}): Something wrong`,
      );
    });
  });

  describe('PUT to /upload/*', () => {
    it('returns 404 when uploaded file does not exist', async () => {
      const { token } = await createNewUser(app);
      const file = makeFileDetails({ isImage: true, size: 1024 });

      const response = await app.request(`/upload${file.get('path')}`, {
        method: 'put',
        headers: { Authorization: `Bearer ${token}` },
        body: file,
      });

      assertEquals(response.status, 404);
      assertEquals(
        (await response.json()).message,
        `File(${(file.get('path'))}) not found`,
      );
    });

    it('returns 200 and the uploaded file when file exists', async () => {
      const { token, uploaded } = await uploadFile(app, {
        isImage: true,
        size: 1024,
      });
      const file = makeFileDetails({ isImage: true, size: 1024 });
      file.set('path', uploaded.path);

      const response = await app.request(
        `/upload${uploaded.path}`,
        {
          method: 'put',
          headers: { Authorization: `Bearer ${token}` },
          body: file,
        },
      );

      const updated = await response.json();

      assertEquals(response.status, 200);
      assertEquals({ ...updated }, {
        ...uploaded,
        name: (file.get('file') as File).name,
      });
    });

    it('returns 400 when file is not a file', async () => {
      const u = new Hono();
      u.onError(errorHandler);
      u.notFound(notFoundHandler);
      u.route('/auth', userRouter(new UserController(userRepository)));
      u.post(
        '/upload',
        isAuth,
        (new UploadController(uploadRepository)).upload,
      );
      u.put(
        '/upload/*',
        isAuth,
        (new UploadController(uploadRepository)).update,
      );
      const { token, uploaded } = await uploadFile(u, {
        isImage: true,
        size: 1024,
      });
      const nonFile = { path: uploaded.path, _: 'This is not a file' };
      const req = {
        method: 'put',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(nonFile),
      };

      const response = await u.request(`/upload${uploaded.path}`, req);

      assertEquals(response.status, 400);
      assertEquals(
        (await response.json()).message,
        'File should be File',
      );
    });

    it('returns 500 when error has occurred at updating', async () => {
      const { token, uploaded } = await uploadFile(app, {
        isImage: true,
        size: 1024,
      });
      const file = makeFileDetails({ isImage: true, size: 1024 });
      file.set('path', uploaded.path);

      const stubbed = stub(uploadRepository, 'update', () => {
        return Promise.resolve({
          data: null,
          error: new StorageError('Something wrong'),
        });
      });
      const response = await app.request(`/upload${uploaded.path}`, {
        method: 'put',
        headers: { Authorization: `Bearer ${token}` },
        body: file,
      });
      stubbed.restore();

      assertEquals(response.status, 500);
      assertEquals(
        (await response.json()).message,
        `File(${file.get('path')}): Something wrong`,
      );
    });
  });

  describe('DELETE to /upload/*', () => {
    it('returns 404 when uploaded file does not exist', async () => {
      const { token } = await createNewUser(app);

      const response = await app.request('/upload/something', {
        method: 'delete',
        headers: { Authorization: `Bearer ${token}` },
      });

      assertEquals(
        (await response.json()).message,
        `File(/something) not found`,
      );
      assertEquals(response.status, 404);
    });

    it('returns 204 and the uploaded should be deleted when uploaded file exists', async () => {
      const { token, uploaded } = await uploadFile(app, {
        isImage: true,
        size: 1024,
      });

      const response = await app.request(
        `/upload${uploaded.path}`,
        {
          method: 'delete',
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      assertEquals(response.status, 204);
    });

    it('returns 500 when uploaded file exists', async () => {
      const { token, uploaded } = await uploadFile(app, {
        isImage: true,
        size: 1024,
      });

      const stubbed = stub(uploadRepository, 'remove', () => {
        return Promise.resolve({
          data: null,
          error: new StorageError('Something wrong'),
        });
      });
      const response = await app.request(
        `/upload${uploaded.path}`,
        {
          method: 'delete',
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      stubbed.restore();

      assertEquals(response.status, 500);
      assertEquals(
        (await response.json()).message,
        `File(${uploaded.path}): Something wrong`,
      );
    });
  });
});
