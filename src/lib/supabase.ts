import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL;
const rawKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  (import.meta.env as unknown as Record<string, string | undefined>).VITE_SUPABASE_ANON_KEY;

const supabaseUrl = typeof rawUrl === 'string' ? rawUrl.trim() : '';
const supabasePublishableKey = typeof rawKey === 'string' ? rawKey.trim() : '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabasePublishableKey &&
  !supabaseUrl.includes('placeholder-project') &&
  !supabasePublishableKey.includes('placeholder-anon-key')
);

// Fallback placeholder URL and key if not yet configured in .env so build/lint succeeds
const finalUrl = isSupabaseConfigured ? supabaseUrl : 'https://placeholder-project.supabase.co';
const finalKey = isSupabaseConfigured ? supabasePublishableKey : 'placeholder-anon-key-configure-in-env';

export const supabase = createClient(finalUrl, finalKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
