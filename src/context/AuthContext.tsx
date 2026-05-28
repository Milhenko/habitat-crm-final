
"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase";

export type Role = "Super Administrador" | "Coordinador Comercial" | "Administrador de Marketing" | "Asesor";

export interface User {
  id: string;
  name: string;
  role: Role;
  initials: string;
  email: string;
  avatar_url?: string | null;
}

interface AuthContextType {
  user: User | null;
  users: User[];
  setRole: (role: Role) => void;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (isMounted && session?.user) {
          await loadProfile(session.user.id);
        } else if (isMounted) {
          setLoading(false);
        }
      } catch (e) {
        console.error("Error en init:", e);
        if (isMounted) setLoading(false);
      }
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;
      // INITIAL_SESSION is already handled by init() above — skip to avoid double loadProfile
      if (event === 'INITIAL_SESSION') return;

      if (session?.user) {
        await loadProfile(session.user.id);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const loadProfile = async (authId: string) => {
    try {
      const { data } = await supabase
        .from("users")
        .select("*")
        .eq("id", authId)
        .single();

      if (data) {
        setUser({
          id: data.id,
          name: data.name,
          role: data.role as Role,
          initials: data.initials,
          email: data.email,
          avatar_url: data.avatar_url || null
        });
      }

      const { data: allUsers } = await supabase.from("users").select("*");
      if (allUsers) {
        setUsers(allUsers.map((u: any) => ({
          id: u.id,
          name: u.name,
          role: u.role as Role,
          initials: u.initials,
          email: u.email,
          avatar_url: u.avatar_url || null
        })));
      }
    } catch (e) {
      console.error("Error loading profile:", e);
    }
    setLoading(false);
  };

  const setRole = (role: Role) => {
    const found = users.find((u) => u.role === role);
    if (found) setUser(found);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, users, setRole, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
