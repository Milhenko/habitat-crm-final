'use client'

import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { UserCircle2, LogOut, ChevronDown } from 'lucide-react'
import { useState } from 'react'

export default function GlobalHeader() {
    const { user, loading, signOut } = useAuth()
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    const canSeeMarketing = user?.role === "Super Administrador" || user?.role === "Administrador de Marketing"

    return (
        <nav className="bg-[#1E2D40] shadow-lg sticky top-0 z-50">
            <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between">
                {/* Logo */}
                <Link href="/clientes" className="flex items-center">
                    <img
                        src="/images/logo.png"
                        alt="Habitat Realty Group"
                        className="h-12 w-auto"
                    />
                </Link>

                {/* Navigation Links */}
                <div className="flex items-center gap-1">
                    <Link href="/clientes" className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all">
                        Contactos
                    </Link>
                    <Link href="/captacion" className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all">
                        Captaciones
                    </Link>
                    <Link href="/inventario" className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all">
                        Inventario
                    </Link>
                    <Link href="/ventas" className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all">
                        Pipeline de Ventas
                    </Link>
                    {canSeeMarketing && (
                        <>
                            <Link href="/marketing" className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all">
                                Marketing
                            </Link>
                            <Link href="/automatizacion" className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all">
                                Automatización
                            </Link>
                        </>
                    )}
                </div>

                {/* User Profile */}
                <div className="relative">
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="flex items-center gap-3 hover:bg-white/5 rounded-lg px-3 py-2 transition-all"
                    >
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white text-xs font-bold">
                            {loading ? (
                                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                user?.initials || "?"
                            )}
                        </div>
                        <div className="hidden md:block text-left">
                            <p className="text-white text-xs font-bold leading-none">
                                {loading ? "Cargando..." : (user?.name || "Invitado")}
                            </p>
                            <p className="text-white/50 text-[10px] mt-1">
                                {loading ? "Verificando..." : (user?.role || "Acceso Limitado")}
                            </p>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-white/50 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isMenuOpen && !loading && (
                        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl py-2 overflow-hidden border border-gray-100">
                            <Link
                                href="/perfil"
                                onClick={() => setIsMenuOpen(false)}
                                className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all"
                            >
                                <UserCircle2 className="w-4 h-4" /> Mi Perfil
                            </Link>
                            <button
                                onClick={() => { signOut(); setIsMenuOpen(false); }}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 transition-all border-t border-gray-50 mt-1"
                            >
                                <LogOut className="w-4 h-4" /> Cerrar Sesión
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    )
}