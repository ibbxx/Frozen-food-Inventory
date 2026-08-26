import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { appEnv } from "@/shared/lib/env";
import { supabase } from "@/shared/lib/supabase";

const AuthContext = createContext(null);
const MISSING_SUPABASE_MESSAGE =
  "Supabase belum dikonfigurasi. Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY untuk menggunakan Momqill.";

async function fetchProfile(userId) {
  if (!supabase || !userId) {
    return null;
  }

  const { data, error } = await supabase
    .from("users")
    .select("id, email, full_name, role")
    .eq("id", userId)
    .single();

  if (error) {
    throw error;
  }

  return {
    id: data.id,
    full_name: data.full_name || data.email?.split("@")[0] || "Pengguna",
    role: data.role,
    is_active: true,
  };
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(() => {
    try {
      const cached = localStorage.getItem("momqill_cached_profile");
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(() => {
    try {
      const hasToken = Object.keys(localStorage).some(
        (key) => key.startsWith("sb-") && key.endsWith("-auth-token")
      );
      const cachedProfile = localStorage.getItem("momqill_cached_profile");
      if (hasToken && cachedProfile) {
        return false; // Optimistic bypass! Render instantly on refresh.
      }
    } catch {}
    return true;
  });
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    if (!appEnv.isSupabaseConfigured || !supabase) {
      setAuthError(MISSING_SUPABASE_MESSAGE);
      setLoading(false);
      return undefined;
    }

    let isMounted = true;

    // Fallback timeout 3.5 detik untuk menjamin loader tidak stuck jika Supabase hang/terblokir
    const fallbackTimeout = setTimeout(() => {
      if (isMounted) {
        console.warn("Inisialisasi Auth timed out. Memaksa loading selesai.");
        setLoading(false);
      }
    }, 3500);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, nextSession) => {
      if (!isMounted) {
        return;
      }

      try {
        setSession(nextSession);
        setAuthError("");

        if (nextSession?.user?.id) {
          try {
            const nextProfile = await fetchProfile(nextSession.user.id);
            if (isMounted) {
              setProfile(nextProfile);
              try {
                localStorage.setItem("momqill_cached_profile", JSON.stringify(nextProfile));
              } catch {}
            }
          } catch (profileError) {
            if (isMounted) {
              const cached = localStorage.getItem("momqill_cached_profile");
              if (!cached) {
                setProfile(null);
                setAuthError(profileError.message || "Gagal memuat profil.");
              }
            }
          }
        } else {
          setProfile(null);
          try {
            localStorage.removeItem("momqill_cached_profile");
          } catch {}
        }
      } catch (err) {
        if (isMounted) {
          setAuthError(err.message || "Gagal memperbarui status autentikasi.");
        }
      } finally {
        if (isMounted) {
          clearTimeout(fallbackTimeout);
          setLoading(false);
        }
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(fallbackTimeout);
      subscription.unsubscribe();
    };
  }, []);

  async function signIn({ email, password }) {
    if (!supabase) {
      throw new Error(MISSING_SUPABASE_MESSAGE);
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }
  }

  async function signOut() {
    if (!supabase) {
      setSession(null);
      setProfile(null);
      return;
    }

    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
  }

  const value = useMemo(
    () => ({
      authError,
      isSupabaseConfigured: appEnv.isSupabaseConfigured,
      loading,
      profile,
      session,
      signIn,
      signOut,
    }),
    [authError, loading, profile, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}
