import 'https://deno.land/x/dotenv@v3.2.0/load.ts';
import { Config, FirebaseOptions, CloudinaryOptions } from './types.ts';
import { envConfig } from '../deps.ts';

envConfig();

const firebase: FirebaseOptions = {
  apiKey: Deno.env.get('FIREBASE_API_KEY'),
  authDomain: Deno.env.get('FIREBASE_AUTH_DOMAIN'),
  databaseURL: Deno.env.get('FIREBASE_DATABASE_URL'),
  projectId: Deno.env.get('FIREBASE_PROJECT_ID'),
};

const cloudinary: CloudinaryOptions = {
  uploadPreset: Deno.env.get('CLOUDINARY_UPLOAD_PRESET')!,
  cloudId: Deno.env.get('CLOUDINARY_CLOUD_ID')!,
};

export const config: Config = {
  firebase,
  cloudinary,
};
