import type { Env, Handler, Input, TypedResponse } from 'hono';
// import type { Env, Handler, Input, TypedResponse } from 'hono';
import type { ObjectId } from 'mongo';
import type { StorageError } from 'supabase/storage';
import type { Supabase } from '~/supabase.ts';

export type BcryptOptions = {
  saltRound: number;
};

export type CORSOptions = {
  origin: string | string[] | ((origin: string) => string | undefined | null);
  allowMethods?: string[];
  allowHeaders?: string[];
  maxAge?: number;
  credentials?: boolean;
  exposeHeaders?: string[];
};

export type JwtOptions = {
  secretKey: string;
  expiresInSec: number;
};

export type MongodbOptions = {
  name: string;
  host: string;
};

export type SupabaseOptions = {
  url: string;
  key: string;
  serviceRole: string;
};

export type UploadOptions = {
  maxFileSize: number;
};

export type Config = {
  bcrypt: BcryptOptions;
  jwt: JwtOptions;
  cors: CORSOptions;
  mongodb: MongodbOptions;
  supabase: SupabaseOptions;
  upload: UploadOptions;
};

export type HttpArgs = [string, string, number];

type HonoResponse<T> = TypedResponse<T> | Promise<TypedResponse<T>>;

export type AuthEnv = {
  Variables: {
    userId: string;
    token: string;
  };
};

export interface IUserController {
  signup: Handler<Env, string, Input, HonoResponse<AuthToken>>;
  login: Handler<Env, string, Input, HonoResponse<AuthToken>>;
  logout: Handler;
  me: Handler<AuthEnv, string, Input, HonoResponse<AuthToken>>;
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

export interface IUploadController {
  upload: Handler<AuthEnv, string, Input, HonoResponse<FileData>>;
  update: Handler<AuthEnv, string, Input, HonoResponse<FileData>>;
  delete: Handler<AuthEnv>;
}

export type FileData = {
  path: string;
  name: string;
};

export type UploadData = {
  path: string;
  file: File;
};

export interface IWorkController {
  getAll: Handler<Env, string, Input, HonoResponse<WorkData[]>>;
  getByTitle: Handler<Env, string, Input, HonoResponse<WorkData>>;
  add: Handler<AuthEnv, string, Input, HonoResponse<WorkData>>;
  update: Handler<AuthEnv, string, Input, HonoResponse<WorkData>>;
  delete: Handler<AuthEnv>;
}

export type Repo = {
  url: string;
  branch: string;
};

export type Techs = string[];

export type WorkData = {
  id: string;
  title: string;
  description: string;
  techs: Techs;
  repo: Repo;
  projectUrl?: string;
  thumbnail: FileData;
  created_at?: string;
};

export type WorkInputData = Omit<WorkData, 'id'>;

interface Model<Schema, Input, Data> {
  getAll(): Promise<Data[]>;
  create(input: Input): Promise<(Data | undefined) | string>;
  update(
    key: string,
    input: Input,
    isAuth?: boolean,
  ): Promise<Data | undefined>;
  remove(key: string, isAuth?: boolean): Promise<number>;
}

export interface UserSchema {
  _id: ObjectId;
  username: string;
  password: string;
  name: string;
  email: string;
}

export interface UserModel extends Model<UserSchema, UserSignupData, UserData> {
  findByUsername(username: string): Promise<UserData | undefined>;
  findById(id: string): Promise<UserData | undefined>;
  create(user: UserSignupData): Promise<string>;
}

export interface UploadSchema {
  _id: ObjectId;
  fileName: string;
  fileUrl: string;
}

export type TransformOptions = {
  width?: number;
  height?: number;
  resize?: 'cover' | 'contain' | 'fill';
  quality?: number;
  format?: 'origin';
};

export type DownloadOptions = {
  isAuth?: boolean;
  transform?: TransformOptions;
};

export type DataOrError<Data, E extends Error> = {
  data: Data;
  error: null;
} | {
  data: null;
  error: E;
};

export interface UploadModel {
  download(
    path: string,
    options?: DownloadOptions,
  ): Promise<DataOrError<Blob, StorageError>>;
  upload(
    file: UploadData,
    isAuth?: boolean,
  ): Promise<DataOrError<FileData, StorageError>>;
  update(
    path: string,
    file: UploadData,
    isAuth?: boolean,
  ): Promise<DataOrError<FileData, StorageError>>;
  remove(
    key: string,
    isAuth?: boolean,
  ): Promise<DataOrError<number, StorageError>>;
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
  getByTitle(title: string): Promise<WorkData | undefined>;
  create(work: WorkInputData, isAuth?: boolean): Promise<WorkData | undefined>;
}

export type SupabaseWithAuth = {
  withAuth: Supabase;
  withoutAuth: Supabase;
};

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

export interface Database {
  public: {
    Tables: {
      works: {
        Row: {
          created_at: string | null;
          description: string;
          id: string;
          projectUrl: string | null;
          repo: Json;
          techs: string[];
          thumbnail: Json;
          title: string;
        };
        Insert: {
          created_at?: string | null;
          description?: string;
          id: string;
          projectUrl?: string | null;
          repo: Json;
          techs: string[];
          thumbnail: Json;
          title?: string;
        };
        Update: {
          created_at?: string | null;
          description?: string;
          id?: string;
          projectUrl?: string | null;
          repo?: Json;
          techs?: string[];
          thumbnail?: Json;
          title?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      install_available_extensions_and_test: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
