"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Search, Plus, Phone, Mail, Calendar, User, Building2 } from "lucide-react";
import Link from "next/link";
import LeadProfilePanel from "@/components/LeadProfilePanel";
import { supabase } from "@/lib/supabase";
import GlobalHeader from "@/components/GlobalHeader";

const ESTADOS = [
    "Lead Entrante", "Contacto Efectivo", "Aterrizaje y Opciones",
    "Seguimiento Abierto (Infinito)", "Visita Agendada", "Visita Realizada",
    "Reserva", "Cierre Ganado", "Descartados / En Pausa"
];

const CANAL_COLORS: Record<string, string> = {
    "Meta Ads - Cimabela": "bg-blue-100 text-blue-700",
    "Meta Ads - Portofino": "bg-indigo-100 text-indigo-700",
    "Meta Ads - Villa Club": "bg-purple-100 text-purple-700",
    "Meta Ads - Acqua Gardens": "bg-cyan-100 text-cyan-700",
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
    "Seguimiento Abierto (Infinito)": "bg-orange-100 text-orange-700",
    "Visita Agendada": "bg-indigo-100 text-indigo-700",
    "Visita Realizada": "bg-cyan-100 text-cyan-700",
    "Reserva": "bg-teal-100 text-teal-700",
    "Cierre Ganado": "bg-green-100 text-green-700",
    "Descartados / En Pausa": "bg-red-100 text-red-700",
};

interface Lead {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    status: string;
    canal: string | null;
    formulario: string | null;
    source: string | null;
    assigned_to_name: string | null;
    created_at: string | null;
    assigned_at: string | null;
    reassigned_at: string | null;
}

