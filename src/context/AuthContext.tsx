'use client'

import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { clearLastPage } from "@/components/PageTracker";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  initials: string;
  avatar_url?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      const { data: userData } = await supabase
        .from('users')
        .select('id, name, email, role, initials, avatar_url')
        .eq('id', session.user.id)
        .single();

      if (userData) {
        setUser(userData);
      }
    }
    setLoading(false);
  };

  // Auto-logout después de 72 horas de inactividad
  useEffect(() => {
    if (!user) return

    const INACTIVITY_LIMIT = 72 * 60 * 60 * 1000 // 72 horas en milisegundos
    const LAST_ACTIVITY_KEY = 'habitat_last_activity'

    // Actualizar última actividad
    const updateActivity = () => {
      localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString())
    }

    // Verificar inactividad
    const checkInactivity = () => {
      const lastActivity = localStorage.getItem(LAST_ACTIVITY_KEY)
      if (!lastActivity) {
        updateActivity()
        return
      }

      const timeSinceLastActivity = Date.now() - parseInt(lastActivity)
      if (timeSinceLastActivity > INACTIVITY_LIMIT) {
        signOut()
      }
    }

    // Eventos que cuentan como "actividad"
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart']
    events.forEach(event => window.addEventListener(event, updateActivity))

    // Verificar inactividad cada 5 minutos
    const interval = setInterval(checkInactivity, 5 * 60 * 1000)
    
    // Verificar al montar
    checkInactivity()

    return () => {
      events.forEach(event => window.removeEventListener(event, updateActivity))
      clearInterval(interval)
    }
  }, [user])

  useEffect(() => {
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        checkSession();
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    clearLastPage();
    await supabase.auth.signOut();
    setUser(null);
    window.location.href = "/login";
  };

  const value = useMemo(() => ({ user, loading, signOut }), [user, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
