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
    const [porPagina, setPorPagina] = useState(50);

    const isAsesor = user?.role === "Asesor";
    const canSeeMarketing = user?.role === "Super Administrador" || user?.role === "Administrador de Marketing";
    const canAddLead = !isAsesor;

    useEffect(() => {
        fetchLeads();
    }, [pagina, filtroEstado, busqueda, filtroAsesor, porPagina, authLoading]);

    const fetchLeads = async () => {
        setLoading(true);

        let query = supabase
            .from("leads")
            .select("*", { count: "exact" })
            .order("created_at", { ascending: false })
            .range((pagina - 1) * porPagina, pagina * porPagina - 1);

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

    const totalPaginas = Math.ceil(totalLeads / porPagina);

    const ASESORES = [
        "Gastón Calderón",
        "Milenko Surati",
        "José Morán",
        "Sebastián Jaramillo",
        "Rafaela Velásquez",
    ];

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

                    <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm flex flex-col md:flex-row gap-3">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar por nombre, correo o teléfono..."
                                className="form-input pl-9"
                                value={busqueda}
                                onChange={(e) => { setBusqueda(e.target.value); setPagina(1); }}
                            />
                        </div>
                        <select className="form-input md:w-48" value={filtroEstado} onChange={(e) => { setFiltroEstado(e.target.value); setPagina(1); }}>
                            <option value="">Todas las etapas</option>
                            {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
                        </select>
                        {!isAsesor && (
                            <select className="form-input md:w-48" value={filtroAsesor} onChange={(e) => { setFiltroAsesor(e.target.value); setPagina(1); }}>
                                <option value="">Todos los asesores</option>
                                {ASESORES.map(a => <option key={a} value={a}>{a}</option>)}
                            </select>
                        )}
                        <select 
                            className="bg-[#EBEAE6]/50 border border-gray-200 rounded-xl px-4 py-2 text-sm font-bold text-[#1E2D40] focus:outline-none transition-all cursor-pointer hover:bg-[#EBEAE6]/80 md:w-48"
                            value={porPagina} 
                            onChange={(e) => { setPorPagina(Number(e.target.value)); setPagina(1); }}
                        >
                            <option value={20}>Mostrar: 20</option>
                            <option value={50}>Mostrar: 50</option>
                            <option value={100}>Mostrar: 100</option>
                        </select>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        {loading ? (
                            <div className="py-16 text-center">
                                <div className="w-8 h-8 border-2 border-[#1E2D40] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                                <p className="text-gray-400 text-sm">Cargando contactos...</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-[#1E2D40]">
                                        <tr>
                                            {["Contacto", "Teléfono", "Correo", "Etapa", "Canal / Proyecto", "Asesor", "Fecha Creación", "Acciones"].map(col => (
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
                                                            {lead.name?.charAt(0)?.toUpperCase()}
                                                        </div>
                                                        <button onClick={() => setLeadSeleccionado(lead)} className="font-bold text-[#1E2D40] hover:underline text-sm whitespace-nowrap">
                                                            {lead.name}
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    {lead.phone ? (
                                                        <a href={`tel:${lead.phone}`} className="flex items-center gap-1.5 text-sm text-[#1A1A1A]/70 hover:text-[#1E2D40] whitespace-nowrap">
                                                            <Phone className="w-3.5 h-3.5" />{lead.phone}
                                                        </a>
                                                    ) : <span className="text-gray-300 text-xs">—</span>}
                                                </td>
                                                <td className="px-4 py-4">
                                                    {lead.email ? (
                                                        <a href={`mailto:${lead.email}`} className="flex items-center gap-1.5 text-sm text-[#1A1A1A]/70 hover:text-[#1E2D40] whitespace-nowrap">
                                                            <Mail className="w-3.5 h-3.5" />{lead.email}
                                                        </a>
                                                    ) : <span className="text-gray-300 text-xs">—</span>}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap ${ESTADO_COLORS[lead.status || ""] || "bg-gray-100 text-gray-600"}`}>
                                                        {lead.status || "—"}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="space-y-1">
                                                        {lead.canal && (
                                                            <span className={`text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap block w-fit ${CANAL_COLORS[lead.canal] || "bg-gray-100 text-gray-600"}`}>
                                                                {lead.canal}
                                                            </span>
                                                        )}
                                                        {lead.formulario && (
                                                            <p className="text-[10px] text-gray-400 whitespace-nowrap">{lead.formulario}</p>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center gap-1.5 text-sm text-[#1A1A1A]/70 whitespace-nowrap">
                                                        <User className="w-3.5 h-3.5" />{lead.assigned_to_name || lead.source || "—"}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center gap-1.5 text-xs text-[#1A1A1A]/50 whitespace-nowrap">
                                                        <Calendar className="w-3.5 h-3.5" />
                                                        {lead.created_at ? lead.created_at.slice(0, 10) : "—"}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <button onClick={() => setLeadSeleccionado(lead)} className="px-3 py-1.5 bg-[#1E2D40] hover:bg-[#1E2D40]/90 text-white text-[10px] font-bold rounded-lg transition-all whitespace-nowrap">
                                                        Ver Perfil
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {!loading && totalPaginas > 1 && (
                            <div className="p-4 border-t border-gray-100 flex items-center justify-between">
                                <p className="text-xs text-gray-500 font-medium">
                                    Mostrando {(pagina - 1) * porPagina + 1}–{Math.min(pagina * porPagina, totalLeads)} de {totalLeads}
                                </p>
                                <div className="flex gap-2">
                                    <button onClick={() => setPagina(p => Math.max(1, p - 1))} disabled={pagina === 1} className="px-3 py-1.5 text-xs font-bold bg-[#1E2D40] text-white rounded-lg disabled:opacity-30 transition-all">
                                        ← Anterior
                                    </button>
                                    <span className="px-3 py-1.5 text-xs font-bold text-[#1E2D40]">{pagina} / {totalPaginas}</span>
                                    <button onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))} disabled={pagina === totalPaginas} className="px-3 py-1.5 text-xs font-bold bg-[#1E2D40] text-white rounded-lg disabled:opacity-30 transition-all">
                                        Siguiente →
                                    </button>
                                </div>
                            </div>
                        )}

                        {!loading && leads.length === 0 && (
                            <div className="py-16 text-center">
                                <p className="text-[#1A1A1A]/40 font-medium">No se encontraron contactos</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {leadSeleccionado && (
                <LeadProfilePanel
                    lead={{
                        id: leadSeleccionado.id,
                        nombre: leadSeleccionado.name,
                        correo: leadSeleccionado.email || "",
                        telefono: leadSeleccionado.phone || "",
                        estado: leadSeleccionado.status || "Lead Entrante",
                        tipo_propiedad: leadSeleccionado.formulario || "",
                        asesor: leadSeleccionado.assigned_to_name || leadSeleccionado.source || "",
                        canal: leadSeleccionado.canal || "",
                        fecha_creacion: leadSeleccionado.created_at?.slice(0, 10) || "",
                        fecha_asignacion: leadSeleccionado.assigned_at?.slice(0, 10) || "",
                        fecha_reasignacion: leadSeleccionado.reassigned_at?.slice(0, 10) || null,
                    }}
                    onClose={() => setLeadSeleccionado(null)}
                />
            )}
        </div>
    );
}