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
}

interface AuthContextType {
  user: User | null;
  users: User[];
  setRole: (role: Role) => void;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_KEY = "crm_last_activity";
const SESSION_TIMEOUT = 48 * 60 * 60 * 1000;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const lastActivity = localStorage.getItem(SESSION_KEY);
        if (lastActivity) {
          const elapsed = Date.now() - parseInt(lastActivity);
          if (elapsed > SESSION_TIMEOUT) {
            await supabase.auth.signOut();
            localStorage.removeItem(SESSION_KEY);
            setLoading(false);
            return;
          }
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          localStorage.setItem(SESSION_KEY, Date.now().toString());
          await loadProfile(session.user.id);
        } else {
          setLoading(false);
        }
      } catch (e) {
        setLoading(false);
      }
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        localStorage.setItem(SESSION_KEY, Date.now().toString());
        await loadProfile(session.user.id);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    const updateActivity = () => {
      if (localStorage.getItem(SESSION_KEY)) {
        localStorage.setItem(SESSION_KEY, Date.now().toString());
      }
    };
    window.addEventListener("click", updateActivity);
    window.addEventListener("keypress", updateActivity);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("click", updateActivity);
      window.removeEventListener("keypress", updateActivity);
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
    localStorage.removeItem(SESSION_KEY);
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
