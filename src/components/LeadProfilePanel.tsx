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
    custom_fields?: Record<string, any>;
}

interface LeadProfilePanelProps {
    lead: Lead | null;
    onClose: () => void;
    mode?: "view" | "create";
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

const ETAPAS_NEGOCIACION = [
    "Negociación",
    "Negociación Avanzada",
    "Negociación Final"
];

const BLOQUES = [
    { 
        titulo: "APERTURA", 
        preguntas: [
            "¿Es la primera casa que comprarías?",
            "Para ayudarte bien y no adivinar, ¿qué fue lo que te hizo escribir por esta propiedad?, ¿Qué te gustó?, ¿Qué te llamó la atención?"
        ] 
    },
    { 
        titulo: "INTENCIÓN Y MOTIVACIÓN REAL", 
        preguntas: [
            "¿Esta propiedad la vas utilizar para vivir o la quieres poner a alquilar?",
            "Si es tu primera casa, ¿estás alquilando o viviendo con un familiar?"
        ] 
    },
    { 
        titulo: "UBICACIÓN Y ESTILO DE VIDA", 
        preguntas: [
            "Ubicación: ¿En dónde vives actualmente? ¿Y en dónde trabajas?",
            "¿Cuánto tiempo haces de tu casa al trabajo?",
            "¿Tienes niños en la casa?",
            "¿Tienes vehículo propio? ¿Carro o moto?"
        ] 
    },
    { 
        titulo: "PRIORIDADES Y CRITERIOS DE DECISIÓN", 
        preguntas: [
            "¿Qué priorizas más en tu nueva casa: espacio interior, ubicación o áreas sociales/recreación?",
            "¿De esas 3 cosas, cuál es la segunda prioridad?"
        ] 
    },
    { 
        titulo: "PRESUPUESTO", 
        preguntas: [
            "¿Cuál es el presupuesto máximo que puedes manejar?"
        ] 
    },
    { 
        titulo: "FORMA DE PAGO Y FINANCIAMIENTO", 
        preguntas: [
            "¿Cómo piensas cubrir el monto total? ¿Vas a necesitar crédito hipotecario o lo vas a hacer con recursos propios?"
        ] 
    },
    { 
        titulo: "TIMING Y URGENCIA", 
        preguntas: [
            "¿Para cuándo necesitas tomar la decisión de compra?"
        ] 
    },
    { 
        titulo: "OBJECIONES Y FRENOS", 
        preguntas: [
            "¿Qué te puede frenar de tomar la decisión de compra?"
        ] 
    },
    { 
        titulo: "TOMADOR DE DECISIÓN E INVOLUCRADOS", 
        preguntas: [
            "¿Vas a vivir con alguien más? ¿Tienes pareja?",
            "¿Tu pareja también está en la búsqueda de casa?"
        ] 
    }
];

// Función helper para formatear las claves del formulario
const formatFieldName = (key: string): string => {
    // Excluir campos de metadata que no queremos mostrar
    const excludedFields = ['lead_id', 'form_id', 'ad_id', 'created_time'];
    if (excludedFields.includes(key)) return '';
    
    // Convertir snake_case o camelCase a Title Case
    return key
        .replace(/_/g, ' ')
        .replace(/([A-Z])/g, ' $1')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
        .trim();
};

export default function LeadProfilePanel({ lead, onClose, mode = "view" }: LeadProfilePanelProps) {
    const { user } = useAuth();
    const [respuestas, setRespuestas] = useState<Record<string, string>>({});
    const [isAgentEnabled, setIsAgentEnabled] = useState(false);
    const [expandedBloques, setExpandedBloques] = useState<number[]>([]);
    const [expandedFormResponses, setExpandedFormResponses] = useState(true);
    const [etapaActual, setEtapaActual] = useState(lead?.status || "Lead Entrante");
    const [etapaNegociacion, setEtapaNegociacion] = useState<string | null>(null);
    const [montoNegociacion, setMontoNegociacion] = useState<string>(
        lead?.monto_negociacion?.toString() || ""
    );

    useEffect(() => {
        if (lead && mode !== "create") {
            cargarRespuestas();
            setEtapaActual(lead.status);
            setMontoNegociacion(lead.monto_negociacion?.toString() || "");
        }
    }, [lead, mode]);

    const cargarRespuestas = async () => {
        if (!lead) return;

        const { data, error } = await supabase
            .from("lead_notes")
            .select("bloque_index, pregunta_index, respuesta")
            .eq("lead_id", lead.id);

        if (error) {
            console.error("Error cargando respuestas:", error);
            return;
        }

        const respuestasMap: Record<string, string> = {};
        data?.forEach((item) => {
            const key = `${item.bloque_index}-${item.pregunta_index}`;
            respuestasMap[key] = item.respuesta;
        });

        setRespuestas(respuestasMap);
    };

    const guardarRespuesta = async (bloqueIndex: number, preguntaIndex: number, respuesta: string) => {
        if (!lead) return;

        const key = `${bloqueIndex}-${preguntaIndex}`;
        setRespuestas((prev) => ({ ...prev, [key]: respuesta }));

        const { error } = await supabase.from("lead_notes").upsert(
            {
                lead_id: lead.id,
                bloque_index: bloqueIndex,
                pregunta_index: preguntaIndex,
                respuesta: respuesta,
                updated_at: new Date().toISOString(),
            },
            {
                onConflict: "lead_id,bloque_index,pregunta_index",
            }
        );

        if (error) {
            console.error("Error guardando respuesta:", error);
        }
    };

    const toggleBloque = (index: number) => {
        setExpandedBloques((prev) =>
            prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
        );
    };

    const handleEtapaChange = async (newEtapa: string) => {
        if (!lead) return;

        setEtapaActual(newEtapa);

        const { error } = await supabase
            .from("leads")
            .update({ status: newEtapa })
            .eq("id", lead.id);

        if (error) {
            console.error("Error actualizando etapa:", error);
            setEtapaActual(lead.status);
        }
    };

    const handleMontoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setMontoNegociacion(value);

        if (!lead || !value) return;

        const monto = parseFloat(value);
        if (isNaN(monto)) return;

        const { error } = await supabase
            .from("leads")
            .update({ monto_negociacion: monto })
            .eq("id", lead.id);

        if (error) {
            console.error("Error actualizando monto:", error);
        }
    };

