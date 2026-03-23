"use client";

import React, { useState } from "react";
import { X, Calendar, Phone, MessageSquare, Upload, Save, Trash2 } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Lead {
  id: string;
  name: string;
  phone: string;
  assignedTo: string;
  optionsSent?: string;
  nextContact?: string;
  actionType?: "Llamada" | "Mensaje";
  discardedReason?: string;
  discardedDetail?: string;
}

interface LeadModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  column: string;
  onUpdate: (lead: Lead) => void;
  canDelete?: boolean;
  onDelete?: () => void;
}

const NEXT_CONTACT_OPTIONS = [
  "1 mes", "2 meses", "3 meses", "4 meses", "5 meses", "6 meses",
  "7 meses", "8 meses", "9 meses", "10 meses", "11 meses", "12 meses", "Fecha exacta"
];

const DISCARDED_REASONS = [
  "Ya compró/alquiló",
  "No quiere comprar/Canceló",
  "En Pausa/Postergado"
];

const CANCEL_SUB_REASONS = [
  "Se va del país",
  "Situación país",
  "Cambio de planes financieros",
  "Otro"
];

export default function LeadModal({ lead, isOpen, onClose, column, onUpdate, canDelete, onDelete }: LeadModalProps) {
  const [localLead, setLocalLead] = useState<Partial<Lead>>(lead || {});

  if (!isOpen || !lead) return null;

  const isDiscarded = column === "Descartados / En Pausa";
  const isSeguimiento = column === "Seguimiento Abierto (Infinito)";

  const handleSave = () => {
    onUpdate({ ...lead, ...localLead } as Lead);
    onClose();
  };

  const handleDelete = () => {
    if (onDelete) onDelete();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <header className="px-6 py-4 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between bg-gray-50 dark:bg-zinc-800/50">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-100">{lead.name}</h2>
            <p className="text-sm text-gray-500 dark:text-zinc-400 flex items-center gap-1">
              <Phone className="w-3 h-3" /> {lead.phone}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </header>

        <div className="p-6 space-y-8 max-h-[70vh] overflow-y-auto">
          {/* SEGUIMIENTO ABIERTO SECTION */}
          {isSeguimiento && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-blue-600">Seguimiento Abierto</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="form-label mb-1">Opciones enviadas (IDs de propiedades)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ej. DP-PSA-0001, CS-VC-0002"
                    value={localLead.optionsSent || ""}
                    onChange={(e) => setLocalLead({ ...localLead, optionsSent: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label mb-1">Próximo Contacto</label>
                    <select
                      className="form-input"
                      value={localLead.nextContact || ""}
                      onChange={(e) => setLocalLead({ ...localLead, nextContact: e.target.value })}
                    >
                      <option value="">Seleccionar...</option>
                      {NEXT_CONTACT_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="form-label mb-1">Tipo de Acción</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setLocalLead({ ...localLead, actionType: "Llamada" })}
                        className={cn(
                          "flex-1 py-2 px-3 rounded-md text-sm font-medium border flex items-center justify-center gap-2 transition-colors",
                          localLead.actionType === "Llamada"
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 border-gray-200 dark:border-zinc-700"
                        )}
                      >
                        <Phone className="w-4 h-4" /> Llamada
                      </button>
                      <button
                        type="button"
                        onClick={() => setLocalLead({ ...localLead, actionType: "Mensaje" })}
                        className={cn(
                          "flex-1 py-2 px-3 rounded-md text-sm font-medium border flex items-center justify-center gap-2 transition-colors",
                          localLead.actionType === "Mensaje"
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 border-gray-200 dark:border-zinc-700"
                        )}
                      >
                        <MessageSquare className="w-4 h-4" /> Mensaje
                      </button>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="form-label mb-2 flex items-center justify-between">
                    <span>Subir captura</span>
                    <span className="text-[10px] text-red-500 font-bold uppercase">Obligatorio si dejó en visto</span>
                  </label>
                  <button type="button" className="w-full border-2 border-dashed border-gray-200 dark:border-zinc-700 rounded-lg p-4 text-gray-500 dark:text-zinc-400 hover:border-blue-400 hover:text-blue-500 transition-all flex flex-col items-center gap-2">
                    <Upload className="w-6 h-6" />
                    <span className="text-sm font-medium">Click para subir captura</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* DESCARTADOS SECTION */}
          {isDiscarded && (
            <div className="pt-6 border-t border-gray-100 dark:border-zinc-800 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-red-600">Detalles de Descarte</h3>
              <div className="space-y-4">
                <div>
                  <label className="form-label mb-1">Motivo principal</label>
                  <select
                    className="form-input"
                    value={localLead.discardedReason || ""}
                    onChange={(e) => setLocalLead({ ...localLead, discardedReason: e.target.value })}
                  >
                    <option value="">Seleccionar...</option>
                    {DISCARDED_REASONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>

                {localLead.discardedReason === "Ya compró/alquiló" && (
                  <div className="animate-in slide-in-from-top-2 duration-200">
                    <label className="form-label mb-1">Detallar en qué zona compró</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Ej. Samborondón, Vía a la Costa..."
                      value={localLead.discardedDetail || ""}
                      onChange={(e) => setLocalLead({ ...localLead, discardedDetail: e.target.value })}
                    />
                  </div>
                )}

                {localLead.discardedReason === "No quiere comprar/Canceló" && (
                  <div className="animate-in slide-in-from-top-2 duration-200">
                    <label className="form-label mb-1">Específicamente por qué</label>
                    <select
                      className="form-input"
                      value={localLead.discardedDetail || ""}
                      onChange={(e) => setLocalLead({ ...localLead, discardedDetail: e.target.value })}
                    >
                      <option value="">Seleccionar...</option>
                      {CANCEL_SUB_REASONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                )}

                {localLead.discardedReason === "En Pausa/Postergado" && (
                  <div className="animate-in slide-in-from-top-2 duration-200">
                    <label className="form-label mb-1 font-bold text-red-600">Llamar después de esta fecha (MANDATORIO)</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                      <input
                        type="date"
                        className="form-input pl-10"
                        value={localLead.discardedDetail || ""}
                        onChange={(e) => setLocalLead({ ...localLead, discardedDetail: e.target.value })}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <footer className="px-6 py-4 border-t border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50 flex items-center justify-between gap-3">
          {/* ── Delete button — Super Administrador ONLY ── */}
          <div>
            {canDelete && onDelete && (
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar Contacto
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-md transition-colors">
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-md shadow-md flex items-center gap-2 transition-all"
            >
              <Save className="w-4 h-4" />
              Guardar Cambios
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
