export type DatabaseOptions = {
  name: string;
  host: string;
};

export type CloudinaryOptions = {
  uploadPreset: string;
  cloudId: string;
};

export type Config = {
  database: DatabaseOptions;
  cloudinary: CloudinaryOptions;
};
