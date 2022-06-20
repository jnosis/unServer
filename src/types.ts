import { firebase } from '../deps.ts';

export interface FirebaseOptions {
  apiKey?: string;
  authDomain?: string;
  databaseURL?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  measurementId?: string;
}

export interface CloudinaryOptions {
  uploadPreset: string;
  cloudId: string;
}

export interface Config {
  firebase: FirebaseOptions;
  cloudinary: CloudinaryOptions;
}
