import type { ParamsDictionary, RequestHandler } from 'opine';
import type { CorsOptions } from 'cors';
import type { ObjectId } from 'mongo';
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

export type RateLimitOptions = {
  windowMs: number;
  maxRequest: number;
};

export type Config = {
  bcrypt: BcryptOptions;
  jwt: JwtOptions;
  cors: CorsOptions;
  mongodb: MongodbOptions;
  supabase: SupabaseOptions;
  rateLimit: RateLimitOptions;
};
export type HConfig = {
  bcrypt: BcryptOptions;
  jwt: JwtOptions;
  cors: CORSOptions;
  mongodb: MongodbOptions;
  supabase: SupabaseOptions;
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

export type Techs = string[];

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
