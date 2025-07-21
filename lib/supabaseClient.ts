import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Singleton pattern: ensure we don't create multiple clients in hot reload / SSR
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
