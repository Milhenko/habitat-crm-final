"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  // Mostrar spinner mientras verifica
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#EBEAE6]">
        <div className="w-8 h-8 border-4 border-[#1E2D40] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Si NO hay usuario, NO mostrar nada (se redirigirá)
  if (!user) {
    return null;
  }

  // Si hay usuario, mostrar el contenido
  return <>{children}</>;
}
