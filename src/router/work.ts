import type { IWorkController } from '~/types.ts';
import { Hono } from 'hono';
import * as v from 'valibot';
import { isAuth } from '~/middleware/auth.ts';
import { validate } from '~/middleware/validator.ts';

const work = new Hono();

const validateWork = validate({
  title: v.pipe(v.string(), v.minLength(1, 'Title should be not empty')),
  description: v.string(),
  repo: v.object({
    url: v.pipe(
      v.string(),
      v.regex(
        /^(https?\:\/\/)?github.com\/[\w]+\/[\w]+/,
        'Invalid repository url',
      ),
    ),
    branch: v.string(),
  }),
  projectUrl: v.union([
    v.literal(''),
    v.pipe(v.string(), v.url('Invalid project url')),
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
