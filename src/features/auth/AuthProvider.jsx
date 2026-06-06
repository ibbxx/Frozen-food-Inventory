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

    async function bootstrap() {
      const {
        data: { session: currentSession },
        error,
      } = await supabase.auth.getSession();

      if (!isMounted) {
        return;
      }

      if (error) {
        setAuthError(error.message);
      }

      setSession(currentSession);

      if (currentSession?.user?.id) {
        try {
          const currentProfile = await fetchProfile(currentSession.user.id);
          if (isMounted) {
            setProfile(currentProfile);
          }
        } catch (profileError) {
          if (isMounted) {
            setAuthError(profileError.message);
          }
        }
      }

      if (isMounted) {
        setLoading(false);
      }
    }

    bootstrap();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      if (!isMounted) {
        return;
      }

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
            setProfile(null);
            setAuthError(profileError.message);
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
