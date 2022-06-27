import { Router } from '../../deps.ts';
import { IWorkController } from './../types.ts';

const router = Router();

export default function workRouter(workController: IWorkController) {
  router.get('/', workController.getAll);
  router.get('/:id', workController.getByTitle);
  router.post('/', workController.add);
  router.put('/:id', workController.update);
  router.delete('/:id', workController.delete);

  return router;
}
