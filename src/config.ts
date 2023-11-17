import { loadSync } from '$std/dotenv/mod.ts';
import { CorsOptions } from 'cors';
import {
  BcryptOptions,
  Config,
  CORSOptions,
  HConfig,
  JwtOptions,
  MongodbOptions,
  RateLimitOptions,
  SupabaseOptions,
} from '~/types.ts';

loadSync({ allowEmptyValues: true, export: true });

const isTest = Deno.args.includes('test');

function required(key: string, defaultValue?: string): string {
  const value = Deno.env.get(`${key}${isTest ? '_TEST' : ''}`) || defaultValue;
  if (value == null) {
    throw new Error(`Key ${key} is undefined`);
  }
  return value;
}

const bcrypt: BcryptOptions = {
  saltRound: parseInt(required('BCRYPT_SALT_ROUND', '12')),
};

const jwt: JwtOptions = {
  secretKey: required('JWT_SECRET_KEY'),
  expiresInSec: parseInt(required('JWT_EXPIRES_IN_SEC', '86400')),
};

const cors: CorsOptions = {
  origin: new RegExp(required('CORS_ALLOW_ORIGIN')),
};

const hCors: CORSOptions = {
  origin: required('CORS_ALLOW_ORIGIN'),
};

const mongodb: MongodbOptions = {
  name: required('DATABASE_NAME')!,
  host: required('DATABASE_HOST')!,
};

const supabase: SupabaseOptions = {
  url: required('SUPABASE_URL')!,
  key: required('SUPABASE_KEY')!,
  serviceRole: required('SUPABASE_SERVICE_ROLE')!,
};

const rateLimit: RateLimitOptions = {
  windowMs: parseInt(required('RATE_LIMIT_WINDOW_MS', '60000')),
  maxRequest: parseInt(required('RATE_LIMIT_MAX_REQUEST', '100')),
};

const config: Config = {
  bcrypt,
  jwt,
  cors,
  mongodb,
  supabase,
  rateLimit,
};
export const hConfig: HConfig = {
  bcrypt,
  jwt,
  cors: hCors,
  mongodb,
  supabase,
  rateLimit,
};

export default config;
