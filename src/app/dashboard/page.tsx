"use client";

import { useAuth } from "@/context/AuthContext";
import { Building2, Users, DollarSign, TrendingUp, LayoutDashboard, Shield } from "lucide-react";

export default function DashboardPage() {
    const { user, setRole, users, loading } = useAuth();

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-10 h-10 bg-blue-600 rounded-xl animate-pulse flex items-center justify-center">
                <Building2 className="text-white w-5 h-5" />
            </div>
        </div>
    );

    if (!user) return null;

    return (
        <main className="min-h-screen p-6 md:p-10">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                            <Building2 className="text-white w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 tracking-tighter">CRM <span className="text-blue-600">Habitat</span></h1>
                            <p className="text-xs text-gray-500">Sistema de gestión inmobiliaria</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-gray-200 shadow-sm">
                        <Shield className="w-4 h-4 text-gray-400" />
                        <span className="text-xs text-gray-500 font-medium">Rol activo:</span>
                        <select
                            className="text-xs font-bold text-blue-600 bg-transparent border-none outline-none cursor-pointer"
                            value={user.role}
                            onChange={(e) => setRole(e.target.value as any)}
                        >
                            {users.map((u) => (
                                <option key={u.id} value={u.role}>{u.role} — {u.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl shadow-blue-500/20">
                    <h2 className="text-3xl font-black tracking-tighter uppercase italic">
                        Bienvenido, {user.name}
                    </h2>
                    <p className="text-blue-100 mt-1 text-sm">{user.role} — CRM Habitat v2.1</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: "Leads Activos", value: "0", icon: <Users className="w-5 h-5 text-blue-500" /> },
                        { label: "Propiedades", value: "0", icon: <Building2 className="w-5 h-5 text-green-500" /> },
                        { label: "Cierres este mes", value: "0", icon: <DollarSign className="w-5 h-5 text-purple-500" /> },
                        { label: "Tasa conversión", value: "0%", icon: <TrendingUp className="w-5 h-5 text-orange-500" /> },
                    ].map((kpi, i) => (
                        <div key={i} className="card p-5 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center">
                                {kpi.icon}
                            </div>
                            <div>
                                <p className="text-2xl font-black text-gray-900">{kpi.value}</p>
                                <p className="text-xs text-gray-500 font-medium">{kpi.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <a href="/ventas" className="card p-6 hover:shadow-lg transition-all hover:border-blue-200 group">
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-3 group-hover:bg-blue-600 transition-colors">
                            <LayoutDashboard className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors" />
                        </div>
                        <h3 className="font-bold text-gray-900">Pipeline de Ventas</h3>
                        <p className="text-xs text-gray-500 mt-1">Gestiona leads y embudos</p>
                    </a>
                    <a href="/captacion" className="card p-6 hover:shadow-lg transition-all hover:border-green-200 group">
                        <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center mb-3 group-hover:bg-green-600 transition-colors">
                            <Building2 className="w-5 h-5 text-green-600 group-hover:text-white transition-colors" />
                        </div>
                        <h3 className="font-bold text-gray-900">Captación</h3>
                        <p className="text-xs text-gray-500 mt-1">Registra nuevas propiedades</p>
                    </a>
                    <a href="/contactos" className="card p-6 hover:shadow-lg transition-all hover:border-purple-200 group">
                        <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center mb-3 group-hover:bg-purple-600 transition-colors">
                            <Users className="w-5 h-5 text-purple-600 group-hover:text-white transition-colors" />
                        </div>
                        <h3 className="font-bold text-gray-900">Clientes</h3>
                        <p className="text-xs text-gray-500 mt-1">Base de contactos</p>
                    </a>
                </div>
            </div>
        </main>
    );
}