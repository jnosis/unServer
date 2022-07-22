import type { Handler } from 'opine';
import type { CorsOptions } from 'cors';

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

export type Config = {
  bcrypt: BcryptOptions;
  jwt: JwtOptions;
  cors: CorsOptions;
  database: DatabaseOptions;
};

export interface IUserController {
  signup: Handler;
  login: Handler;
  logout: Handler;
  me: Handler;
}

export type UserData = {
  id: string;
  username: string;
  password: string;
  name: string;
  email: string;
};

export type UserSignupData = {
  username: string;
  password: string;
  name: string;
  email: string;
};

export interface IWorkController {
  getAll: Handler;
  getByTitle: Handler;
  add: Handler;
  update: Handler;
  delete: Handler;
}

export type Repo = {
  url: string;
  branch: string;
};

export type Techs = { [index: string]: string };

export type FileData = {
  fileName: string;
  fileURL: string;
};

export type WorkData = {
  id: string;
  title: string;
  description: string;
  techs: Techs;
  repo: Repo;
  projectURL?: string;
  thumbnail: FileData;
};

export type WorkInputData = {
  title: string;
  description: string;
  techs: Techs;
  repo: Repo;
  projectURL?: string;
  thumbnail: FileData;
};

export interface UserModel {
  findByUsername(username: string): Promise<UserData | undefined>;
  findById(id: string): Promise<UserData | undefined>;
  create(user: UserSignupData): Promise<string>;
}

export interface WorkModel {
  getAll(): Promise<(WorkData | undefined)[]>;
  getByTitle(title: string): Promise<WorkData | undefined>;
  create(work: WorkInputData): Promise<WorkData | undefined>;
  update(title: string, work: WorkInputData): Promise<WorkData | undefined>;
  remove(title: string): Promise<number>;
}

export type Err = {
  status: number;
  method: string;
  baseUrl: string;
  param?: string;
  message: string;
};
