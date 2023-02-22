import type {
  SupabaseWithAuth,
  WorkData,
  WorkInputData,
  WorkModel,
} from '~/types.ts';
import { supabase, supabaseWithAuth } from '~/supabase.ts';

class WorkRepository implements WorkModel {
  #supabase: SupabaseWithAuth;
  constructor(supabase: SupabaseWithAuth) {
    this.#supabase = { ...supabase };
  }

  async getAll() {
    const { data } = await this.#getSupabase().select('*').order('created_at');
    return data ? data as WorkData[] : [];
  }

  async getByTitle(title: string) {
    const { data } = await this.#getSupabase().select('*').eq('title', title);
    return data ? data[0] as WorkData : undefined;
  }

  async create(work: WorkInputData, isAuth?: boolean) {
    const client = this.#getSupabase(isAuth);
    const { data } = await client
      .insert({ ...work, id: crypto.randomUUID() })
      .select('*');
    if (data) {
      return data[0] as WorkData;
    }
  }

  async update(title: string, work: WorkInputData, isAuth?: boolean) {
    const client = this.#getSupabase(isAuth);
    const { data } = await client
      .update({ ...work })
      .eq('title', title)
      .select('*');
    if (data) {
      return data[0] as WorkData;
    }
  }

  async remove(title: string, isAuth?: boolean) {
    const client = this.#getSupabase(isAuth);
    const { count } = await client.delete().eq('title', title);
    return count ? count : 0;
  }

  #getSupabase(isAuth?: boolean) {
    return this.#supabase[isAuth ? 'withAuth' : 'withoutAuth'].from('works');
  }
}

export const workRepository = new WorkRepository({
  withAuth: supabaseWithAuth,
  withoutAuth: supabase,
});
