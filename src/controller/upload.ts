import type { Context } from 'hono';
import type { AuthEnv, IUploadController, UploadModel } from '~/types.ts';
import { throwError } from '~/helper/error.ts';

export class UploadController implements IUploadController {
  #uploadRepository: UploadModel;
  constructor(uploadRepository: UploadModel) {
    this.#uploadRepository = uploadRepository;
  }

  upload = async (c: Context<AuthEnv>) => {
    const userId = c.get('userId');
    const isAuth = !!userId;
    const { file, path } = await c.req.parseBody();

    if (!(file instanceof File)) return throwError(400, 'File should be File');
    if (typeof path !== 'string') return throwError(400, 'Invalid path');

    const { data: uploaded, error } = await this.#uploadRepository.upload(
      { file, path: path + '/' + file.name },
      isAuth,
    );

    if (!uploaded) {
      return throwError(500, `File(${path}): ${error.message}`);
    }

    return c.json(uploaded, 201);
  };

  update = async (c: Context<AuthEnv>) => {
    const path = c.req.path.slice(7);
    const userId = c.get('userId');
    const isAuth = !!userId;
    const { file } = await c.req.parseBody();

    if (!(file instanceof File)) return throwError(400, 'File should be File');

    const { data: updated, error } = await this.#uploadRepository
      .update(path, { file, path }, isAuth);

    if (!updated) {
      if (error.message === 'Object not found') {
        return throwError(404, `File(${path}) not found`);
      }
      return throwError(500, `File(${path}): ${error.message}`);
    }

    return c.json(updated, 200);
  };

  delete = async (c: Context<AuthEnv>) => {
    const path = c.req.path.slice(7);
    const userId = c.get('userId');
    const isAuth = !!userId;

    const { error } = await this.#uploadRepository.remove(path, isAuth);

    if (error) {
      if (error.message === 'Object not found') {
        return throwError(404, `File(${path}) not found`);
      }
      return throwError(500, `File(${path}): ${error.message}`);
    }

    return c.body(null, 204);
  };
}
