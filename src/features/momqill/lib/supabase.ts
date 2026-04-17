import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase as rawSupabase } from "@/lib/supabase";
import type { Database } from "../types/database";

export const momqillSupabase = rawSupabase as SupabaseClient<Database> | null;
