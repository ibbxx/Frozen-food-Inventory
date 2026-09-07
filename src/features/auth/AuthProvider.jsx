import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { appEnv } from "@/shared/lib/env";
import { supabase } from "@/shared/lib/supabase";

const AuthContext = createContext(null);
const MISSING_SUPABASE_MESSAGE =
  "Supabase belum dikonfigurasi. Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY untuk menggunakan sistem Karunrung Frozen Food.";

function sanitizeDisplayName(name, email, role) {
  const fallback = role === "admin" ? "Admin Gudang" : "Staf Gudang";
  if (!name || typeof name !== "string") {
    return fallback;
  }
  const trimmed = name.trim();
  if (
    trimmed === "" ||
    /ibnu(f|g)ajar/i.test(trimmed) ||
    trimmed.includes("@") ||
    (email && trimmed.toLowerCase() === email.split("@")[0].toLowerCase())
  ) {
    return fallback;
  }
  return trimmed;
}

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
    full_name: sanitizeDisplayName(data.full_name, data.email, data.role),
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

    // 1. Ambil sesi awal tanpa timeout destruktif yang menghapus localStorage
    supabase.auth
      .getSession()
      .then(({ data: { session: initialSession }, error }) => {
        if (!isMounted) return;
        if (error) {
          setAuthError(error.message);
        }
        setSession(initialSession);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.warn("Peringatan saat inisialisasi sesi:", err);
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    // 2. Listener auth dibuat murni sinkron untuk menghindari deadlock internal GoTrue/Supabase
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!isMounted) return;
      setSession(nextSession);
      setAuthError("");
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // 3. Muat data profil user secara asinkron di effect terpisah setelah sesi siap
  useEffect(() => {
    let isMounted = true;

    if (!session?.user?.id) {
      setProfile(null);
      return undefined;
    }

    async function loadProfile() {
      try {
        const userProfile = await fetchProfile(session.user.id);
        if (isMounted) {
          setProfile(userProfile);
        }
      } catch (profileErr) {
        if (isMounted) {
          console.warn(
            "Gagal memuat profil tabel users, menggunakan profil fallback:",
            profileErr,
          );
          setProfile({
            id: session.user.id,
            full_name: sanitizeDisplayName(
              session.user.user_metadata?.full_name,
              session.user.email,
              "admin",
            ),
            role: "admin",
            is_active: true,
          });
        }
      }
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [session?.user?.id]);

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
