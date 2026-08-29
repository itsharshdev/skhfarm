import { createClient } from '@supabase/supabase-js';

const env = (import.meta as any).env || {};
const supabaseUrl =
  env.VITE_SUPABASE_URL || 'https://xfivsdalirigtdkpwopp.supabase.co';
const supabaseAnonKey =
  env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmaXZzZGFsaXJpZ3Rka3B3b3BwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4NzcxOTksImV4cCI6MjEwMzQ1MzE5OX0.-D0poolcIBVExXH2UC_4XcFrTjw2c1jFmAvtUzstemo';


export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
