import type { Context } from 'hono';
import type {
  AuthEnv,
  IWorkController,
  WorkInputData,
  WorkModel,
} from '~/types.ts';
import { throwError } from '~/middleware/error_handler.ts';
import log from '~/middleware/logger.ts';
import { convertToMessage } from '~/util/message.ts';

export class WorkController implements IWorkController {
  #workRepository: WorkModel;
  constructor(workRepository: WorkModel) {
    this.#workRepository = workRepository;
  }

  getAll = async (c: Context) => {
    const { method, path } = c.req;
    const works = await this.#workRepository.getAll();

    const msg = convertToMessage({
      method,
      baseUrl: path,
      status: 200,
    });
    log.debug(msg);
    return c.json(works, 200);
  };

  getByTitle = async (c: Context) => {
    const { method, path } = c.req;
    const title = c.req.param('id');
    const work = await this.#workRepository.getByTitle(title);

    if (!work) {
      return throwError({
        method,
        baseUrl: path,
        status: 404,
        message: `Work title(${title}) not found`,
      });
    }

    const msg = convertToMessage({
      method,
      baseUrl: path,
      status: 200,
    });
    log.debug(msg);
    return c.json(work, 200);
  };

  add = async (c: Context<AuthEnv>) => {
    const { method, path } = c.req;
    const { title, description, techs, repo, projectUrl, thumbnail } = await c
      .req.json<WorkInputData>();
    const userId = c.get('userId');
    const isAuth = !!userId;
    const workInput: WorkInputData = {
      title,
      description,
      techs,
      repo,
      projectUrl,
      thumbnail,
    };

    const work = await this.#workRepository.create(workInput, isAuth);

    if (!work) {
      return throwError({
        method,
        baseUrl: path,
        status: 500,
        message: `Work title(${title}) could not create`,
      });
    }
    const msg = convertToMessage({
      method,
      baseUrl: path,
      status: 201,
    });
    log.debug(msg);
    return c.json(work, 201);
  };

  update = async (c: Context<AuthEnv>) => {
    const { method, path } = c.req;
    const title = c.req.param('id');
    const {
      title: updatedTitle,
      description,
      techs,
      repo,
      projectUrl,
      thumbnail,
    } = await c.req.json<WorkInputData>();
    const userId = c.get('userId');
    const isAuth = !!userId;
    const workInput: WorkInputData = {
      title: updatedTitle,
      description,
      techs,
      repo,
      projectUrl,
      thumbnail,
    };
    const work = await this.#workRepository.getByTitle(title);

    if (!work) {
      return throwError({
        method,
        baseUrl: path,
        status: 404,
        message: `Work title(${title}) not found`,
      });
    }
    if (title !== workInput.title) {
      throwError({
        method,
        baseUrl: path,
        status: 404,
        message: `Update access forbidden`,
      });
    }

    const updated = await this.#workRepository.update(title, workInput, isAuth);
    const msg = convertToMessage({
      method,
      baseUrl: path,
      status: 200,
    });
    log.debug(msg);
    return c.json(updated!, 200);
  };

  delete = async (c: Context) => {
    const { method, path } = c.req;
    const userId = c.get('userId');
    const isAuth = !!userId;
    const title = c.req.param('id');
    const work = await this.#workRepository.getByTitle(title);

    if (!work) {
      return throwError({
        method,
        baseUrl: path,
        status: 404,
        message: `Work title(${title}) not found`,
      });
    }

    await this.#workRepository.remove(title, isAuth);
    const msg = convertToMessage({
      method,
      baseUrl: path,
      status: 204,
    });
    log.debug(msg);
    return c.body(null, 204);
  };
}
