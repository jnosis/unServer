import 'https://deno.land/std@0.145.0/dotenv/load.ts';
import { envConfig } from '../deps.ts';
import { Config, DatabaseOptions, CloudinaryOptions } from './types.ts';

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

const cloudinary: CloudinaryOptions = {
  uploadPreset: required('CLOUDINARY_UPLOAD_PRESET')!,
  cloudId: required('CLOUDINARY_CLOUD_ID')!,
};

export const config: Config = {
  database,
  cloudinary,
};
