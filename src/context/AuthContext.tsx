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

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Verificar sesión activa
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                await loadUserProfile(session.user.id);
            } else {
                setLoading(false);
            }
        };

        getSession();

        // Escuchar cambios de auth
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                await loadUserProfile(session.user.id);
            } else {
                setUser(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const loadUserProfile = async (authId: string) => {
        const { data, error } = await supabase
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

        // Cargar todos los usuarios para el simulador
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