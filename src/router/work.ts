import type { IHWorkController, IWorkController } from '~/types.ts';
import { Hono } from 'hono';
import { Router } from 'opine';
import { z } from 'zod';
import { isAuth, isHAuth } from '~/middleware/auth.ts';
import { hValidate, validate } from '~/middleware/validator.ts';

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
  projectUrl: z.union([
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

const work = new Hono();

const hValidateWork = hValidate({
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

export function hWorkRouter(workController: IHWorkController) {
  work.get('/', workController.getAll);
  work.get('/:id', workController.getByTitle);
  work.post('/', isHAuth, hValidateWork, workController.add);
  work.put('/:id', isHAuth, hValidateWork, workController.update);
  work.delete('/:id', isHAuth, workController.delete);

  return work;
}
