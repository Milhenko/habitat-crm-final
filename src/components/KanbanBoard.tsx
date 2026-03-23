"use client";

import React, { useState } from "react";
import LeadModal from "./LeadModal";
import { Phone, Info, User, Users, AlertCircle, Trash2, Upload, Download } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

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

const COLUMNS = [
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

const INITIAL_LEADS: Record<string, Lead[]> = {
  "Lead Entrante": [
    { id: "1", name: "Juan Pérez", phone: "0991234567", assignedTo: "asesor-1" },
    { id: "2", name: "María García", phone: "0987654321", assignedTo: "asesor-2" },
  ],
  "Contacto Efectivo": [
    { id: "3", name: "Carlos López", phone: "0990000000", assignedTo: "asesor-1" },
    { id: "4", name: "Lucía Torres", phone: "0998887766", assignedTo: "asesor-2" },
  ],
  "Aterrizaje y Opciones": [
    { id: "5", name: "Andrés Mora", phone: "0994443322", assignedTo: "asesor-1" },
  ],
  "Seguimiento Abierto (Infinito)": [],
  "Visita Agendada": [],
  "Visita Realizada": [],
  "Reserva": [],
  "Cierre Ganado": [],
  "Descartados / En Pausa": [],
};

export default function KanbanBoard() {
  const { user } = useAuth();
  const [boardLeads, setBoardLeads] = useState(INITIAL_LEADS);
  const [selectedLead, setSelectedLead] = useState<{ lead: Lead; column: string } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const canImportExport = user.role === "Super Administrador";
  const canDelete = user.role === "Super Administrador";

  // Asesor solo ve sus propios leads usando user.id
  // Administradores y Super Administrador ven todos
  const visibleLeads = (column: string): Lead[] => {
    const leads = boardLeads[column] ?? [];
    if (user.role === "Asesor") {
      return leads.filter((l) => l.assignedTo === user.id);
    }
    return leads;
  };

  const onDragStart = (e: React.DragEvent, leadId: string, fromColumn: string) => {
    // Asesor no puede arrastrar leads
    if (user.role === "Asesor") return;
    e.dataTransfer.setData("leadId", leadId);
    e.dataTransfer.setData("fromColumn", fromColumn);
  };

  const onDrop = (e: React.DragEvent, toColumn: string) => {
    // Asesor no puede mover leads
    if (user.role === "Asesor") return;
    const leadId = e.dataTransfer.getData("leadId");
    const fromColumn = e.dataTransfer.getData("fromColumn");
    if (fromColumn === toColumn) return;

    const leadToMove = boardLeads[fromColumn].find(l => l.id === leadId);
    if (!leadToMove) return;

    setBoardLeads(prev => ({
      ...prev,
      [fromColumn]: prev[fromColumn].filter(l => l.id !== leadId),
      [toColumn]: [...prev[toColumn], leadToMove]
    }));
  };

  const handleUpdateLead = (updatedLead: Lead) => {
    if (!selectedLead) return;
    const col = selectedLead.column;
    setBoardLeads(prev => ({
      ...prev,
      [col]: prev[col].map(l => l.id === updatedLead.id ? updatedLead : l)
    }));
  };

  const handleDeleteLead = (leadId: string, column: string) => {
    setBoardLeads(prev => ({
      ...prev,
      [column]: prev[column].filter(l => l.id !== leadId)
    }));
    if (selectedLead?.lead.id === leadId) {
      setIsModalOpen(false);
      setSelectedLead(null);
    }
  };

  return (
    <div className="space-y-6">

      {canImportExport && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-zinc-900/50 p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center text-gray-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-zinc-100">Gestión de Datos</h3>
              <p className="text-xs text-gray-500">Importar o exportar la base de datos de leads.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-300 text-sm font-bold rounded-xl hover:bg-gray-50 transition-all shadow-sm flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Importar Base de Datos
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20 flex items-center gap-2">
              <Download className="w-4 h-4" />
              Exportar a Excel/CSV
            </button>
          </div>
        </div>
      )}

      <div className="flex h-[calc(100vh-320px)] overflow-x-auto gap-4 pb-4 no-scrollbar">
        {COLUMNS.map((column) => (
          <div
            key={column}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => onDrop(e, column)}
            className="flex-shrink-0 w-80 bg-gray-100/50 dark:bg-zinc-900/50 rounded-2xl flex flex-col border border-gray-200 dark:border-zinc-800"
          >
            <div className="p-4 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="font-bold text-xs text-gray-700 dark:text-zinc-300 uppercase tracking-widest">{column}</h3>
              <span className="bg-white dark:bg-zinc-800 text-gray-500 text-[10px] font-black px-2 py-0.5 rounded-full border border-gray-200 dark:border-zinc-700 shadow-sm">
                {visibleLeads(column).length}
              </span>
            </div>

            <div className="p-3 flex-1 overflow-y-auto space-y-4">
              {column === "Lead Entrante" && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 p-2.5 rounded-xl mb-2 flex items-center justify-center gap-2 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                  <span className="text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-tighter">Responder &lt; 5 min</span>
                </div>
              )}

              {visibleLeads(column).map((lead, idx) => (
                <div
                  key={lead.id}
                  draggable={user.role !== "Asesor"}
                  onDragStart={(e) => onDragStart(e, lead.id, column)}
                  className={`card p-4 hover:shadow-xl hover:border-blue-200 dark:hover:border-blue-900 transition-all group relative animate-in fade-in slide-in-from-bottom-2 dur