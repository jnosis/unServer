import type { Env, Handler, Input, TypedResponse } from 'hono';
import type { ObjectId } from 'mongo';
import type { StorageError } from 'supabase/storage';
import type { Supabase } from '~/supabase.ts';

export type ServerOptions = {
  readonly name: string;
};

export type BcryptOptions = {
  readonly saltRound: number;
};

export type CORSOptions = {
  readonly origin:
    | string
    | string[]
    | ((origin: string) => string | undefined | null);
  readonly allowMethods?: string[];
  readonly allowHeaders?: string[];
  readonly maxAge?: number;
  readonly credentials?: boolean;
  readonly exposeHeaders?: string[];
};

export type JoinOptions = {
  readonly apiKey: string;
  readonly deviceId: string;
};

export type JwtOptions = {
  readonly secretKey: string;
  readonly expiresInSec: number;
};

export type MongodbOptions = {
  readonly name: string;
  readonly host: string;
};

export type RecordOptions = {
  readonly expireIn: number;
};

export type SupabaseOptions = {
  readonly url: string;
  readonly key: string;
  readonly serviceRole: string;
};

export type UploadOptions = {
  readonly maxFileSize: number;
};

export type Config = {
  readonly server: ServerOptions;
  readonly bcrypt: BcryptOptions;
  readonly join: JoinOptions;
  readonly jwt: JwtOptions;
  readonly cors: CORSOptions;
  readonly mongodb: MongodbOptions;
  readonly record: RecordOptions;
  readonly supabase: SupabaseOptions;
  readonly upload: UploadOptions;
};

type HonoResponse<T> = TypedResponse<T> | Promise<TypedResponse<T>>;

export type IController<P extends string> = {
  [path in P]: Handler;
};

export type AuthEnv = {
  Variables: {
    userId: string;
    token: string;
  };
};

export type UserPath = 'signup' | 'login' | 'logout' | 'me';
export interface IUserController extends IController<UserPath> {
  signup: Handler<AuthEnv, string, Input, HonoResponse<AuthToken>>;
  login: Handler<AuthEnv, string, Input, HonoResponse<AuthToken>>;
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

type UploadPath = 'upload' | 'update' | 'delete';
export interface IUploadController extends IController<UploadPath> {
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

type WorkPath = 'getAll' | 'getByTitle' | 'add' | 'update' | 'delete';
export interface IWorkController extends IController<WorkPath> {
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
