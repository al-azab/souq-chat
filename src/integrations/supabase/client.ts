import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL      = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    '⛔ متغيرات البيئة مفقودة.\n' +
    'انسخ .env.example إلى .env وأضف VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY'
  );
}

// import { supabase } from "@/integrations/supabase/client";
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});