import type { Hono } from 'hono';
import { faker } from 'faker';
import { supabaseWithAuth } from '~/supabase.ts';
import { createNewUser } from '~/tests/auth_utils.ts';

export async function clearBucket() {
  return await supabaseWithAuth.storage.emptyBucket('upload');
}

function randomMimeType(except = 'image') {
  let type = '';
  do {
    type = faker.system.mimeType();
  } while (type.startsWith(except));

  return type;
}

function randomImageMimeType() {
  let type = '';
  while (!type.startsWith('image')) {
    type = faker.system.mimeType();
  }

  return type;
}

type MakeFileOptions = { size?: number; isImage?: boolean };
export function makeFileDetails(options?: MakeFileOptions): FormData {
  const mimeType = options?.isImage ? randomImageMimeType() : randomMimeType();
  const formData = new FormData();
  formData.append('path', faker.system.directoryPath());
  formData.append(
    'file',
    new File(
      ['a'.repeat(options?.size || 0)],
      faker.word.words(1) + '.' + faker.system.fileExt(mimeType),
      { type: mimeType, lastModified: Date.now() },
    ),
  );

  return formData;
}

export async function uploadFile(app: Hono, options?: MakeFileOptions) {
  const { token } = await createNewUser(app);
  const file = makeFileDetails(options);
  const response = await app.request('/upload', {
    method: 'post',
    headers: { Authorization: `Bearer ${token}` },
    body: file,
  });

  const uploaded = await response.json();

  return {
    token,
    uploaded,
  };
}
