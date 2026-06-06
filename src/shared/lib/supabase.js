import { createClient } from "@supabase/supabase-js";

import { appEnv } from "./env";

export const supabase = appEnv.isSupabaseConfigured
  ? createClient(appEnv.supabaseUrl, appEnv.supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : null;
