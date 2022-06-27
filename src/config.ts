import 'https://deno.land/std@0.145.0/dotenv/load.ts';
import { envConfig } from '../deps.ts';
import { Config, DatabaseOptions, CloudinaryOptions } from './types.ts';

envConfig();

const database: DatabaseOptions = {
  name: Deno.env.get('DATABASE_NAME')!,
  host: Deno.env.get('DATABASE_HOST')!,
};

const cloudinary: CloudinaryOptions = {
  uploadPreset: Deno.env.get('CLOUDINARY_UPLOAD_PRESET')!,
  cloudId: Deno.env.get('CLOUDINARY_CLOUD_ID')!,
};

export const config: Config = {
  database,
  cloudinary,
};
