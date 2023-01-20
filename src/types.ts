import { ParamsDictionary, RequestHandler } from 'opine';
import { CorsOptions } from 'cors';
import { Collection, ObjectId } from 'mongo';

export type BcryptOptions = {
  saltRound: number;
};

export type JwtOptions = {
  secretKey: string;
  expiresInSec: number;
};

export type DatabaseOptions = {
  name: string;
  host: string;
};

export type RateLimitOptions = {
  windowMs: number;
  maxRequest: number;
};

export type Config = {
  bcrypt: BcryptOptions;
  jwt: JwtOptions;
  cors: CorsOptions;
  database: DatabaseOptions;
  rateLimit: RateLimitOptions;
};

export interface IUserController {
  signup: RequestHandler<ParamsDictionary, AuthToken>;
  login: RequestHandler<ParamsDictionary, AuthToken>;
  logout: RequestHandler;
  me: RequestHandler<ParamsDictionary, AuthToken>;
}

export type UserData = {
  id: string;
  username: string;
  password: string;
  name: string;
  email: string;
};

export type UserSignupData = Omit<UserData, 'id'>;

export type AuthToken = {
  token: string;
  username: string;
};

export interface IWorkController {
  getAll: RequestHandler<ParamsDictionary, WorkData[]>;
  getByTitle: RequestHandler<ParamsDictionary, WorkData>;
  add: RequestHandler<ParamsDictionary, WorkData>;
  update: RequestHandler<ParamsDictionary, WorkData>;
  delete: RequestHandler;
}

export type Repo = {
  url: string;
  branch: string;
};

export type Techs = Record<string, string>;

export type FileData = {
  fileName: string;
  fileUrl: string;
};

export type WorkData = {
  id: string;
  title: string;
  description: string;
  techs: Techs;
  repo: Repo;
  projectUrl?: string;
  thumbnail: FileData;
};

export type WorkInputData = Omit<WorkData, 'id'>;

interface Model<Schema, Input, Data> {
  getAll(): Promise<Data[]>;
  create(input: Input): Promise<(Data | undefined) | string>;
  update(key: string, input: Input): Promise<Data | undefined>;
  remove(key: string): Promise<number>;
}

export interface UserSchema {
  _id: ObjectId;
  username: string;
  password: string;
  name: string;
  email: string;
}

export interface UserModel extends Model<UserSchema, UserSignupData, UserData> {
  user: Collection<UserSchema>;
  findByUsername(username: string): Promise<UserData | undefined>;
  findById(id: string): Promise<UserData | undefined>;
  create(user: UserSignupData): Promise<string>;
}

export interface WorkSchema {
  _id: ObjectId;
  title: string;
  description: string;
  techs: Techs;
  repo: Repo;
  projectUrl?: string;
  thumbnail: FileData;
}

export interface WorkModel extends Model<WorkSchema, WorkInputData, WorkData> {
  work: Collection<WorkSchema>;
  getByTitle(title: string): Promise<WorkData | undefined>;
  create(work: WorkInputData): Promise<WorkData | undefined>;
}
