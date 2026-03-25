"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Building2 } from "lucide-react";

export default function Home() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (user) {
                router.push("/clientes");
            } else {
                router.push("/login");
            }
        }
    }, [loading, user, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#EBEAE6]">
            <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-[#1E2D40] rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
                    <Building2 className="text-white w-8 h-8" />
                </div>
                <p className="text-[#1A1A1A]/50 font-medium">Cargando CRM Habitat...</p>
            </div>
        </div>
    );
}