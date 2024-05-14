import config from '~/config.ts';

export const checkMinFileSize = (file: File) => {
  return file.size > 0;
};
export const checkMaxFileSize = (file: File) => {
  return file.size < config.upload.maxFileSize;
};
export const checkFileIsImage = (file: File) => {
  return file.type.startsWith('image');
};
