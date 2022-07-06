import { ObjectId } from 'mongo';
import { UserData, UserSignupData } from './../types.ts';
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
  return await User.findOne({ username }).then(mapOptionalData);
}

export async function findById(id: string) {
  return await User.findOne({ _id: new ObjectId(id) }).then(mapOptionalData);
}

export async function create(user: UserSignupData) {
  return await User.insertOne(user).then((insertedId) => insertedId.toString());
}

function mapOptionalData(data?: UserSchema): UserData | undefined {
  return data ? { ...data, id: data._id.toString() } : data;
}
