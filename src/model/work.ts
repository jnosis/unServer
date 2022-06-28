import { type ObjectId } from '../../deps.ts';
import { WorkData, FileData, Repo, Techs, WorkInputData } from './../types.ts';
import db from '../db.ts';

interface WorkSchema {
  _id: ObjectId;
  title: string;
  description: string;
  techs: Techs;
  repo: Repo;
  projectURL?: string;
  thumbnail: FileData;
}

const Work = db.getDatabase.collection<WorkSchema>('works');

export async function getAll() {
  return await Work.find()
    .toArray()
    .then((works) => works.map(mapOptionalData));
}

export async function getByTitle(title: string) {
  return await Work.findOne({ title }).then(mapOptionalData);
}

export async function create(work: WorkInputData) {
  return await Work.insertOne(work).then((insertedId) =>
    mapOptionalData({ ...work, _id: insertedId })
  );
}

export async function update(title: string, work: WorkInputData) {
  return await Work.updateOne({ title }, work).then(
    ({ upsertedId }) =>
      upsertedId && mapOptionalData({ ...work, _id: upsertedId })
  );
}

export async function remove(title: string) {
  return await Work.deleteOne({ title });
}

function mapOptionalData(data?: WorkSchema): WorkData | undefined {
  return data ? { ...data, id: data._id.toString() } : data;
}
