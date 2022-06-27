export type DatabaseOptions = {
  name: string;
  host: string;
};

export type CloudinaryOptions = {
  uploadPreset: string;
  cloudId: string;
};

export type Config = {
  database: DatabaseOptions;
  cloudinary: CloudinaryOptions;
};

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
