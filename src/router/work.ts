import { Router } from 'opine';
import { IWorkController } from './../types.ts';
import { isAuth } from './../middleware/auth.ts';

const router = Router();

export default function workRouter(workController: IWorkController) {
  router.get('/', workController.getAll);
  router.get('/:id', workController.getByTitle);
  router.post('/', isAuth, workController.add);
  router.put('/:id', isAuth, workController.update);
  router.delete('/:id', isAuth, workController.delete);

  return router;
}
