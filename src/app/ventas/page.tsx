"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { Phone, User, DollarSign, Clock, Search } from "lucide-react";
import GlobalHeader from "@/components/GlobalHeader";
import LeadProfilePanel from "@/components/LeadProfilePanel";

const COLUMNAS = [
    { id: "Lead Entrante", color: "border-yellow-400", badge: "bg-yellow-100 text-yellow-700", alerta: true },
    { id: "Contacto Efectivo", color: "border-blue-400", badge: "bg-blue-100 text-blue-700", alerta: false },
    { id: "Aterrizaje y Opciones", color: "border-purple-400", badge: "bg-purple-100 text-purple-700", alerta: false },
    { id: "Seguimiento Abierto (Infinito)", color: "border-orange-400", badge: "bg-orange-100 text-orange-700", alerta: false },
    { id: "Visita Agendada", color: "border-indigo-400", badge: "bg-indigo-100 text-indigo-700", alerta: false },
    { id: "Visita Realizada", color: "border-cyan-400", badge: "bg-cyan-100 text-cyan-700", alerta: false },
    { id: "Reserva", color: "border-teal-400", badge: "bg-teal-100 text-teal-700", alerta: false },
    { id: "Cierre Ganado", color: "border-green-400", badge: "bg-green-100 text-green-700", alerta: false },
    { id: "Descartados / En Pausa", color: "border-red-400", badge: "bg-red-100 text-red-700", alerta: false },
];

interface Lead {
    id: string;
    name: string;
    phone: string | null;
    status: string;
    canal: string | null;
    assigned_to_name: string | null;
    source: string | null;
    monto_negociacion: number | null;
    fecha_recontacto: string | null;
    created_at: string | null;
    email: string | null;
    formulario: string | null;
    assigned_at: string | null;
    reassigned_at: string | null;
}

