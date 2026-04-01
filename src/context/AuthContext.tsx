"use client";

import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";

interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    initials: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        
        const loadUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user || !mounted) { setLoading(false); return; }
            
            const { data, error } = await supabase.from("users").select("*").eq("id", session.user.id).single();
            if (mounted) {
                if (!error && data) setUser(data);
                setLoading(false);
            }
        };

        loadUser();
        return () => { mounted = false };
    }, []);

    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
        window.location.href = "/login";
    };

    const value = useMemo(() => ({ user, loading, signOut }), [user, loading]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
};
