import { supabase as rawSupabase } from "@/shared/lib/supabase";

import type { Database } from "../types/database";
import type { SupabaseClient } from "@supabase/supabase-js";

export const momqillSupabase = rawSupabase as SupabaseClient<Database> | null;
