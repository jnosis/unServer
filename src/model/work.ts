import type { Database as MongoDatabase } from 'mongo';
import type {
  SupabaseWithAuth,
  WorkData,
  WorkInputData,
  WorkModel,
  WorkSchema,
} from '~/types.ts';
import mongodb from '~/mongodb.ts';
import { supabase, supabaseWithAuth } from '~/supabase.ts';

const Work = mongodb.getDatabase;

class WorkRepository implements WorkModel {
  work;
  supabase: SupabaseWithAuth;
  constructor(mongodb: MongoDatabase, supabase: SupabaseWithAuth) {
    this.work = mongodb.collection<WorkSchema>('works');
    this.supabase = { ...supabase };
  }

  async getAll() {
    return await this.work.find().toArray().then((works) =>
      works.map(mapOptionalData).filter((work): work is WorkData => !!work)
    );
  }

  async getByTitle(title: string) {
    return await this.work.findOne({ title }).then(mapOptionalData);
  }

  async create(work: WorkInputData) {
    return await this.work.insertOne(work).then((insertedId) =>
      mapOptionalData({ ...work, _id: insertedId })
    );
  }

  async update(title: string, work: WorkInputData) {
    return await this.work.updateOne({ title }, { $set: work }).then(
      async () => await this.work.findOne({ title }).then(mapOptionalData),
    );
  }

  async remove(title: string) {
    return await this.work.deleteOne({ title });
  }

  async migrate(isAuth?: boolean) {
    const client = this.#getSupabase(isAuth);
    const works = await this.getAll();
    for (const work of works) {
      await client.insert({
        id: crypto.randomUUID(),
        title: work.title,
        description: work.description,
        techs: work.techs,
        repo: work.repo,
        projectUrl: work.projectUrl,
        thumbnail: work.thumbnail,
      });
    }
    const { data: migrated } = await client
      .select('id,title,description,techs,repo,projectUrl,thumbnail');
    return migrated ? migrated as WorkData[] : [];
  }

  #getSupabase(isAuth?: boolean) {
    return this.supabase[isAuth ? 'withAuth' : 'withoutAuth'];
  }
}

function mapOptionalData(data?: WorkSchema): WorkData | undefined {
  return data ? { ...data, id: data._id.toString() } : data;
}

export const workRepository = new WorkRepository(Work, {
  withAuth: supabaseWithAuth.from('works'),
  withoutAuth: supabase.from('works'),
});
