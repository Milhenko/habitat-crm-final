"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Search, Plus, Phone, Mail, Calendar, User, Building2 } from "lucide-react";
import Link from "next/link";

const ESTADOS = [
    "Lead Entrante", "Contacto Efectivo", "Aterrizaje y Opciones",
    "Seguimiento Abierto", "Visita Agendada", "Visita Realizada",
    "Reserva", "Cierre Ganado", "Descartado"
];

const MOCK_LEADS = [
    { id: "1", nombre: "Juan Pérez", correo: "juan@gmail.com", telefono: "0991234567", estado: "Lead Entrante", tipo_propiedad: "Departamento", asesor: "J. Pérez", canal: "Meta Ads", fecha_creacion: "2026-03-20", fecha_asignacion: "2026-03-20", fecha_reasignacion: null },
    { id: "2", nombre: "María García", correo: "maria@gmail.com", telefono: "0987654321", estado: "Contacto Efectivo", tipo_propiedad: "Casa", asesor: "A. Torres", canal: "Google Ads", fecha_creacion: "2026-03-19", fecha_asignacion: "2026-03-19", fecha_reasignacion: "2026-03-21" },
    { id: "3", nombre: "Carlos López", correo: "carlos@gmail.com", telefono: "0990000000", estado: "Visita Agendada", tipo_propiedad: "Casa", asesor: "J. Pérez", canal: "Web", fecha_creacion: "2026-03-18", fecha_asignacion: "2026-03-18", fecha_reasignacion: null },
];

const CANAL_COLORS: Record<string, string> = {
    "Meta Ads": "bg-blue-100 text-blue-700",
    "Google Ads": "bg-red-100 text-red-700",
    "TikTok Ads": "bg-pink-100 text-pink-700",
    "Web": "bg-green-100 text-green-700",
    "WhatsApp": "bg-emerald-100 text-emerald-700",
};

const ESTADO_COLORS: Record<string, string> = {
    "Lead Entrante": "bg-yellow-100 text-yellow-700",
    "Contacto Efectivo": "bg-blue-100 text-blue-700",
    "Aterrizaje y Opciones": "bg-purple-100 text-purple-700",
    "Seguimiento Abierto": "bg-orange-100 text-orange-700",
    "Visita Agendada": "bg-indigo-100 text-indigo-700",
    "Visita Realizada": "bg-cyan-100 text-cyan-700",
    "Reserva": "bg-teal-100 text-teal-700",
    "Cierre Ganado": "bg-green-100 text-green-700",
    "Descartado": "bg-red-100 text-red-700",
};

