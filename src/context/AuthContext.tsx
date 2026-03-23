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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [users, setUsers] = useState<User[]>([]);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            const { data, error } = await supabase.from("users").select("*");
            if (error) { console.error(error); return; }
            const mapped: User[] = data.map((u: any) => ({
                id: u.id,
                name: u.name,
                role: u.role as Role,
                initials: u.initials,
                email: u.email,
            }));
            setUsers(mapped);
            setUser(mapped[0] ?? null);
            setLoading(false);
        };
        fetchUsers();
    }, []);

    const setRole = (role: Role) => {
        const found = users.find((u) => u.role === role);
        if (found) setUser(found);
    };

    return (
        <AuthContext.Provider value={{ user, users, setRole, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) throw new Error("useAuth must be used within AuthProvider");
    return context;
}