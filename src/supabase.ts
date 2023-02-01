import { createClient } from 'supabase';
import config from '~/config.ts';

export const supabase = createClient(
  config.supabase.url,
  config.supabase.key,
);
