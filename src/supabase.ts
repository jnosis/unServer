import { createClient } from 'supabase';
import type { Database } from '~/types.ts';
import config from '~/config.ts';

export const supabase = createClient<Database>(
  config.supabase.url,
  config.supabase.key,
);

export const supabaseWithAuth = createClient<Database>(
  config.supabase.url,
  config.supabase.serviceRole,
);

const db = supabase;

export type Supabase = typeof db;
