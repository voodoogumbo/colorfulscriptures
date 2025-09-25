import { createClient, SupabaseClient } from '@supabase/supabase-js';

export function resolveSupabaseConfig() {
  const url =
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? null;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? null;
  const anonKey = process.env.SUPABASE_ANON_KEY ?? null;
  const key = serviceRoleKey ?? anonKey ?? null;

  if (!url || !key) {
    console.error(
      'Supabase configuration missing. Expect SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY).'
    );
    return { url: null, key: null };
  }

  return { url, key };
}

export function createSupabaseServerClient(): SupabaseClient | null {
  const { url, key } = resolveSupabaseConfig();
  if (!url || !key) {
    return null;
  }
  return createClient(url, key);
}
