import type {
  DownloadOptions,
  SupabaseWithAuth,
  UploadData,
  UploadModel,
} from '~/types.ts';
import { StorageError } from 'supabase/storage';
import { supabase, supabaseWithAuth } from '~/supabase.ts';

class UploadRepository implements UploadModel {
  #supabase;
  constructor(supabase: SupabaseWithAuth) {
    this.#supabase = { ...supabase };
  }
  async download(path: string, options?: DownloadOptions) {
    const { data, error } = await this.#getSupabase(options?.isAuth)
      .download(path, { transform: options?.transform });
    if (error) return { data: null, error };
    return { data, error: null };
  }

  async upload(upload: UploadData, isAuth?: boolean) {
    const { data, error } = await this.#getSupabase(isAuth)
      .upload(upload.path, upload.file);
    if (data) {
      return {
        data: { path: upload.path, name: upload.file.name },
        error: null,
      };
    }
    return { data: null, error };
  }

  async update(path: string, upload: UploadData, isAuth?: boolean) {
    const { data: isExist } = await this.#getSupabase(isAuth)
      .exists(path);
    if (!isExist) {
      return { data: null, error: new StorageError('Object not found') };
    }

    const { data, error } = await this.#getSupabase(isAuth)
      .update(path, upload.file);
    if (data) return { data: { path, name: upload.file.name }, error: null };
    return { data: null, error };
  }

  async remove(path: string, isAuth?: boolean) {
    const { data: isExist } = await this.#getSupabase(isAuth)
      .exists(path);
    if (!isExist) {
      return { data: null, error: new StorageError('Object not found') };
    }
    const { data: d } = await this.#getSupabase(isAuth)
      .remove([path]);
    const data = d ? d.length : 0;
    return { data, error: null };
  }

  #getSupabase(isAuth?: boolean) {
    return this.#supabase[isAuth ? 'withAuth' : 'withoutAuth']
      .storage.from('upload');
  }
}

export const uploadRepository = new UploadRepository({
  withAuth: supabaseWithAuth,
  withoutAuth: supabase,
});
