'use client';

import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';

export const supabase = createBrowserSupabaseClient({
  // These must match what you’ve set in Vercel (and in .env.local)
  supabaseUrl:  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseKey:  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
});

