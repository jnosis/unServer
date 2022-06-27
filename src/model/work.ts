import { type ObjectId } from '../../deps.ts';
import { WorkData, FileData, Repo, Techs } from './../types.ts';
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
  return await Work.find().toArray();
}

export async function getByTitle(title: string) {
  return await Work.findOne({ title });
}

export async function create(work: WorkData) {
  return await Work.insertOne(work);
}

export async function update(title: string, work: WorkData) {
  return await Work.updateOne({ title }, work);
}

export async function remove(title: string) {
  return await Work.deleteOne({ title });
}
