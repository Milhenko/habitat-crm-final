"use client";

import { useState, useEffect } from "react";
import { X, Phone, Mail, User, Building2, MessageSquare, Upload, Save, ToggleLeft, ToggleRight, ChevronDown, ChevronUp, DollarSign } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

interface Lead {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    status: string;
    canal: string | null;
    assigned_to_name: string | null;
    source: string | null;
    monto_negociacion: number | null;
    created_at: string | null;
    assigned_at: string | null;
    reassigned_at: string | null;
    formulario: string | null;
}

interface LeadProfilePanelProps {
    lead: Lead | null;
    onClose: () => void;
}

const ETAPAS = [
    "Lead Entrante",
    "Contacto Efectivo",
    "Aterrizaje y Opciones",
    "Seguimiento Abierto (Infinito)",
    "Visita Agendada",
    "Visita Realizada",
    "Reserva",
    "Cierre Ganado",
    "Descartados / En Pausa"
];

const BLOQUES = [
    { titulo: "Apertura", preguntas: ["¿Es la primera casa que comprarías?", "Para ayudarte bien y no adivinar, ¿qué fue lo que te hizo escribir por esta propiedad?, ¿Qué te gustó?, ¿Qué te llamó la atención?"] },
    { titulo: "Intención y motivación real", preguntas: ["¿Esta propiedad la vas utilizar para vivir o la quieres poner a alquilar?", "Si es tu primera casa, ¿estás alquilando o viviendo con un familiar?"] },
    { titulo: "Ubicación y estilo de vida", preguntas: ["Para ubicarte mejor, ¿En qué sector estás viviendo hoy?", "¿Cuántas personas vivirán en la propiedad?", "¿Conoces la ubicación de_____? (especificar ubicación de la propiedad)", "Si esa zona no se diera, ¿qué otra zona considerarías como plan B? ¿Por qué les gusta esa otra zona?", "¿Cómo te mueves normalmente por la ciudad: trabajo, colegios, rutina diaria?"] },
    { titulo: "Prioridades y criterios de decisión", preguntas: ["¿Qué debe tener indispensablemente tu propiedad?", "Además de ti, ¿quién más participa en esta decisión?"] },
    { titulo: "Presupuesto", preguntas: ["¿Hasta cuánto te gustaría invertir para esta compra? O dime un rango."] },
    { titulo: "Forma de pago y financiamiento", preguntas: ["¿Cómo estás pensando resolver la compra: contado, crédito o una combinación?", "¿Utilizarás Bancos Privados como Pichincha, BIESS o Cooperativas?", "¿Cuál sería una cuota mensual que puedas pagar tranquilo sin sentir presión?", "Con una entrada de (CUOTA), puedes financiar con el (BANCO/BIESS/COOP), un monto hasta (TABLA REFERENCIAL-MONTO); para eso, tus ingresos deben mínimo de (TABLA REFERENCIAL-INGRESOS), ¿Sí alcanzas a eso o necesitas obtener mayores ingresos?", "¿Cuentas con entrada o necesitas plazo para reunirla?", "En el caso del crédito, ¿ya has precalificado anteriormente?", "¿Necesitas vender tu casa actual para financiar la compra?", "¿De qué depende tu compra, una póliza…?", "¿Tienes quirografarios, fondos de reserva?", "¿Estás esperando salir de deudas o ya puedes gestionar créditos?"] },
    { titulo: "Timing y urgencia", preguntas: ["¿Cuándo te ves ya viviendo/invirtiendo en tu nueva propiedad? Si hay una opción que le guste, ¿la comprarían este año?"] },
    { titulo: "Objeciones y frenos", preguntas: ["¿Algo te frena hoy para adquirir tu propiedad?", "¿Qué información sientes que te gustaría recibir?", "¿Hasta de cuántos años de construcción debe ser la propiedad?"] },
    { titulo: "Diagnóstico y puente al cierre", preguntas: ["Si te muestro algo que te agrade, ¿Te parece bien coordinar una visita el día de mañana?", "¿Para cuándo te gustaría que te llame para reconfirmar la visita?", "¿Quieres que te envíe la información sólo para que revises en privado, o deseas que te vuelva a llamar?", "¿Cuándo revisarías la información?"] },
];

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

