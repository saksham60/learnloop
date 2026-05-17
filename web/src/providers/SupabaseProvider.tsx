"use client";

import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { Session, User } from "@supabase/supabase-js";

import { getSupabaseBrowserClient, hasSupabaseEnv } from "@/lib/supabase/client";

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  isReady: boolean;
  isEnabled: boolean;
};

const AuthContext = createContext<AuthContextValue>({
  session: null,
  user: null,
  isReady: false,
  isEnabled: false,
});

export function SupabaseProvider({ children }: PropsWithChildren) {
  const isEnabled = hasSupabaseEnv();
  const [session, setSession] = useState<Session | null>(null);
  const [isReady, setIsReady] = useState(!isEnabled);

  useEffect(() => {
    const client = getSupabaseBrowserClient();
    if (!client) {
      return;
    }

    let mounted = true;
    client.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session ?? null);
      setIsReady(true);
    });

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setIsReady(true);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [isEnabled]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      isReady,
      isEnabled,
    }),
    [isEnabled, isReady, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useSupabaseAuth() {
  return useContext(AuthContext);
}
