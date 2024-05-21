import type {
  DownloadOptions,
  SupabaseWithAuth,
  UploadData,
  UploadModel,
} from '~/types.ts';
import { supabase, supabaseWithAuth } from '~/supabase.ts';

class UploadRepository implements UploadModel {
  #supabase;
  constructor(supabase: SupabaseWithAuth) {
    this.#supabase = { ...supabase };
  }
  async download(path: string, options?: DownloadOptions) {
    const { data } = await this.#getSupabase(options?.isAuth)
      .download(path, { transform: options?.transform });
    return data;
  }

  async upload(upload: UploadData, isAuth?: boolean) {
    const { data } = await this.#getSupabase(isAuth)
      .upload(upload.path, upload.file);
    if (data) {
      return { path: upload.path, name: upload.file.name };
    }
  }

  async update(path: string, upload: UploadData, isAuth?: boolean) {
    const { data } = await this.#getSupabase(isAuth)
      .update(path, upload.file);
    if (data) {
      return { path, name: upload.file.name };
    }
  }

  async remove(path: string, isAuth?: boolean) {
    const { data } = await this.#getSupabase(isAuth)
      .remove([path]);
    return data ? data.length : 0;
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