export default function ClientesPage() {
    const { user } = useAuth();
    const [busqueda, setBusqueda] = useState("");
    const [filtroEstado, setFiltroEstado] = useState("");

    const leads = MOCK_LEADS.filter(lead => {
        const matchBusqueda = lead.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
            lead.correo.toLowerCase().includes(busqueda.toLowerCase()) ||
            lead.telefono.includes(busqueda);
        const matchEstado = filtroEstado ? lead.estado === filtroEstado : true;
        return matchBusqueda && matchEstado;
    });

    const canAddLead = user?.role !== "Asesor";
    const canSeeMarketing = user?.role === "Super Administrador" || user?.role === "Administrador de Marketing";

    return (
        <div className="min-h-screen bg-[#EBEAE6]">

            {/* Navbar */}
            <nav className="bg-[#1E2D40] shadow-lg sticky top-0 z-50">
                <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                            <Building2 className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-white font-black text-lg tracking-tight">CRM <span className="text-[#EBEAE6]/70">Habitat</span></span>
                    </div>

                    <div className="flex items-center gap-1">
                        {[
                            { label: "Captaciones", href: "/captacion" },
                            { label: "Inventario", href: "/inventario" },
                            { label: "Pipeline de Ventas", href: "/ventas" },
                        ].map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                            >
                                {item.label}
                            </Link>
                        ))}

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

                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white text-xs font-bold">
                            {user?.initials}
                        </div>
                        <div className="hidden md:block">
                            <p className="text-white text-xs font-bold">{user?.name}</p>
                            <p className="text-white/50 text-[10px]">{user?.role}</p>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Content */}
            <main className="p-6 md:p-10">
                <div className="max-w-[1600px] mx-auto space-y-6">

                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-black text-[#1E2D40] tracking-tighter">
                                Tablero de <span className="text-[#1E2D40] underline decoration-2 underline-offset-4">Contactos</span>
                            </h1>
                            <p className="text-xs text-[#1A1A1A]/50 mt-1">{leads.length} contactos encontrados</p>
                        </div>
                        {canAddLead && (
                            <button className="flex items-center gap-2 px-5 py-2.5 bg-[#1E2D40] hover:bg-[#1E2D40]/90 text-white font-bold text-sm rounded-xl shadow-lg transition-all">
                                <Plus className="w-4 h-4" /> Nuevo Contacto
                            </button>
                        )}
                    </div>

                    {/* Filtros */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm flex flex-col md:flex-row gap-3">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar por nombre, correo o teléfono..."
                                className="form-input pl-9"
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                            />
                        </div>
                        <select className="form-input md:w-48" value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
                            <option value="">Todas las etapas</option>
                            {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
                        </select>
                    </div>

                    {/* Tabla */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-[#1E2D40] border-b border-gray-200">
                                    <tr>
                                        {["Contacto", "Teléfono", "Correo", "Etapa", "Canal", "Tipo Propiedad", "Asesor", "Fecha Creación", "Fecha Asignación", "Reasignación", "Acciones"].map(col => (
                                            <th key={col} className="px-4 py-3 text-[10px] font-black text-white/70 uppercase tracking-widest whitespace-nowrap">{col}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {leads.map((lead) => (
                                        <tr key={lead.id} className="hover:bg-[#EBEAE6]/30 transition-colors">
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-[#1E2D40]/10 flex items-center justify-center text-[#1E2D40] font-bold text-xs flex-shrink-0">
                                                        {lead.nombre.charAt(0)}
                                                    </div>
                                                    <a href={`/leads/${lead.id}`} className="font-bold text-[#1A1A1A] hover:text-[#1E2D40] transition-colors text-sm whitespace-nowrap">
                                                        {lead.nombre}
                                                    </a>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <a href={`tel:${lead.telefono}`} className="flex items-center gap-1.5 text-sm text-[#1A1A1A]/70 hover:text-[#1E2D40] transition-colors whitespace-nowrap">
                                                    <Phone className="w-3.5 h-3.5" />{lead.telefono}
                                                </a>
                                            </td>
                                            <td className="px-4 py-4">
                                                <a href={`mailto:${lead.correo}`} className="flex items-center gap-1.5 text-sm text-[#1A1A1A]/70 hover:text-[#1E2D40] transition-colors whitespace-nowrap">
                                                    <Mail className="w-3.5 h-3.5" />{lead.correo}
                                                </a>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className={`text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap ${ESTADO_COLORS[lead.estado] || "bg-gray-100 text-gray-600"}`}>
                                                    {lead.estado}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className={`text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap ${CANAL_COLORS[lead.canal] || "bg-gray-100 text-gray-600"}`}>
                                                    {lead.canal}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-1.5 text-sm text-[#1A1A1A]/70 whitespace-nowrap">
                                                    <Building2 className="w-3.5 h-3.5" />{lead.tipo_propiedad}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-1.5 text-sm text-[#1A1A1A]/70 whitespace-nowrap">
                                                    <User className="w-3.5 h-3.5" />{lead.asesor}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-1.5 text-xs text-[#1A1A1A]/50 whitespace-nowrap">
                                                    <Calendar className="w-3.5 h-3.5" />{lead.fecha_creacion}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-1.5 text-xs text-[#1A1A1A]/50 whitespace-nowrap">
                                                    <Calendar className="w-3.5 h-3.5" />{lead.fecha_asignacion}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="text-xs text-[#1A1A1A]/50 whitespace-nowrap">{lead.fecha_reasignacion || "—"}</div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <a href={`/leads/${lead.id}`} className="px-3 py-1.5 bg-[#1E2D40] hover:bg-[#1E2D40]/90 text-white text-[10px] font-bold rounded-lg transition-all whitespace-nowrap">
                                                    Ver Perfil
                                                </a>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {leads.length === 0 && (
                            <div className="py-16 text-center">
                                <p className="text-[#1A1A1A]/40 font-medium">No se encontraron contactos</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}