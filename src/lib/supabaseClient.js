import { createClient } from '@supabase/supabase-js';

// Primary hardcoded project defaults so client NEVER fails on any device or fresh browser
export const DEFAULT_SUPABASE_URL = 'https://xzkjltoglnitsgiryjqj.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_VQL1RpHSUCi8R6c0hQxjhA_Ia_hvEh-';

// Get credentials from Vite environment variables or localStorage override
const envUrl = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_URL || '').trim();
const envKey = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

const storedUrl = typeof window !== 'undefined' ? (localStorage.getItem('HYNA_SUPABASE_URL') || '').trim() : '';
const storedKey = typeof window !== 'undefined' ? (localStorage.getItem('HYNA_SUPABASE_KEY') || '').trim() : '';

export let SUPABASE_URL = envUrl || storedUrl || DEFAULT_SUPABASE_URL;
export let SUPABASE_ANON_KEY = envKey || storedKey || DEFAULT_SUPABASE_ANON_KEY;

export let isSupabaseConfigured = Boolean(
  SUPABASE_URL && 
  SUPABASE_ANON_KEY && 
  SUPABASE_URL.startsWith('http')
);

let clientInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export const initSupabase = (url, key) => {
  const cleanUrl = (url || '').trim();
  const cleanKey = (key || '').trim();
  if (cleanUrl && cleanKey && cleanUrl.startsWith('http')) {
    SUPABASE_URL = cleanUrl;
    SUPABASE_ANON_KEY = cleanKey;
    isSupabaseConfigured = true;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('HYNA_SUPABASE_URL', cleanUrl);
        localStorage.setItem('HYNA_SUPABASE_KEY', cleanKey);
      } catch {}
    }
    clientInstance = createClient(cleanUrl, cleanKey, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
    return clientInstance;
  }
  return null;
};

export const syncConfigFromServer = async () => {
  if (isSupabaseConfigured && clientInstance) return true;
  try {
    const res = await fetch('/api/quiz/config');
    if (res.ok) {
      const data = await res.json();
      if (data && data.supabaseUrl && data.supabaseAnonKey && data.supabaseUrl.startsWith('http')) {
        initSupabase(data.supabaseUrl, data.supabaseAnonKey);
        return true;
      }
    }
  } catch {}
  return false;
};

// Proxy export so existing calls `supabase.from(...)` and methods work seamlessly
export const supabase = new Proxy({}, {
  get(target, prop) {
    if (clientInstance && prop in clientInstance) {
      const val = clientInstance[prop];
      if (typeof val === 'function') {
        return val.bind(clientInstance);
      }
      return val;
    }
    return undefined;
  }
});
