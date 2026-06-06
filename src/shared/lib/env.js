const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || "";
const publicWhatsappNumber = import.meta.env.VITE_PUBLIC_WHATSAPP_NUMBER?.trim() || "";

export const appEnv = {
  supabaseUrl,
  supabaseAnonKey,
  publicWhatsappNumber,
  isSupabaseConfigured: Boolean(supabaseUrl && supabaseAnonKey),
};
