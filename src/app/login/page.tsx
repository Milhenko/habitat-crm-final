"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Building2, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const { error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            setError("Correo o contraseña incorrectos.");
            setLoading(false);
            return;
        }

        router.push("/clientes");
    };

    return (
        <div className="min-h-screen bg-[#EBEAE6] flex items-center justify-center p-4">
            <div className="w-full max-w-md">

                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-[#1E2D40] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                        <Building2 className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-black text-[#1E2D40] tracking-tighter">CRM Habitat</h1>
                    <p className="text-[#1A1A1A]/50 text-sm mt-1">Ingresa a tu cuenta</p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    <form onSubmit={handleLogin} className="space-y-5">

                        <div>
                            <label className="form-label mb-2">Correo electrónico</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                <input
                                    type="email"
                                    className="form-input pl-9"
                                    placeholder="tu@habitatrealtygroupai.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="form-label mb-2">Contraseña</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="form-input pl-9 pr-10"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-[#1E2D40] hover:bg-[#1E2D40]/90 text-white font-bold rounded-xl transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                "Ingresar al CRM"
                            )}
                        </button>

                    </form>

                    <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                        <p className="text-xs text-gray-400">
                            ¿Olvidaste tu contraseña? Contacta al administrador.
                        </p>
                    </div>
                </div>

                <p className="text-center text-xs text-[#1A1A1A]/30 mt-6">
                    © 2026 Habitat Realty Group · CRM v2.0
                </p>
            </div>
        </div>
    );
}