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
const SESSION_TIMEOUT = 8 * 60 * 60 * 1000; // 8 horas en milisegundos

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        // Verificar timeout de inactividad
        const lastActivity = localStorage.getItem(SESSION_KEY);
        if (lastActivity) {
          const elapsed = Date.now() - parseInt(lastActivity);
          if (elapsed > SESSION_TIMEOUT) {
            console.log("⏱️ Sesión expirada por inactividad (8 horas)");
            await supabase.auth.signOut();
            localStorage.removeItem(SESSION_KEY);
            setLoading(false);
            return;
          }
        }

        // Verificar sesión actual
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          localStorage.setItem(SESSION_KEY, Date.now().toString());
          await loadProfile(session.user.id);
        } else {
          setLoading(false);
        }
      } catch (e) {
        console.error("Error en init:", e);
        setLoading(false);
      }
    };

    init();

    // Listener de cambios de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        localStorage.setItem(SESSION_KEY, Date.now().toString());
        await loadProfile(session.user.id);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    // Actualizar timestamp de actividad
    const updateActivity = () => {
      if (localStorage.getItem(SESSION_KEY)) {
        localStorage.setItem(SESSION_KEY, Date.now().toString());
      }
    };

    // Eventos de actividad
    window.addEventListener("click", updateActivity);
    window.addEventListener("keypress", updateActivity);
    window.addEventListener("mousemove", updateActivity);
    window.addEventListener("scroll", updateActivity);

    // Verificar timeout cada 5 minutos
    const checkTimeout = setInterval(() => {
      const lastActivity = localStorage.getItem(SESSION_KEY);
      if (lastActivity) {
        const elapsed = Date.now() - parseInt(lastActivity);
        if (elapsed > SESSION_TIMEOUT) {
          console.log("⏱️ Sesión expirada por inactividad (8 horas)");
          supabase.auth.signOut();
          localStorage.removeItem(SESSION_KEY);
          window.location.href = "/login";
        }
      }
    }, 5 * 60 * 1000); // Cada 5 minutos

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("click", updateActivity);
      window.removeEventListener("keypress", updateActivity);
      window.removeEventListener("mousemove", updateActivity);
      window.removeEventListener("scroll", updateActivity);
      clearInterval(checkTimeout);
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