export default function LeadProfilePanel({ lead, onClose }: LeadProfilePanelProps) {
    const { user } = useAuth();
    const isSuperAdmin = user?.role === "Super Administrador";
    const [iaActivo, setIaActivo] = useState(false);
    const [nuevaNota, setNuevaNota] = useState("");
    const [historial, setHistorial] = useState<any[]>([]);
    const [bloquesAbiertos, setBloquesAbiertos] = useState<Record<number, boolean>>({ 0: true });
    const [respuestas, setRespuestas] = useState<Record<string, string>>({});
    const [guardando, setGuardando] = useState(false);
    const [guardadoOk, setGuardadoOk] = useState(false);
    const [etapaActual, setEtapaActual] = useState(lead?.status || "Lead Entrante");
    const [actualizandoEtapa, setActualizandoEtapa] = useState(false);
    const [monto, setMonto] = useState("");
    const [guardandoMonto, setGuardandoMonto] = useState(false);
    const [actualizandoAsesor, setActualizandoAsesor] = useState(false);

    useEffect(() => {
        if (lead) {
            fetchNotas();
            fetchRespuestas();
            fetchMonto();
            setEtapaActual(lead.status);
        }
    }, [lead]);

    const fetchMonto = async () => {
        if (!lead) return;
        const { data } = await supabase
            .from("leads")
            .select("monto_negociacion")
            .eq("id", lead.id)
            .single();
        if (data?.monto_negociacion) setMonto(data.monto_negociacion.toString());
    };

    const fetchNotas = async () => {
        if (!lead) return;
        const { data } = await supabase
            .from("lead_notes")
            .select("*")
            .eq("lead_id", lead.id)
            .in("tipo", ["llamada", "nota"])
            .order("created_at", { ascending: false });
        if (data) setHistorial(data);
    };

    const fetchRespuestas = async () => {
        if (!lead) return;
        const { data } = await supabase
            .from("lead_notes")
            .select("*")
            .eq("lead_id", lead.id)
            .eq("tipo", "guion");
        if (data) {
            const mapped: Record<string, string> = {};
            data.forEach((r: any) => { mapped[r.pregunta] = r.respuesta || ""; });
            setRespuestas(mapped);
        }
    };

    const handleCambiarEtapa = async (nuevaEtapa: string) => {
        if (!lead) return;
        setActualizandoEtapa(true);

        const { error } = await supabase.from("leads").update({ status: nuevaEtapa }).eq("id", lead.id);

        if (!error) {
            setEtapaActual(nuevaEtapa);
            // Actualizar el objeto lead directamente para que se refleje al cerrar
            lead.status = nuevaEtapa;
            console.log("✅ Etapa actualizada correctamente a:", nuevaEtapa);
            
            // Pequeño delay para feedback visual
            setTimeout(() => {
                setActualizandoEtapa(false);
            }, 300);
        } else {
            console.error("❌ Error al actualizar etapa:", error);
            alert("Error al actualizar la etapa: " + error.message);
            setActualizandoEtapa(false);
        }
    };

    const handleCambiarAsesor = async (nuevoAsesor: string) => {
        if (!lead) return;
        setActualizandoAsesor(true);

        const now = new Date().toISOString();
        const updates: any = { assigned_to_name: nuevoAsesor === "Sin asignar" ? null : nuevoAsesor };

        // Lógica de fechas
        if (!lead.assigned_to_name || lead.assigned_to_name === "Sin asignar") {
            updates.assigned_at = now;
        } else if (nuevoAsesor !== lead.assigned_to_name) {
            updates.reassigned_at = now;
        }

        const { error } = await supabase.from("leads").update(updates).eq("id", lead.id);

        if (!error) {
            lead.assigned_to_name = updates.assigned_to_name;
            if (updates.assigned_at) lead.assigned_at = updates.assigned_at;
            if (updates.reassigned_at) lead.reassigned_at = updates.reassigned_at;
        }
        setActualizandoAsesor(false);
    };

    const handleGuardarMonto = async () => {
        if (!lead || !monto) return;
        setGuardandoMonto(true);
        await supabase.from("leads").update({ monto_negociacion: parseFloat(monto) }).eq("id", lead.id);
        setGuardandoMonto(false);
    };

    const handleGuardarRespuestas = async () => {
        if (!lead) return;
        setGuardando(true);
        const inserts = [];
        for (const bloque of BLOQUES) {
            for (const pregunta of bloque.preguntas) {
                const respuesta = respuestas[pregunta];
                if (respuesta && respuesta.trim()) {
                    inserts.push({
                        lead_id: lead.id,
                        tipo: "guion",
                        bloque: bloque.titulo,
                        pregunta,
                        respuesta,
                        asesor_name: user?.name || lead.assigned_to_name
                    });
                }
            }
        }
        if (inserts.length > 0) {
            await supabase.from("lead_notes").delete().eq("lead_id", lead.id).eq("tipo", "guion");
            await supabase.from("lead_notes").insert(inserts);
        }
        setGuardando(false);
        setGuardadoOk(true);
        setTimeout(() => setGuardadoOk(false), 2000);
    };

    const handleGuardarNota = async () => {
        if (!nuevaNota.trim() || !lead) return;
        const { data } = await supabase
            .from("lead_notes")
            .insert({
                lead_id: lead.id,
                tipo: "nota",
                respuesta: nuevaNota,
                asesor_name: user?.name || lead.assigned_to_name
            })
            .select().single();
        if (data) {
            setHistorial(prev => [data, ...prev]);
            setNuevaNota("");
        }
    };

    if (!lead) return null;

    const toggleBloque = (idx: number) => setBloquesAbiertos(prev => ({ ...prev, [idx]: !prev[idx] }));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-[#EBEAE6] rounded-2xl shadow-2xl w-full max-w-[1400px] max-h-[95vh] overflow-hidden flex flex-col">

                <div className="bg-[#1E2D40] px-6 py-4 flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white font-black text-lg">
                            {lead.name ? lead.name.charAt(0).toUpperCase() : "?"}
                        </div>
                        <div>
                            <h2 className="text-white font-black text-lg tracking-tight">{lead.name || "Sin nombre"}</h2>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ESTADO_COLORS[etapaActual] || "bg-gray-100 text-gray-600"}`}>
                                {etapaActual}
                            </span>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                        {/* COLUMNA 1 */}
                        <div className="bg-white rounded-xl shadow p-6 space-y-5">
                            <h3 className="text-xs font-black text-[#1E2D40] uppercase tracking-widest border-b border-gray-100 pb-3">Información del Contacto</h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Nombre completo</p>
                                    <p className="text-sm font-bold text-[#1A1A1A]">{lead.name || "—"}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Teléfono</p>
                                    {lead.phone ? (
                                        <a href={`tel:${lead.phone}`} className="flex items-center gap-2 text-sm font-bold text-[#1E2D40] hover:underline">
                                            <div className="w-8 h-8 bg-[#1E2D40] rounded-lg flex items-center justify-center flex-shrink-0"><Phone className="w-4 h-4 text-white" /></div>
                                            {lead.phone}
                                        </a>
                                    ) : (
                                        <p className="text-sm text-gray-400">—</p>
                                    )}
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Correo</p>
                                    {lead.email ? (
                                        <a href={`mailto:${lead.email}`} className="flex items-center gap-2 text-sm font-bold text-[#1E2D40] hover:underline break-all">
                                            <div className="w-8 h-8 bg-[#1E2D40] rounded-lg flex items-center justify-center flex-shrink-0"><Mail className="w-4 h-4 text-white" /></div>
                                            {lead.email}
                                        </a>
                                    ) : (
                                        <p className="text-sm text-gray-400">—</p>
                                    )}
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Asesor Asignado</p>
                                    {isSuperAdmin ? (
                                        <div className="relative">
                                            <select
                                                className="w-full px-4 py-2.5 bg-[#EBEAE6]/50 border border-[#1A1A1A]/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E2D40]/20 appearance-none"
                                                value={lead.assigned_to_name || "Sin asignar"}
                                                onChange={(e) => handleCambiarAsesor(e.target.value)}
                                                disabled={actualizandoAsesor}
                                            >
                                                <option value="Sin asignar">Sin asignar</option>
                                                <option value="Gastón Calderón">Gastón Calderón</option>
                                                <option value="Milenko Surati">Milenko Surati</option>
                                                <option value="José Morán">José Morán</option>
                                                <option value="Sebastián Jaramillo">Sebastián Jaramillo</option>
                                                <option value="Rafaela Velásquez">Rafaela Velásquez</option>
                                            </select>
                                            {actualizandoAsesor && <div className="absolute right-3 top-2.5 w-4 h-4 border-2 border-[#1E2D40] border-t-transparent rounded-full animate-spin" />}
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-sm text-[#1A1A1A]">
                                            <User className="w-4 h-4 text-gray-400" />{lead.assigned_to_name || lead.source || "Sin asignar"}
                                        </div>
                                    )}
                                </div>

                                {/* ETAPA */}
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Etapa de Negociación</p>
                                    <div className="relative">
                                        <select
                                            className="w-full px-4 py-2.5 bg-[#EBEAE6]/50 border border-[#1A1A1A]/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E2D40]/20"
                                            value={etapaActual}
                                            onChange={(e) => handleCambiarEtapa(e.target.value)}
                                            disabled={actualizandoEtapa}
                                        >
                                            {ETAPAS.map(e => <option key={e} value={e}>{e}</option>)}
                                        </select>
                                        {actualizandoEtapa && <div className="absolute right-3 top-2.5 w-4 h-4 border-2 border-[#1E2D40] border-t-transparent rounded-full animate-spin" />}
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-1">Se actualiza en el pipeline automáticamente</p>
                                </div>

                                {/* MONTO */}
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Monto de Negociación</p>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <span className="absolute left-3 top-2 text-gray-400 text-sm font-bold">$</span>
                                            <input
                                                type="number"
                                                className="w-full pl-7 pr-4 py-2.5 bg-[#EBEAE6]/50 border border-[#1A1A1A]/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E2D40]/20"
                                                placeholder="0"
                                                value={monto}
                                                onChange={(e) => setMonto(e.target.value)}
                                                onBlur={handleGuardarMonto}
                                            />
                                        </div>
                                        <button
                                            onClick={handleGuardarMonto}
                                            disabled={guardandoMonto}
                                            className="px-3 py-2 bg-[#1E2D40] text-white rounded-lg text-xs font-bold hover:bg-[#1E2D40]/90 transition-all"
                                        >
                                            {guardandoMonto ? "..." : <DollarSign className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-1">Valor estimado en USD</p>
                                </div>

                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Medio de Contacto</p>
                                    <span className="text-[10px] font-bold px-3 py-1.5 bg-[#1E2D40]/10 text-[#1E2D40] rounded-full">{lead.canal || "—"}</span>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Fuente</p>
                                    <div className="flex items-center gap-2 text-sm text-[#1A1A1A]">
                                        <Building2 className="w-4 h-4 text-gray-400" />{lead.source || "—"}
                                    </div>
                                </div>
                                <div className="pt-3 border-t border-gray-100 grid grid-cols-2 gap-3 text-xs text-gray-500">
                                    <div>
                                        <p className="font-black text-[10px] uppercase tracking-widest text-gray-400 mb-0.5">Creado</p>
                                        <p>{lead.created_at ? new Date(lead.created_at).toLocaleDateString("es-EC") : "—"}</p>
                                    </div>
                                    <div>
                                        <p className="font-black text-[10px] uppercase tracking-widest text-gray-400 mb-0.5">Asignado</p>
                                        <p>{lead.assigned_at ? new Date(lead.assigned_at).toLocaleDateString("es-EC") : "—"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* COLUMNA 2: Guión */}
                        <div className="bg-white rounded-xl shadow p-6 flex flex-col">
                            <h3 className="text-xs font-black text-[#1E2D40] uppercase tracking-widest border-b border-gray-100 pb-3 mb-4 flex-shrink-0">Guión de Aterrizaje</h3>
                            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                                {BLOQUES.map((bloque, idx) => (
                                    <div key={idx} className="border border-gray-100 rounded-xl overflow-hidden">
                                        <button onClick={() => toggleBloque(idx)} className="w-full px-4 py-3 flex items-center justify-between bg-[#EBEAE6]/50 hover:bg-[#EBEAE6] transition-colors">
                                            <span className="text-xs font-black text-[#1E2D40] uppercase tracking-wider">{bloque.titulo}</span>
                                            {bloquesAbiertos[idx] ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                                        </button>
                                        {bloquesAbiertos[idx] && (
                                            <div className="p-4 space-y-4">
                                                {bloque.preguntas.map((pregunta, pIdx) => (
                                                    <div key={pIdx}>
                                                        <label className="block text-xs font-medium text-[#1A1A1A] mb-1.5 leading-relaxed">{pregunta}</label>
                                                        <textarea
                                                            rows={2}
                                                            className="w-full px-4 py-2.5 bg-[#EBEAE6]/50 border border-[#1A1A1A]/10 rounded-xl text-xs resize-none focus:outline-none focus:ring-2 focus:ring-[#1E2D40]/20"
                                                            placeholder="Respuesta..."
                                                            value={respuestas[pregunta] || ""}
                                                            onChange={(e) => setRespuestas(prev => ({ ...prev, [pregunta]: e.target.value }))}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-100 flex-shrink-0">
                                <button
                                    onClick={handleGuardarRespuestas}
                                    disabled={guardando}
                                    className={`w-full py-2.5 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 ${guardadoOk ? "bg-green-500 text-white" : "bg-[#1E2D40] hover:bg-[#1E2D40]/90 text-white"}`}
                                >
                                    {guardando ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : guardadoOk ? "✓ Guardado" : <><Save className="w-3.5 h-3.5" /> Guardar Respuestas</>}
                                </button>
                            </div>
                        </div>

                        {/* COLUMNA 3: Actividades */}
                        <div className="bg-white rounded-xl shadow p-6 flex flex-col gap-5">
                            <h3 className="text-xs font-black text-[#1E2D40] uppercase tracking-widest border-b border-gray-100 pb-3">Actividades</h3>
                            <div className="bg-[#1E2D40] rounded-xl p-4 flex items-center justify-between">
                                <div>
                                    <p className="text-white font-bold text-sm">Agente IA</p>
                                    <p className="text-white/50 text-[10px]">Automatización de seguimiento</p>
                                </div>
                                <button onClick={() => setIaActivo(!iaActivo)} className="flex items-center gap-2 text-white">
                                    {iaActivo ? <><ToggleRight className="w-8 h-8 text-green-400" /><span className="text-xs font-bold text-green-400">ON</span></> : <><ToggleLeft className="w-8 h-8 text-white/40" /><span className="text-xs font-bold text-white/40">OFF</span></>}
                                </button>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Registrar Llamada / Nota</p>
                                <textarea
                                    rows={3}
                                    className="w-full px-4 py-2.5 bg-[#EBEAE6]/50 border border-[#1A1A1A]/10 rounded-xl text-xs resize-none focus:outline-none focus:ring-2 focus:ring-[#1E2D40]/20"
                                    placeholder="Escribe aquí el resultado de la llamada o una nota..."
                                    value={nuevaNota}
                                    onChange={(e) => setNuevaNota(e.target.value)}
                                />
                                <button
                                    onClick={handleGuardarNota}
                                    className="mt-2 w-full py-2 bg-[#1E2D40] hover:bg-[#1E2D40]/90 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
                                >
                                    <MessageSquare className="w-3.5 h-3.5" /> Guardar Nota
                                </button>
                            </div>
                            <div className="flex-1">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Historial</p>
                                <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                                    {historial.length === 0 ? (
                                        <p className="text-xs text-gray-300 text-center py-4">Sin actividad registrada</p>
                                    ) : historial.map((item, idx) => (
                                        <div key={idx} className="flex gap-3">
                                            <div className="w-8 h-8 rounded-full bg-[#EBEAE6] flex items-center justify-center flex-shrink-0">
                                                <MessageSquare className="w-3.5 h-3.5 text-[#1E2D40]" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-[#1A1A1A] leading-relaxed">{item.respuesta}</p>
                                                <p className="text-[10px] text-gray-400 mt-0.5">{new Date(item.created_at).toLocaleString("es-EC")} — {item.asesor_name}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Propuestas Enviadas</p>
                                <button className="w-full border-2 border-dashed border-gray-200 hover:border-[#1E2D40] rounded-xl p-3 text-xs text-gray-400 hover:text-[#1E2D40] transition-all flex items-center justify-center gap-2">
                                    <Upload className="w-4 h-4" /> Subir archivo / propuesta
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}