import 'dotenv/load.ts';
import { config as envConfig } from 'dotenv';
import type { CorsOptions } from 'cors';
import { BcryptOptions, Config, DatabaseOptions, JwtOptions } from './types.ts';

const isTest = Deno.args.includes('test');

envConfig();

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
  origin: required('CORS_ALLOW_ORIGIN'),
};

const database: DatabaseOptions = {
  name: required('DATABASE_NAME')!,
  host: required('DATABASE_HOST')!,
};

const config: Config = {
  bcrypt,
  jwt,
  cors,
  database,
};

export default config;
