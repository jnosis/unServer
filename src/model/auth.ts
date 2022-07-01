import { ObjectId } from '../../deps.ts';
import { UserData } from './../types.ts';
import db from '../db.ts';

interface UserSchema {
  _id: ObjectId;
  username: string;
  password: string;
  name: string;
  email: string;
}

const User = db.getDatabase.collection<UserSchema>('auth');

export async function findByUsername(username: string) {
  return await User.findOne({ username });
}

export async function findById(id: string) {
  return await User.findOne({ _id: new ObjectId(id) }).then(mapOptionalData);
}

export async function create(user: UserData) {
  return await User.insertOne(user).then((insertedId) =>
    mapOptionalData({ ...user, _id: insertedId })
  );
}

function mapOptionalData(data?: UserSchema): UserData | undefined {
  return data ? { ...data, id: data._id.toString() } : data;
}
