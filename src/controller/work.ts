import { OpineRequest, OpineResponse } from 'opine';
import {
  IWorkController,
  WorkData,
  WorkInputData,
  WorkModel,
} from '~/types.ts';
import { throwError } from '~/middleware/error_handler.ts';
import log from '~/middleware/logger.ts';
import { convertToMessage } from '~/util/message.ts';

export class WorkController implements IWorkController {
  constructor(private workRepository: WorkModel) {
    this.workRepository = workRepository;
  }

  getAll = async (req: OpineRequest, res: OpineResponse<WorkData[]>) => {
    const { method, baseUrl } = req;
    const works = await this.workRepository.getAll();

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
    const work = await this.workRepository.getByTitle(title);

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
    const { title, description, techs, repo, projectURL, thumbnail } = req.body;
    const workInput: WorkInputData = {
      title,
      description,
      techs,
      repo,
      projectURL,
      thumbnail,
    };

    const work = await this.workRepository.create(workInput);

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
      projectURL,
      thumbnail,
    } = req.body;
    const workInput: WorkInputData = {
      title: updatedTitle,
      description,
      techs,
      repo,
      projectURL,
      thumbnail,
    };
    const work = await this.workRepository.getByTitle(title);

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

    const updated = await this.workRepository.update(title, workInput);
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
    const title = req.params.id;
    const work = await this.workRepository.getByTitle(title);

    if (!work) {
      throwError({
        method,
        baseUrl,
        param: title,
        status: 404,
        message: `Work title(${title}) not found`,
      });
    }

    await this.workRepository.remove(title);
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
