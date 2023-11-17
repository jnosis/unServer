import type { OpineRequest, OpineResponse } from 'opine';
import type { Context } from 'hono';
import type {
  AuthEnv,
  IHWorkController,
  IWorkController,
  WorkData,
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

  getAll = async (req: OpineRequest, res: OpineResponse<WorkData[]>) => {
    const { method, baseUrl } = req;
    const works = await this.#workRepository.getAll();

    const msg = convertToMessage({
      method,
      baseUrl,
      status: 200,
    });
    log.debug(msg);
    res.setStatus(200).json(works);
  };

  getByTitle = async (req: OpineRequest, res: OpineResponse<WorkData>) => {
    const { method, baseUrl } = req;
    const title = req.params.id;
    const work = await this.#workRepository.getByTitle(title);

    if (!work) {
      throwError({
        method,
        baseUrl,
        param: title,
        status: 404,
        message: `Work title(${title}) not found`,
      });
    }

    const msg = convertToMessage({
      method,
      baseUrl,
      param: title,
      status: 200,
    });
    log.debug(msg);
    return res.setStatus(200).json(work);
  };

  add = async (req: OpineRequest, res: OpineResponse<WorkData>) => {
    const { method, baseUrl } = req;
    const { title, description, techs, repo, projectUrl, thumbnail, userId } =
      req.body;
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

    const msg = convertToMessage({
      method,
      baseUrl,
      status: 201,
    });
    log.debug(msg);
    res.setStatus(201).json(work);
  };

  update = async (req: OpineRequest, res: OpineResponse<WorkData>) => {
    const { method, baseUrl } = req;
    const title = req.params.id;
    const {
      title: updatedTitle,
      description,
      techs,
      repo,
      projectUrl,
      thumbnail,
      userId,
    } = req.body;
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
      throwError({
        method,
        baseUrl,
        param: title,
        status: 404,
        message: `Work title(${title}) not found`,
      });
    }
    if (title !== workInput.title) {
      throwError({
        method,
        baseUrl,
        param: title,
        status: 404,
        message: `Update access forbidden`,
      });
    }

    const updated = await this.#workRepository.update(title, workInput, isAuth);
    const msg = convertToMessage({
      method,
      baseUrl,
      param: title,
      status: 200,
    });
    log.debug(msg);
    return res.setStatus(200).json(updated);
  };

  delete = async (req: OpineRequest, res: OpineResponse) => {
    const { method, baseUrl } = req;
    const { userId } = req.body;
    const isAuth = !!userId;
    const title = req.params.id;
    const work = await this.#workRepository.getByTitle(title);

    if (!work) {
      throwError({
        method,
        baseUrl,
        param: title,
        status: 404,
        message: `Work title(${title}) not found`,
      });
    }

    await this.#workRepository.remove(title, isAuth);
    const msg = convertToMessage({
      method,
      baseUrl,
      param: title,
      status: 204,
    });
    log.debug(msg);
    return res.sendStatus(204);
  };
}

export class HWorkController implements IHWorkController {
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
    return c.jsonT(works, 200);
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
    return c.jsonT(work, 200);
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
    return c.jsonT(work, 201);
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
    return c.jsonT(updated!, 200);
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
