import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";

export type AppRole = "employee" | "admin";

type AuthState = {
  user: User | null;
  session: Session | null;
  fullName: string;
  role: AppRole | null;
  loading: boolean;
  isAdmin: boolean;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(true);

  const loadDetails = async (nextUser: User | null) => {
    if (!nextUser) {
      setRole(null);
      setFullName("");
      return;
    }

    const [{ data: profile }, { data: roles }] = await Promise.all([
      supabase.from("profiles").select("full_name, email").eq("id", nextUser.id).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", nextUser.id),
    ]);

    const metaName = (nextUser.user_metadata?.["full_name"] as string | undefined) ?? "";
    setFullName(profile?.full_name ?? metaName ?? "");
    const rows = roles ?? [];
    setRole(
      rows.some((r) => r.role === "admin") ? "admin" : rows.length > 0 ? "employee" : "employee",
    );
  };

  const refresh = async () => {
    const { data } = await supabase.auth.getUser();
    setUser(data.user ?? null);
    await loadDetails(data.user ?? null);
  };

  useEffect(() => {
    let active = true;

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return;
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      void loadDetails(nextSession?.user ?? null);
      setLoading(false);
    });

    void supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      setSession(data.session);
      setUser(data.session?.user ?? null);
      await loadDetails(data.session?.user ?? null);
      setLoading(false);
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        fullName,
        role,
        loading,
        isAdmin: role === "admin",
        refresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