export default function VentasPage() {
    const { user } = useAuth();
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const [leadSeleccionado, setLeadSeleccionado] = useState<Lead | null>(null);
    const [busqueda, setBusqueda] = useState("");
    const [filtroEstado, setFiltroEstado] = useState("");
    const [filtroAsesor, setFiltroAsesor] = useState("");

    const isAsesor = user?.role === "Asesor";

    useEffect(() => {
        fetchLeads();
        checkReactivaciones();
    }, [user]);

    const fetchLeads = async () => {
        setLoading(true);
        let query = supabase
            .from("leads")
            .select("*")
            .order("created_at", { ascending: false });

        if (isAsesor && user) {
            query = query.eq("assigned_to_name", user.name);
        }

        const { data, error } = await query;
        if (!error && data) setLeads(data);
        setLoading(false);
    };

    const checkReactivaciones = async () => {
        const hoy = new Date().toISOString().slice(0, 10);
        const { data, error } = await supabase
            .from("leads")
            .select("id")
            .eq("status", "Descartados / En Pausa")
            .lte("fecha_recontacto", hoy)
            .not("fecha_recontacto", "is", null);

        if (!error && data && data.length > 0) {
            const ids = data.map(l => l.id);
            await supabase.from("leads").update({ status: "Lead Entrante", reactivado: true }).in("id", ids);
            fetchLeads();
        }
    };

    const diasParaRecontacto = (fecha: string | null) => {
        if (!fecha) return null;
        const hoy = new Date();
        const recontacto = new Date(fecha);
        const diff = Math.ceil((recontacto.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
        return diff;
    };

    const leadsFiltrados = leads.filter(lead => {
        const matchBusqueda = !busqueda ||
            lead.name?.toLowerCase().includes(busqueda.toLowerCase()) ||
            lead.phone?.includes(busqueda) ||
            lead.email?.toLowerCase().includes(busqueda.toLowerCase());

        const matchEstado = !filtroEstado || lead.status === filtroEstado;
        
        let matchAsesor = true;
        if (filtroAsesor) {
            if (filtroAsesor === "Sin asignar") {
                matchAsesor = !lead.assigned_to_name;
            } else {
                matchAsesor = lead.assigned_to_name === filtroAsesor;
            }
        }

        return matchBusqueda && matchEstado && matchAsesor;
    });

    const getLeadsByColumna = (columna: string) =>
        leadsFiltrados.filter(l => l.status === columna);

    const handleDragStart = (e: React.DragEvent, leadId: string) => {
        if (isAsesor) return;
        setDraggingId(leadId);
        e.dataTransfer.setData("leadId", leadId);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = async (e: React.DragEvent, nuevaEtapa: string) => {
        if (isAsesor) return;
        e.preventDefault();
        const leadId = e.dataTransfer.getData("leadId");
        if (!leadId) return;

        const lead = leads.find(l => l.id === leadId);
        if (!lead || lead.status === nuevaEtapa) {
            setDraggingId(null);
            return;
        }

        const { error } = await supabase
            .from("leads")
            .update({ status: nuevaEtapa })
            .eq("id", leadId);

        if (!error) {
            setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: nuevaEtapa } : l));
        }

        setDraggingId(null);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#EBEAE6]">
                <GlobalHeader />
                <div className="flex items-center justify-center h-96">
                    <p className="text-[#1A1A1A]/50">Cargando pipeline...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#EBEAE6]">
            <GlobalHeader />

            <main className="p-6 md:p-10">
                <div className="max-w-[1600px] mx-auto space-y-6">
                    <div>
                        <h1 className="text-2xl font-black text-[#1E2D40] tracking-tighter">
                            Pipeline de <span className="underline decoration-2 underline-offset-4">Ventas</span>
                        </h1>
                        <p className="text-xs text-[#1A1A1A]/50 mt-1">{leadsFiltrados.length} leads en el pipeline</p>
                    </div>

                    {/* Barra de búsqueda y filtros */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 p-4 shadow-sm flex flex-col md:flex-row gap-3">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar por nombre, teléfono o email..."
                                className="form-input pl-9"
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                            />
                        </div>
                        <select 
                            className="form-input md:w-48" 
                            value={filtroEstado} 
                            onChange={(e) => setFiltroEstado(e.target.value)}
                        >
                            <option value="">Todas las etapas</option>
                            {COLUMNAS.map((col) => (
                                <option key={col.id} value={col.id}>{col.id}</option>
                            ))}
                        </select>
                        {user?.role === "Super Administrador" && (
                            <select 
                                className="form-input md:w-48" 
                                value={filtroAsesor} 
                                onChange={(e) => setFiltroAsesor(e.target.value)}
                            >
                                <option value="">Todos los asesores</option>
                                <option value="José Morán">José Morán</option>
                                <option value="Sebastián Jaramillo">Sebastián Jaramillo</option>
                                <option value="Gastón Calderón">Gastón Calderón</option>
                                <option value="Rafaela Velásquez">Rafaela Velásquez</option>
                                <option value="Milenko Surati">Milenko Surati</option>
                                <option value="Sin asignar">Sin asignar</option>
                            </select>
                        )}
                    </div>
                </div>
            </main>

            {/* Kanban Board */}
            <div className="overflow-x-auto pb-8 px-6">
                <div className="flex gap-4" style={{ minWidth: `${COLUMNAS.length * 300}px` }}>
                    {COLUMNAS.map((col) => {
                        const colLeads = getLeadsByColumna(col.id);
                        return (
                            <div
                                key={col.id}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, col.id)}
                                className={`flex-shrink-0 w-72 bg-white rounded-2xl border-t-4 ${col.color} shadow-sm flex flex-col`}
                                style={{ minHeight: "500px" }}
                            >
                                <div className="p-4 border-b border-gray-100">
                                    <div className="flex items-center justify-between">
                                        <span className={`text-[10px] font-black px-2 py-1 rounded-full ${col.badge}`}>
                                            {col.id}
                                        </span>
                                        <span className="text-xs font-black text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                            {colLeads.length}
                                        </span>
                                    </div>
                                    {col.alerta && (
                                        <div className="mt-2 flex items-center gap-1.5 bg-red-50 border border-red-100 rounded-lg px-2 py-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                                            <span className="text-[10px] font-black text-red-600">Responder &lt; 5 min</span>
                                        </div>
                                    )}
                                    {col.id === "Descartados / En Pausa" && (
                                        <div className="mt-2 flex items-center gap-1.5 bg-amber-50 border border-amber-100 rounded-lg px-2 py-1">
                                            <Clock className="w-3 h-3 text-amber-500" />
                                            <span className="text-[10px] font-black text-amber-600">Se reactivan automáticamente</span>
                                        </div>
                                    )}
                                </div>

                                <div className="p-3 flex-1 space-y-3 overflow-y-auto">
                                    {colLeads.map((lead) => {
                                        const dias = col.id === "Descartados / En Pausa" ? diasParaRecontacto(lead.fecha_recontacto) : null;
                                        return (
                                            <div
                                                key={lead.id}
                                                draggable={!isAsesor}
                                                onDragStart={(e) => handleDragStart(e, lead.id)}
                                                className={`bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all ${!isAsesor ? "cursor-grab active:cursor-grabbing" : ""} ${draggingId === lead.id ? "opacity-50" : ""}`}
                                            >
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-7 h-7 rounded-full bg-[#1E2D40]/10 flex items-center justify-center text-[#1E2D40] font-bold text-xs flex-shrink-0">
                                                            {lead.name?.charAt(0)?.toUpperCase()}
                                                        </div>
                                                        <button
                                                            onClick={() => setLeadSeleccionado(lead)}
                                                            className="font-bold text-[#1A1A1A] hover:text-[#1E2D40] hover:underline text-sm text-left"
                                                        >
                                                            {lead.name}
                                                        </button>
                                                    </div>
                                                </div>

                                                {lead.phone && (
                                                    <a href={`tel:${lead.phone}`} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#1E2D40] mb-2">
                                                        <Phone className="w-3 h-3" />{lead.phone}
                                                    </a>
                                                )}

                                                {lead.monto_negociacion && (
                                                    <div className="flex items-center gap-1.5 text-xs font-bold text-green-600 mb-2">
                                                        <DollarSign className="w-3 h-3" />${lead.monto_negociacion.toLocaleString()}
                                                    </div>
                                                )}

                                                {col.id === "Descartados / En Pausa" && lead.fecha_recontacto && (
                                                    <div className={`flex items-center gap-1.5 text-xs font-bold mb-2 ${dias !== null && dias <= 7 ? "text-red-500" : "text-amber-500"}`}>
                                                        <Clock className="w-3 h-3" />
                                                        {dias !== null && dias <= 0 ? "¡Recontactar hoy!" : dias !== null && dias <= 7 ? `${dias} días` : `${lead.fecha_recontacto}`}
                                                    </div>
                                                )}

                                                <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-50">
                                                    <div className="flex items-center gap-1 text-[10px] text-gray-400">
                                                        <User className="w-3 h-3" />
                                                        {lead.assigned_to_name || "Sin asignar"}
                                                    </div>
                                                    {lead.canal && (
                                                        <span className="text-[9px] font-bold text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">
                                                            {lead.canal.replace("Meta Ads - ", "")}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {colLeads.length === 0 && (
                                        <div className="text-center py-8 text-gray-300 text-xs">Sin leads aquí</div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {leadSeleccionado && (
                <LeadProfilePanel
                    lead={leadSeleccionado}
                    onClose={() => setLeadSeleccionado(null)}
                />
            )}
        </div>
    );
}