    if (!lead && mode !== "create") return null;

    const esNegociacion = etapaActual === "Reserva";
    const customFields = lead?.custom_fields || {};
    const hasFormResponses = Object.keys(customFields).some(key => formatFieldName(key) !== '');

    return (
        <div className="fixed inset-y-0 right-0 w-full md:w-[900px] bg-white shadow-2xl z-50 overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#1E2D40] to-[#2a3f5f] text-white p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold">
                        {lead?.name?.[0]?.toUpperCase() || "N"}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">{lead?.name || "Nuevo Contacto"}</h2>
                        {lead?.status && (
                            <span className="inline-block mt-1 px-3 py-1 bg-white/20 rounded-full text-sm">
                                {lead.status}
                            </span>
                        )}
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
                    {/* Columna 1: Información del Contacto */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h3 className="text-sm font-bold text-gray-500 mb-4 uppercase tracking-wide">
                                Información del Contacto
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Nombre Completo</p>
                                    <p className="text-base font-medium text-gray-900">{lead?.name || "—"}</p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Teléfono</p>
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-gray-400" />
                                        <p className="text-base text-gray-900">{lead?.phone || "—"}</p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Correo</p>
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-gray-400" />
                                        <p className="text-base text-gray-900 break-all">{lead?.email || "—"}</p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Asesor Asignado</p>
                                    <div className="flex items-center gap-2">
                                        <User className="w-4 h-4 text-gray-400" />
                                        <p className="text-base text-gray-900">{lead?.assigned_to_name || "—"}</p>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs text-gray-500 mb-2 uppercase tracking-wide block">
                                        Etapa de Negociación
                                    </label>
                                    <select
                                        value={etapaActual}
                                        onChange={(e) => handleEtapaChange(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E2D40] focus:border-transparent text-sm"
                                    >
                                        {ETAPAS.map((etapa) => (
                                            <option key={etapa} value={etapa}>
                                                {etapa}
                                            </option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-gray-400 mt-1">Se actualiza en el pipeline automáticamente</p>
                                </div>

                                {esNegociacion && (
                                    <>
                                        <div>
                                            <label className="text-xs text-gray-500 mb-2 uppercase tracking-wide block">
                                                Etapa de Negociación Específica
                                            </label>
                                            <select
                                                value={etapaNegociacion || ""}
                                                onChange={(e) => setEtapaNegociacion(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E2D40] focus:border-transparent text-sm"
                                            >
                                                <option value="">Seleccionar...</option>
                                                {ETAPAS_NEGOCIACION.map((etapa) => (
                                                    <option key={etapa} value={etapa}>
                                                        {etapa}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="text-xs text-gray-500 mb-2 uppercase tracking-wide flex items-center gap-2">
                                                <DollarSign className="w-4 h-4" />
                                                Monto de Negociación
                                            </label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                                <input
                                                    type="number"
                                                    value={montoNegociacion}
                                                    onChange={handleMontoChange}
                                                    placeholder="0"
                                                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E2D40] focus:border-transparent text-sm"
                                                />
                                            </div>
                                            <p className="text-xs text-gray-400 mt-1">Valor estimado en USD</p>
                                        </div>
                                    </>
                                )}

                                <div>
                                    <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Medio de Contacto (Canal)</p>
                                    <p className="px-3 py-1 bg-gray-100 rounded text-sm inline-block">{lead?.canal || "—"}</p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Fuente</p>
                                    <div className="flex items-center gap-2">
                                        <Building2 className="w-4 h-4 text-gray-400" />
                                        <p className="text-sm text-gray-900">{lead?.source || "—"}</p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Creado</p>
                                    <p className="text-sm text-gray-900">
                                        {lead?.created_at
                                            ? new Date(lead.created_at).toLocaleDateString("es-EC", {
                                                  year: "numeric",
                                                  month: "2-digit",
                                                  day: "2-digit",
                                              })
                                            : "—"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Asignado</p>
                                    <p className="text-sm text-gray-900">
                                        {lead?.assigned_at
                                            ? new Date(lead.assigned_at).toLocaleDateString("es-EC", {
                                                  year: "numeric",
                                                  month: "2-digit",
                                                  day: "2-digit",
                                              })
                                            : "—"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Respuestas del Formulario de Meta Ads */}
                        {hasFormResponses && (
                            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                <button
                                    onClick={() => setExpandedFormResponses(!expandedFormResponses)}
                                    className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 transition-colors"
                                >
                                    <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                                        Respuestas del Formulario
                                    </h3>
                                    {expandedFormResponses ? (
                                        <ChevronUp className="w-5 h-5 text-gray-600" />
                                    ) : (
                                        <ChevronDown className="w-5 h-5 text-gray-600" />
                                    )}
                                </button>

                                {expandedFormResponses && (
                                    <div className="p-6 space-y-4">
                                        {Object.entries(customFields)
                                            .filter(([key]) => formatFieldName(key) !== '')
                                            .map(([key, value]) => (
                                                <div key={key} className="border-b border-gray-100 pb-3 last:border-b-0">
                                                    <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">
                                                        {formatFieldName(key)}
                                                    </p>
                                                    <p className="text-sm text-gray-900">
                                                        {value?.toString() || "—"}
                                                    </p>
                                                </div>
                                            ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Columna 2: Guión de Aterrizaje */}
                    <div className="space-y-4">
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h3 className="text-sm font-bold text-gray-500 mb-4 uppercase tracking-wide">
                                Guión de Aterrizaje
                            </h3>

                            <div className="space-y-3">
                                {BLOQUES.map((bloque, bloqueIndex) => (
                                    <div key={bloqueIndex} className="border border-gray-200 rounded-lg overflow-hidden">
                                        <button
                                            onClick={() => toggleBloque(bloqueIndex)}
                                            className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
                                        >
                                            <span className="text-sm font-semibold text-gray-700">{bloque.titulo}</span>
                                            {expandedBloques.includes(bloqueIndex) ? (
                                                <ChevronUp className="w-4 h-4 text-gray-600" />
                                            ) : (
                                                <ChevronDown className="w-4 h-4 text-gray-600" />
                                            )}
                                        </button>

                                        {expandedBloques.includes(bloqueIndex) && (
                                            <div className="p-4 space-y-4 bg-white">
                                                {bloque.preguntas.map((pregunta, preguntaIndex) => (
                                                    <div key={preguntaIndex}>
                                                        <label className="block text-xs text-gray-600 mb-2 font-medium">
                                                            {pregunta}
                                                        </label>
                                                        <textarea
                                                            value={respuestas[`${bloqueIndex}-${preguntaIndex}`] || ""}
                                                            onChange={(e) =>
                                                                guardarRespuesta(bloqueIndex, preguntaIndex, e.target.value)
                                                            }
                                                            placeholder="Respuesta..."
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E2D40] focus:border-transparent text-sm resize-none"
                                                            rows={3}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Columna 3: Actividades */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h3 className="text-sm font-bold text-gray-500 mb-4 uppercase tracking-wide">
                                Actividades
                            </h3>

                            {/* Agente IA Toggle */}
                            <div className="mb-6 p-4 bg-gradient-to-r from-[#1E2D40] to-[#2a3f5f] rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <MessageSquare className="w-5 h-5 text-white" />
                                        <span className="text-white font-semibold">Agente IA</span>
                                    </div>
                                    <button
                                        onClick={() => setIsAgentEnabled(!isAgentEnabled)}
                                        className={`p-1 rounded-lg transition-colors ${
                                            isAgentEnabled ? "bg-green-500" : "bg-gray-400"
                                        }`}
                                    >
                                        {isAgentEnabled ? (
                                            <ToggleRight className="w-6 h-6 text-white" />
                                        ) : (
                                            <ToggleLeft className="w-6 h-6 text-white" />
                                        )}
                                    </button>
                                </div>
                                <p className="text-xs text-white/80">
                                    {isAgentEnabled ? "Automatización de seguimiento" : "Desactivado"}
                                </p>
                            </div>

                            {/* Registrar Llamada / Nota */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                    Registrar Llamada / Nota
                                </h4>
                                <textarea
                                    placeholder="Escribe aquí el resultado de la llamada o una nota..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E2D40] focus:border-transparent text-sm resize-none"
                                    rows={4}
                                />
                                <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#1E2D40] text-white rounded-lg hover:bg-[#2a3f5f] transition-colors">
                                    <Save className="w-4 h-4" />
                                    Guardar Nota
                                </button>
                            </div>

                            {/* Historial */}
                            <div className="mt-6">
                                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                                    Historial
                                </h4>
                                <p className="text-sm text-gray-400 text-center py-8">Sin actividad registrada</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
