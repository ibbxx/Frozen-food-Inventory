import { createClient } from "@supabase/supabase-js";

import { appEnv } from "./env";

export const publicSupabase = appEnv.isSupabaseConfigured
  ? createClient(appEnv.supabaseUrl, appEnv.supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    })
  : null;
