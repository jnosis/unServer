import { Handler } from '../deps.ts';

export type DatabaseOptions = {
  name: string;
  host: string;
};

export type Config = {
  database: DatabaseOptions;
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
  id: number;
  title: string;
  description: string;
  techs: Techs;
  repo: Repo;
  projectURL?: string;
  thumbnail: FileData;
};

import * as model from './model/work.ts';
export type Model = typeof model;
