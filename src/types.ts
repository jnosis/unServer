import { Handler, CorsOptions } from '../deps.ts';

export type DatabaseOptions = {
  name: string;
  host: string;
};

export type Config = {
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

import * as userModel from './model/auth.ts';
export type UserModel = typeof userModel;

import * as workModel from './model/work.ts';
export type WorkModel = typeof workModel;

export type Err = {
  status: number;
  method: string;
  baseUrl: string;
  param: string;
  message: string;
};
