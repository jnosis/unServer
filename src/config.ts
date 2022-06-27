import 'https://deno.land/x/dotenv@v3.2.0/load.ts';
import { Config, DatabaseOptions, CloudinaryOptions } from './types.ts';
import { envConfig } from '../deps.ts';

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
