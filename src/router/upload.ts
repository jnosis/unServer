import type { AuthEnv, IUploadController } from '~/types.ts';
import { Hono } from 'hono';
import { format } from '@std/fmt/bytes';
import * as v from 'valibot';
import { isAuth } from '~/middleware/auth.ts';
import { validate } from '~/middleware/validator.ts';
import {
  checkFileIsImage,
  checkMaxFileSize,
  checkMinFileSize,
} from '~/util/file.ts';
import config from '~/config.ts';

const validateUpload = validate({
  path: v.pipe(
    v.string(),
    v.regex(
      /^((?:\/[a-zA-Z0-9]+(?:_[a-zA-Z0-9]+)*(?:[a-zA-Z0-9.]+)*)+)$/,
      'Invalid path',
    ),
  ),
  file: v.pipe(
    v.instance(File, 'File should be File'),
    v.check(checkFileIsImage, 'Only image files are accepted'),
    v.check(checkMinFileSize, 'Input file'),
    v.check(
      checkMaxFileSize,
      `Max size is ${format(config.upload.maxFileSize, { binary: true })}`,
    ),
  ),
});

export default function uploadRouter(uploadController: IUploadController) {
  const upload = new Hono<AuthEnv>()
    .post('/', isAuth, validateUpload, uploadController.upload)
    .put('/*', isAuth, validateUpload, uploadController.update)
    .delete('/*', isAuth, uploadController.delete);

  return upload;
}
