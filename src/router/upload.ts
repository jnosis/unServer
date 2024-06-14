import type { IUploadController } from '~/types.ts';
import { Hono } from 'hono';
import { format } from '@std/fmt/bytes';
import { z } from 'zod';
import { isAuth } from '~/middleware/auth.ts';
import { validate } from '~/middleware/validator.ts';
import {
  checkFileIsImage,
  checkMaxFileSize,
  checkMinFileSize,
} from '~/util/file.ts';
import config from '~/config.ts';

const upload = new Hono();

const validateUpload = validate({
  path: z.string().regex(
    /^((?:\/[a-zA-Z0-9]+(?:_[a-zA-Z0-9]+)*(?:[a-zA-Z0-9.]+)*)+)$/,
    'Invalid path',
  ),
  file: z
    .instanceof(File, { message: 'File should be File' })
    .refine(checkFileIsImage, { message: 'Only image files are accepted' })
    .refine(checkMinFileSize, { message: 'Input file' })
    .refine(checkMaxFileSize, {
      message: `Max size is ${format(config.upload.maxFileSize, { binary: true})}`,
    }),
});

export default function uploadRouter(uploadController: IUploadController) {
  upload.post('/', isAuth, validateUpload, uploadController.upload);
  upload.put('/*', isAuth, validateUpload, uploadController.update);
  upload.delete('/*', isAuth, uploadController.delete);

  return upload;
}
