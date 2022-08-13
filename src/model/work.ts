import { Database } from 'mongo';
import { WorkData, WorkInputData, WorkModel, WorkSchema } from './../types.ts';
import db from '../db.ts';

const Work = db.getDatabase;

class WorkRepository implements WorkModel {
  work;
  constructor(db: Database) {
    this.work = db.collection<WorkSchema>('works');
  }

  async getAll() {
    return await this.work.find()
      .toArray()
      .then((works) => works.map(mapOptionalData));
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
    return await this.work.updateOne({ title }, { $set: work }).then(async () =>
      await this.work.findOne({ title }).then(mapOptionalData)
    );
  }

  async remove(title: string) {
    return await this.work.deleteOne({ title });
  }
}

function mapOptionalData(data?: WorkSchema): WorkData | undefined {
  return data ? { ...data, id: data._id.toString() } : data;
}

export const workRepository = new WorkRepository(Work);
