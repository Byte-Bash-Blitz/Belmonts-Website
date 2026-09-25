import { createClient } from '@supabase/supabase-js';

// Get credentials from Vite environment variables or localStorage override
const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const storedUrl = typeof window !== 'undefined' ? localStorage.getItem('HYNA_SUPABASE_URL') || '' : '';
const storedKey = typeof window !== 'undefined' ? localStorage.getItem('HYNA_SUPABASE_KEY') || '' : '';

export const SUPABASE_URL = (envUrl || storedUrl).trim();
export const SUPABASE_ANON_KEY = (envKey || storedKey).trim();

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL && 
  SUPABASE_ANON_KEY && 
  SUPABASE_URL.startsWith('http')
);

export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : null;
