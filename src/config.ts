import '$std/dotenv/load.ts';
import { CorsOptions } from 'cors';
import {
  BcryptOptions,
  Config,
  DatabaseOptions,
  JwtOptions,
  RateLimitOptions,
} from '~/types.ts';

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

const database: DatabaseOptions = {
  name: required('DATABASE_NAME')!,
  host: required('DATABASE_HOST')!,
};

const rateLimit: RateLimitOptions = {
  windowMs: parseInt(required('RATE_LIMIT_WINDOW_MS', '60000')),
  maxRequest: parseInt(required('RATE_LIMIT_MAX_REQUEST', '100')),
};

const config: Config = {
  bcrypt,
  jwt,
  cors,
  database,
  rateLimit,
};

export default config;
