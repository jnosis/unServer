import { OpineRequest, OpineResponse } from '../../deps.ts';
import { Model, IWorkController, WorkInputData } from '../types.ts';

export class WorkController implements IWorkController {
  constructor(private workRepository: Model) {
    this.workRepository = workRepository;
  }

  getAll = async (_req: OpineRequest, res: OpineResponse) => {
    const works = await this.workRepository.getAll();
    res.setStatus(200).json(works);
  };

  getByTitle = async (req: OpineRequest, res: OpineResponse) => {
    const title = req.params.id;
    const work = await this.workRepository.getByTitle(title);

    if (!work) {
      return res
        .setStatus(404)
        .json({ message: `Work title(${title}) not found` });
    }

    return res.setStatus(200).json(work);
  };

  add = async (req: OpineRequest, res: OpineResponse) => {
    const body: WorkInputData = req.body;
    const work = await this.workRepository.create(body);
    res.setStatus(201).json(work);
  };

  update = async (req: OpineRequest, res: OpineResponse) => {
    const title = req.params.id;
    const body: WorkInputData = req.body;
    const work = await this.workRepository.getByTitle(title);

    if (!work) {
      return res
        .setStatus(404)
        .json({ message: `Work title(${title}) not found` });
    }
    if (title !== body.title) {
      return res.setStatus(403).json({ message: `Update access forbidden` });
    }

    const updated = await this.workRepository.update(title, body);
    return res.setStatus(200).json(updated);
  };

  delete = async (req: OpineRequest, res: OpineResponse) => {
    const title = req.params.id;
    const work = await this.workRepository.getByTitle(title);

    if (!work) {
      return res
        .setStatus(404)
        .json({ message: `Work title(${title}) not found` });
    }

    await this.workRepository.remove(title);
    return res.sendStatus(204);
  };
}
