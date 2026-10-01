import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabasePublishableKey &&
  !supabaseUrl.includes('placeholder-project') &&
  !supabasePublishableKey.includes('placeholder-anon-key')
);

// Fallback placeholder URL and key if not yet configured in .env so build/lint succeeds
const finalUrl = supabaseUrl || 'https://placeholder-project.supabase.co';
const finalKey = supabasePublishableKey || 'placeholder-anon-key-configure-in-env';

export const supabase = createClient(finalUrl, finalKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
