"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  Building2, 
  DollarSign, 
  Warehouse, 
  Users, 
  Bell, 
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingDown,
  ChevronDown,
  Shield
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useAuth, Role } from "@/context/AuthContext";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const ALERTS = [
  { id: 1, text: "Alerta: Lead antiguo reactivado solicitando información.", icon: <Clock className="w-4 h-4 text-orange-500" />, time: "Hace 5 min" },
  { id: 2, text: "Marketing: Nueva captación pendiente de aprobación.", icon: <CheckCircle2 className="w-4 h-4 text-blue-500" />, time: "Hace 12 min" },
  { id: 3, text: "Comercial: Nueva propiedad publicada por Marketing.", icon: <Building2 className="w-4 h-4 text-green-500" />, time: "Hace 1 hora" },
  { id: 4, text: "Oportunidad: El Precio Actualizado es menor al Precio Inicial.", icon: <TrendingDown className="w-4 h-4 text-red-500" />, time: "Hoy, 10:30 AM" }
];

export default function Header() {
  const pathname = usePathname();
  const { user, setRole } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const roles: Role[] = ["Super Administrador", "Administrador de Marketing", "Asesor"];

  const navItems = [
    { name: "Panel", href: "/dashboard", icon: Home },
    { name: "Captación", href: "/", icon: Building2 },
    { name: "Ventas", href: "/ventas", icon: DollarSign },
    { name: "Inventario", href: "/inventario", icon: Warehouse },
    { name: "Clientes", href: "/clientes", icon: Users },
  ];

  return (
    <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-50">
      <div className="flex items-center justify-between w-full md:w-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
            <Building2 className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-zinc-100">
            CRM <span className="text-blue-600">Habitat</span>
          </span>
        </div>

        <div className="flex md:hidden items-center gap-2">
           <button className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg">
             <Bell className="w-5 h-5" />
           </button>
        </div>
      </div>
      
      <nav className="flex items-center gap-1 bg-white dark:bg-zinc-900 p-1 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm overflow-x-auto no-scrollbar">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap",
                isActive 
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" 
                  : "text-gray-500 hover:text-gray-900 dark:hover:text-zinc-100 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800"
              )}
            >
              <Icon className={cn("w-4 h-4", isActive ? "text-white" : "text-gray-400")} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="hidden md:flex items-center gap-4">
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-400 hover:text-blue-600 hover:border-blue-200 dark:hover:border-blue-900 dark:hover:text-blue-400 group rounded-xl shadow-sm transition-all relative"
          >
            <Bell className="w-5 h-5 group-hover:animate-swing" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-zinc-900"></span>
          </button>

          {showNotifications && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowNotifications(false)}
              ></div>
              <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-4 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center">
                  <h3 className="font-bold text-sm text-gray-900 dark:text-zinc-100">Notificaciones</h3>
                  <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Módulo Automatización</span>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {ALERTS.map((alert) => (
                    <div key={alert.id} className="p-4 border-b border-gray-50 dark:border-zinc-800/50 last:border-0 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer group">
                      <div className="flex gap-3">
                        <div className="mt-1 flex-shrink-0">{alert.icon}</div>
                        <div>
                          <p className="text-xs text-gray-700 dark:text-zinc-300 leading-relaxed font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {alert.text}
                          </p>
                          <span className="text-[10px] text-gray-400 mt-1 block">{alert.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 bg-gray-50 dark:bg-zinc-800/50 text-center">
                   <button className="text-[10px] font-bold text-blue-600 hover:underline">VER TODAS LAS ALERTAS</button>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 pl-4 border-l border-gray-200 dark:border-zinc-800 relative">
          <button 
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-zinc-800 p-1.5 rounded-xl transition-all group"
          >
            <div className="w-9 h-9 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center text-blue-600 border border-blue-100 dark:border-blue-800">
              <span className="text-xs font-bold">{user.initials}</span>
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-bold text-gray-900 dark:text-zinc-100">{user.name}</p>
              <p className="text-[10px] text-gray-500 flex items-center gap-1">
                {user.role}
                <ChevronDown className="w-3 h-3 group-hover:translate-y-0.5 transition-transform" />
              </p>
            </div>
          </button>

          {showRoleMenu && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowRoleMenu(false)}
              ></div>
              <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-xl z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-3 border-b border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/50">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Simulador de Roles</p>
                </div>
                <div className="p-1">
                  {roles.map((role) => (
                    <button
                      key={role}
                      onClick={() => {
                        setRole(role);
                        setShowRoleMenu(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-left",
                        user.role === role
                          ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                          : "text-gray-600 hover:bg-gray-50 dark:text-zinc-400 dark:hover:bg-zinc-800"
                      )}
                    >
                      <Shield className={cn("w-4 h-4", user.role === role ? "text-blue-600" : "text-gray-400")} />
                      {role}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
