import { Router } from 'opine';
import { z } from 'zod';
import { IWorkController } from './../types.ts';
import { isAuth } from './../middleware/auth.ts';
import { validate } from './../middleware/validator.ts';

const router = Router();

const validateWork = validate({
  title: z.string().min(1, { message: 'Title should be not empty' }),
  description: z.string(),
  repo: z.object({
    url: z.string().regex(
      /^(https?\:\/\/)?github.com\/[\w]+\/[\w]+/,
      'Invalid repository url',
    ),
    branch: z.string(),
  }),
  projectURL: z.union([
    z.literal(''),
    z.string().url({ message: 'Invalid project url' }),
  ]),
});

export default function workRouter(workController: IWorkController) {
  router.get('/', workController.getAll);
  router.get('/:id', workController.getByTitle);
  router.post('/', isAuth, validateWork, workController.add);
  router.put('/:id', isAuth, validateWork, workController.update);
  router.delete('/:id', isAuth, workController.delete);

  return router;
}
