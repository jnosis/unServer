import type { IWorkController } from '~/types.ts';
import { Hono } from 'hono';
import { z } from 'zod';
import { isAuth } from '~/middleware/auth.ts';
import { validate } from '~/middleware/validator.ts';

const work = new Hono();

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
  projectUrl: z.union([
    z.literal(''),
    z.string().url({ message: 'Invalid project url' }),
  ]),
});

export default function workRouter(workController: IWorkController) {
  work.get('/', workController.getAll);
  work.get('/:id', workController.getByTitle);
  work.post('/', isAuth, validateWork, workController.add);
  work.put('/:id', isAuth, validateWork, workController.update);
  work.delete('/:id', isAuth, workController.delete);

  return work;
}
