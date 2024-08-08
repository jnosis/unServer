import type {
  BcryptOptions,
  Config,
  CORSOptions,
  JoinOptions,
  JwtOptions,
  MongodbOptions,
  RecordOptions,
  SupabaseOptions,
  UploadOptions,
} from '~/types.ts';

const MAX_FILE_SIZE = 512 * 1024 * 100;

function required(key: string, defaultValue?: string): string {
  const value = Deno.env.get(key) || defaultValue;
  if (value == null) {
    throw new Error(`Key ${key} is undefined`);
  }
  return value;
}

const bcrypt: BcryptOptions = {
  saltRound: parseInt(required('BCRYPT_SALT_ROUND', '12')),
};

const cors: CORSOptions = {
  origin: required('CORS_ALLOW_ORIGIN'),
};

const join: JoinOptions = {
  apiKey: required('JOIN_API_KEY'),
  deviceId: required('JOIN_DEVICE_ID', 'group.all'),
};

const jwt: JwtOptions = {
  secretKey: required('JWT_SECRET_KEY'),
  expiresInSec: parseInt(required('JWT_EXPIRES_IN_SEC', '86400')),
};

const mongodb: MongodbOptions = {
  name: required('DATABASE_NAME')!,
  host: required('DATABASE_HOST')!,
};

const record: RecordOptions = {
  expireIn: parseInt(required('RECORD_EXPIRE_IN', '60000')),
};

const supabase: SupabaseOptions = {
  url: required('SUPABASE_URL')!,
  key: required('SUPABASE_KEY')!,
  serviceRole: required('SUPABASE_SERVICE_ROLE')!,
};

const upload: UploadOptions = {
  maxFileSize: parseInt(
    required('UPLOAD_MAX_FILE_SIZE', MAX_FILE_SIZE.toString()),
  ),
};

export const config: Config = {
  bcrypt,
  cors,
  join,
  jwt,
  mongodb,
  record,
  supabase,
  upload,
} as const;

export default config;
