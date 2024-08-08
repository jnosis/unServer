import type { Context } from 'hono';
import type {
  AuthEnv,
  IWorkController,
  WorkInputData,
  WorkModel,
} from '~/types.ts';
import { throwError } from '~/helper/error.ts';

export class WorkController implements IWorkController {
  #workRepository: WorkModel;
  constructor(workRepository: WorkModel) {
    this.#workRepository = workRepository;
  }

  getAll = async (c: Context) => {
    const works = await this.#workRepository.getAll();

    return c.json(works, 200);
  };

  getByTitle = async (c: Context) => {
    const title = c.req.param('id');
    const work = await this.#workRepository.getByTitle(title);

    if (!work) {
      return throwError(404, `Work title(${title}) not found`);
    }

    return c.json(work, 200);
  };

  add = async (c: Context<AuthEnv>) => {
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
      return throwError(500, `Work title(${title}) could not create`);
    }

    return c.json(work, 201);
  };

  update = async (c: Context<AuthEnv>) => {
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
      return throwError(404, `Work title(${title}) not found`);
    }
    if (title !== workInput.title) {
      return throwError(404, `Update access forbidden`);
    }

    const updated = await this.#workRepository.update(title, workInput, isAuth);

    return c.json(updated!, 200);
  };

  delete = async (c: Context) => {
    const userId = c.get('userId');
    const isAuth = !!userId;
    const title = c.req.param('id');
    const work = await this.#workRepository.getByTitle(title);

    if (!work) {
      return throwError(404, `Work title(${title}) not found`);
    }

    await this.#workRepository.remove(title, isAuth);

    return c.body(null, 204);
  };
}
