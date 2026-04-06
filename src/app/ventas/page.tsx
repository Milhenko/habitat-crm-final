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

const CARDS_PER_COLUMN = 20;

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
    const { user, loading: authLoading } = useAuth();
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const [leadSeleccionado, setLeadSeleccionado] = useState<Lead | null>(null);
    const [busqueda, setBusqueda] = useState("");
    const [filtroEstado, setFiltroEstado] = useState("");
    const [filtroAsesor, setFiltroAsesor] = useState("");

    const isAsesor = user?.role === "Asesor";
    const isSuperAdmin = user?.role === "Super Administrador";

    useEffect(() => {
        if (!authLoading && user) {
            fetchLeads();
            checkReactivaciones();

            // Suscripción Realtime para mantener el Kanban sincronizado
            const channel = supabase
                .channel('kanban-realtime')
                .on('postgres_changes', 
                    { event: '*', schema: 'public', table: 'leads' }, 
                    () => {
                        console.log('🔄 Cambio detectado en Supabase, refrescando Kanban...');
                        fetchLeads(true); // Refresco silencioso
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [user, authLoading]);

    const fetchLeads = async (silent = false) => {
        try {
            if (!silent) setLoading(true);

            let query = supabase
                .from("leads")
                .select("id, name, phone, status, canal, assigned_to_name, monto_negociacion, fecha_recontacto, created_at, email")
                .order("created_at", { ascending: false });

            if (isAsesor && user) {
                query = query.eq("assigned_to_name", user.name);
            }

            const { data, error } = await query;

            if (error) {
                console.error("Error fetching leads:", error);
                if (!silent) setLoading(false);
                return;
            }

            if (data) {
                setLeads(data as Lead[]);
            }

            if (!silent) setLoading(false);
        } catch (err) {
            console.error("Exception in fetchLeads:", err);
            if (!silent) setLoading(false);
        }
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
        let matchAsesor = !filtroAsesor || lead.assigned_to_name === filtroAsesor;
        if (filtroAsesor === "Sin asignar") {
            matchAsesor = !lead.assigned_to_name || lead.assigned_to_name === "Sin asignar";
        }

        return matchBusqueda && matchEstado && matchAsesor;
    });

    const getLeadsByColumna = (columna: string) => {
        const colLeads = leadsFiltrados.filter(l => l.status === columna);
        return colLeads.slice(0, CARDS_PER_COLUMN);
    };

    const getTotalByColumna = (columna: string) => {
        return leadsFiltrados.filter(l => l.status === columna).length;
    };

    const getInitials = (name: string | null) => {
        if (!name || name.trim() === "") return "?";
        return name.charAt(0).toUpperCase();
    };

    const canDragLead = (lead: Lead) => {
        if (isSuperAdmin) return true; // Super Admins pueden mover CUALQUIER lead
        if (!isAsesor) return true; // Otros admins también pueden
        return lead.assigned_to_name === user?.name; // Asesores solo sus propios leads
    };

    const handleDragStart = (e: React.DragEvent, leadId: string) => {
        const lead = leads.find(l => l.id === leadId);
        if (!lead || !canDragLead(lead)) {
            e.preventDefault();
            return;
        }
        e.dataTransfer.effectAllowed = 'move';
        setDraggingId(leadId);
        e.dataTransfer.setData("leadId", leadId);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = async (e: React.DragEvent, nuevaEtapa: string) => {
        e.preventDefault();
        const leadId = e.dataTransfer.getData("leadId");
        if (!leadId) return;

        const lead = leads.find(l => l.id === leadId);
        if (!lead || lead.status === nuevaEtapa || !canDragLead(lead)) {
            setDraggingId(null);
            return;
        }

        if (isAsesor && nuevaEtapa === "Descartados / En Pausa") {
            alert("Solo los administradores pueden descartar o pausar leads.");
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

    if (authLoading || loading) {
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

                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-[#1A1A1A]/5 p-6">
                        <div className="flex flex-col md:flex-row gap-4">
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
                                <option value="">Todas las etapas</option>
                                {COLUMNAS.map((col) => (
                                    <option key={col.id} value={col.id}>{col.id}</option>
                                ))}
                            </select>
                            {!isAsesor && (
                                <select
                                    value={filtroAsesor}
                                    onChange={(e) => setFiltroAsesor(e.target.value)}
                                    className="px-4 py-2.5 bg-[#EBEAE6]/50 border border-[#1A1A1A]/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E2D40]/20"
                                >
                                    <option value="">Todos los asesores</option>
                                    <option value="Sin asignar">Sin asignar</option>
                                    <option value="José Morán">José Morán</option>
                                    <option value="Sebastián Jaramillo">Sebastián Jaramillo</option>
                                    <option value="Gastón Calderón">Gastón Calderón</option>
                                    <option value="Rafaela Velásquez">Rafaela Velásquez</option>
                                    <option value="Milenko Surati">Milenko Surati</option>
                                </select>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <div className="overflow-x-auto pb-8 px-6">
                <div className="flex gap-4" style={{ minWidth: `${COLUMNAS.length * 300}px` }}>
                    {COLUMNAS.map((col) => {
                        const colLeads = getLeadsByColumna(col.id);
                        const total = getTotalByColumna(col.id);
                        const hasMore = total > CARDS_PER_COLUMN;

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
                                            {total}
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
                                        const isDraggable = canDragLead(lead);

                                        return (
                                            <div
                                                key={lead.id}
                                                draggable={isDraggable}
                                                onDragStart={(e) => handleDragStart(e, lead.id)}
                                                className={`bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all ${isDraggable ? "cursor-grab active:cursor-grabbing" : "cursor-default"} ${draggingId === lead.id ? "opacity-50" : ""}`}
                                            >
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-7 h-7 rounded-full bg-[#1E2D40]/10 flex items-center justify-center text-[#1E2D40] font-bold text-xs flex-shrink-0">
                                                            {getInitials(lead.name)}
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

                                    {hasMore && (
                                        <div className="text-center py-4 text-[#1E2D40] text-xs font-bold">
                                            +{total - CARDS_PER_COLUMN} más
                                        </div>
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
                    onClose={() => {
                        setLeadSeleccionado(null);
                        fetchLeads(true); // Refresco silencioso al cerrar el panel
                    }}
                />
            )}
        </div>
    );
}
