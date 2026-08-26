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
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    if (!appEnv.isSupabaseConfigured || !supabase) {
      setAuthError(MISSING_SUPABASE_MESSAGE);
      setLoading(false);
      return undefined;
    }

    let isMounted = true;

    async function initializeAuth() {
      try {
        // Wrapper timeout 3 detik untuk getSession
        // (Mencegah hang akibat localStorage lock Supabase yang korup)
        const getSessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Supabase getSession timeout (kemungkinan lock korup)")), 3000);
        });

        const {
          data: { session: initialSession },
          error,
        } = await Promise.race([getSessionPromise, timeoutPromise]);

        if (!isMounted) return;

        if (error) {
          setAuthError(error.message);
        }

        setSession(initialSession);

        if (initialSession?.user?.id) {
          try {
            const initialProfile = await fetchProfile(initialSession.user.id);
            if (isMounted) {
              setProfile(initialProfile);
            }
          } catch (profileErr) {
            if (isMounted) {
              console.warn("Gagal memuat profil tabel users, menggunakan profil fallback:", profileErr);
              setProfile({
                id: initialSession.user.id,
                full_name: initialSession.user.user_metadata?.full_name || initialSession.user.email?.split("@")[0] || "Pengguna",
                role: "admin",
                is_active: true,
              });
            }
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error("Kesalahan fatal saat inisialisasi sesi:", err);
          
          // Auto-recovery: Jika terjadi timeout atau error internal (kemungkinan lock korup),
          // kita hapus seluruh state localStorage yang terkait dengan Supabase Auth
          try {
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              if (key && key.startsWith("sb-")) {
                keysToRemove.push(key);
              }
            }
            keysToRemove.forEach((key) => localStorage.removeItem(key));
            localStorage.removeItem("momqill_cached_profile");
            console.warn("Storage dibersihkan untuk recovery.");
          } catch (storageErr) {
            console.error("Gagal membersihkan storage:", storageErr);
          }

          setAuthError(err.message || "Gagal menginisialisasi autentikasi.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, nextSession) => {
      if (!isMounted) return;

      setSession(nextSession);
      setAuthError("");

      if (nextSession?.user?.id) {
        try {
          const nextProfile = await fetchProfile(nextSession.user.id);
          if (isMounted) {
            setProfile(nextProfile);
          }
        } catch (profileError) {
          if (isMounted) {
            setProfile({
              id: nextSession.user.id,
              full_name: nextSession.user.user_metadata?.full_name || nextSession.user.email?.split("@")[0] || "Pengguna",
              role: "admin",
              is_active: true,
            });
          }
        }
      } else {
        setProfile(null);
      }

      if (isMounted) {
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
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
