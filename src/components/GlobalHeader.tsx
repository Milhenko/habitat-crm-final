'use client'

import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { Building2, UserCircle2, LogOut, ChevronDown } from 'lucide-react'
import { useState } from 'react'

export default function GlobalHeader() {
  const { user, loading, signOut } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const canSeeMarketing = user?.role === "Super Administrador" || user?.role === "Administrador de Marketing"

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/clientes" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <Building2 className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tighter">
              CRM <span className="text-blue-600">Habitat</span>
            </h1>
          </div>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-1">
          <Link href="/clientes" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all">
            Contactos
          </Link>
          <Link href="/captacion" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all">
            Captaciones
          </Link>
          <Link href="/inventario" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all">
            Inventario
          </Link>
          <Link href="/ventas" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all">
            Pipeline de Ventas
          </Link>
          {canSeeMarketing && (
            <>
              <Link href="/marketing" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all">
                Marketing
              </Link>
              <Link href="/automatizacion" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all">
                Automatización
              </Link>
            </>
          )}
        </div>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-3 p-1.5 rounded-2xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100"
          >
            <div className="text-right hidden sm:block">
              <p className="text-xs font-black text-gray-900 leading-none">{user?.name || "Cargando..."}</p>
              <p className="text-[10px] text-blue-600 font-bold mt-1 uppercase">{user?.role || ""}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-black text-sm">
              {user?.initials || "?"}
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>
          {isMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 overflow-hidden">
              <Link
                href="/perfil"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all"
              >
                <UserCircle2 className="w-4 h-4" /> Mi Perfil
              </Link>
              <button
                onClick={() => { signOut(); setIsMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 transition-all"
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