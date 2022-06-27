import 'dotenv/load.ts';
import { envConfig } from '../deps.ts';
import { Config, DatabaseOptions } from './types.ts';

envConfig();

function required(key: string, defaultValue?: string): string {
  const value = Deno.env.get(key) || defaultValue;
  if (value == null) {
    throw new Error(`Key ${key} is undefined`);
  }
  return value;
}

const database: DatabaseOptions = {
  name: required('DATABASE_NAME')!,
  host: required('DATABASE_HOST')!,
};

export const config: Config = {
  database,
};