export default function ClientesPage() {
    const { user, loading: authLoading } = useAuth();
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [busqueda, setBusqueda] = useState("");
    const [filtroEstado, setFiltroEstado] = useState("");
    const [filtroAsesor, setFiltroAsesor] = useState("");
    const [pagina, setPagina] = useState(1);
    const [totalLeads, setTotalLeads] = useState(0);
    const [leadSeleccionado, setLeadSeleccionado] = useState<Lead | null>(null);
    const POR_PAGINA = 50;

    const isAsesor = user?.role === "Asesor";
    const canSeeMarketing = user?.role === "Super Administrador" || user?.role === "Administrador de Marketing";
    const canAddLead = !isAsesor;

    useEffect(() => {
        fetchLeads();
    }, [pagina, filtroEstado, busqueda, filtroAsesor, authLoading]);

    const fetchLeads = async () => {
        setLoading(true);

        let query = supabase
            .from("leads")
            .select("*", { count: "exact" })
            .order("created_at", { ascending: false })
            .range((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA - 1);

        if (isAsesor && user) {
            query = query.eq("assigned_to_name", user.name);
        }

        if (filtroAsesor) {
            query = query.eq("assigned_to_name", filtroAsesor);
        }

        if (filtroEstado) query = query.eq("status", filtroEstado);
        if (busqueda) query = query.or(`name.ilike.%${busqueda}%,phone.ilike.%${busqueda}%,email.ilike.%${busqueda}%`);

        const { data, count, error } = await query;
        if (!error && data) {
            setLeads(data);
            setTotalLeads(count || 0);
        }
        setLoading(false);
    };

    const totalPaginas = Math.ceil(totalLeads / POR_PAGINA);

    if (authLoading) {
        return <div className="min-h-screen bg-[#EBEAE6] flex items-center justify-center text-[#1E2D40]">Cargando...</div>;
    }

    return (
        <div className="min-h-screen bg-[#EBEAE6]">
            <GlobalHeader />

            <main className="p-6 md:p-10">
                <div className="max-w-[1600px] mx-auto space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-black text-[#1E2D40] tracking-tighter">
                                Tablero de <span className="underline decoration-2 underline-offset-4">Contactos</span>
                            </h1>
                            <p className="text-xs text-[#1A1A1A]/50 mt-1">{totalLeads} contactos {isAsesor ? "asignados a ti" : "en total"}</p>
                        </div>
                        {canAddLead && (
                            <button className="flex items-center gap-2 px-5 py-2.5 bg-[#1E2D40] hover:bg-[#1E2D40]/90 text-white font-bold text-sm rounded-xl shadow-lg transition-all">
                                <Plus className="w-4 h-4" /> Nuevo Contacto
                            </button>
                        )}
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-[#1A1A1A]/5 p-6">
                        <div className="flex flex-col md:flex-row gap-4 mb-6">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1A1A1A]/30" />
                                <input
                                    type="text"
                                    placeholder="Buscar por nombre, teléfono o email..."
                                    value={busqueda}
                                    onChange={(e) => setBusqueda(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-[#EBEAE6]/50 border border-[#1A1A1A]/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E2D40]/20"
                                />
                            </div>
                            <select
                                value={filtroEstado}
                                onChange={(e) => setFiltroEstado(e.target.value)}
                                className="px-4 py-2.5 bg-[#EBEAE6]/50 border border-[#1A1A1A]/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E2D40]/20"
                            >
                                <option value="">Todos los estados</option>
                                {ESTADOS.map((estado) => (
                                    <option key={estado} value={estado}>{estado}</option>
                                ))}
                            </select>
                            {!isAsesor && (
                                <select
                                    value={filtroAsesor}
                                    onChange={(e) => setFiltroAsesor(e.target.value)}
                                    className="px-4 py-2.5 bg-[#EBEAE6]/50 border border-[#1A1A1A]/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E2D40]/20"
                                >
                                    <option value="">Todos los asesores</option>
                                    <option value="Ana García">Ana García</option>
                                    <option value="Milenko Surati">Milenko Surati</option>
                                </select>
                            )}
                        </div>

                        {loading ? (
                            <div className="text-center py-12 text-[#1A1A1A]/50">Cargando contactos...</div>
                        ) : leads.length === 0 ? (
                            <div className="text-center py-12 text-[#1A1A1A]/50">No se encontraron contactos</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-[#1A1A1A]/10">
                                            <th className="text-left py-3 px-4 text-xs font-black text-[#1A1A1A]/50 uppercase tracking-wider">Contacto</th>
                                            <th className="text-left py-3 px-4 text-xs font-black text-[#1A1A1A]/50 uppercase tracking-wider">Estado</th>
                                            <th className="text-left py-3 px-4 text-xs font-black text-[#1A1A1A]/50 uppercase tracking-wider">Canal</th>
                                            <th className="text-left py-3 px-4 text-xs font-black text-[#1A1A1A]/50 uppercase tracking-wider">Asesor</th>
                                            <th className="text-left py-3 px-4 text-xs font-black text-[#1A1A1A]/50 uppercase tracking-wider">Fecha</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {leads.map((lead) => (
                                            <tr
                                                key={lead.id}
                                                onClick={() => setLeadSeleccionado(lead)}
                                                className="border-b border-[#1A1A1A]/5 hover:bg-[#EBEAE6]/30 cursor-pointer transition-colors"
                                            >
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-[#1E2D40]/10 flex items-center justify-center">
                                                            <User className="w-5 h-5 text-[#1E2D40]" />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-sm text-[#1E2D40]">{lead.name}</p>
                                                            <div className="flex items-center gap-3 mt-1">
                                                                {lead.phone && (
                                                                    <span className="flex items-center gap-1 text-xs text-[#1A1A1A]/50">
                                                                        <Phone className="w-3 h-3" /> {lead.phone}
                                                                    </span>
                                                                )}
                                                                {lead.email && (
                                                                    <span className="flex items-center gap-1 text-xs text-[#1A1A1A]/50">
                                                                        <Mail className="w-3 h-3" /> {lead.email}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${ESTADO_COLORS[lead.status] || "bg-gray-100 text-gray-700"}`}>
                                                        {lead.status}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${CANAL_COLORS[lead.canal || ""] || "bg-gray-100 text-gray-700"}`}>
                                                        {lead.canal || "Sin canal"}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <span className="text-sm font-medium text-[#1E2D40]">{lead.assigned_to_name || "Sin asignar"}</span>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center gap-1 text-xs text-[#1A1A1A]/50">
                                                        <Calendar className="w-3 h-3" />
                                                        {lead.created_at ? new Date(lead.created_at).toLocaleDateString() : "—"}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {totalPaginas > 1 && (
                            <div className="flex items-center justify-between mt-6 pt-6 border-t border-[#1A1A1A]/10">
                                <p className="text-xs text-[#1A1A1A]/50">
                                    Página {pagina} de {totalPaginas}
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setPagina((p) => Math.max(1, p - 1))}
                                        disabled={pagina === 1}
                                        className="px-4 py-2 bg-[#1E2D40]/10 hover:bg-[#1E2D40]/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-bold text-[#1E2D40] transition-all"
                                    >
                                        Anterior
                                    </button>
                                    <button
                                        onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                                        disabled={pagina === totalPaginas}
                                        className="px-4 py-2 bg-[#1E2D40]/10 hover:bg-[#1E2D40]/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-bold text-[#1E2D40] transition-all"
                                    >
                                        Siguiente
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {leadSeleccionado && (
                <LeadProfilePanel lead={leadSeleccionado} onClose={() => setLeadSeleccionado(null)} />
            )}
        </div>
    );
}