"use client";

import React, { useState } from "react";
import {
  Building2,
  BadgeDollarSign,
  FileCheck2,
  Megaphone,
  Save,
  Info,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { generatePropertyId } from "@/lib/idGenerator";

const PROPERTY_TYPES = [
  "Casa", "Departamento", "Terreno familiar", "Terreno bifamiliar",
  "Terreno multifamiliar", "Industrial", "Comercial", "Local comercial",
  "Oficina", "Parqueo", "Terreno más galpón"
];

const MACRO_ZONES = [
  "1. Norte y Centro-Norte", "2. Corredor Vía a Daule", "3. Noroeste y Periferia",
  "4. Centro y Casco Histórico", "5. Suroeste", "6. Sur", "7. Vía a la Costa",
  "8. Puerto Santa Ana", "9. Samborondón (La Puntilla)", "10. Samborondón (Nuevo Samborondón)",
  "11. Vía Aurora / Av. León Febres Cordero", "12. Daule", "13. Vía a Salitre",
  "14. Durán", "15. Vía Durán Tambo", "16. Vía Durán Yaguachi", "17. Vía Durán Boliche",
  "18. Milagro", "19. Vía Naranjal / Naranjal", "20. Ruta del Spondylus",
  "21. Salinas", "22. Santa Elena"
];

const MARKETING_STATUSES = [
  "Aprobada CON Exclusiva", "Aprobada SIN Exclusiva",
  "En Revisión", "Falta Documentación"
];

const DOCUMENT_CHECKLIST = [
  "Fotos", "Videos", "Análisis de mercado", "Acuerdo de corretaje",
  "Ficha técnica", "Guiones", "Captions", "Registro de la propiedad",
  "Cédula o RUC", "Avalúo catastral", "Escrituras"
];

const PRODUCTION_CHECKLIST = ["Grabado", "Editado", "Publicado"];

export default function PropertyForm() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    tipo: "",
    zona: "",
    habitaciones: "",
    banos: "",
    parqueos: "",
    antiguedad: "",
    metraje: "",
    areaTerreno: "",
    precioInicial: "",
    precioActualizado: "",
    workspaceUrl: "",
    estadoMarketing: "En Revisión",
    notasMarketing: "",
    amoblado: false,
    googleMapsUrl: "",
    hipoteca: false,
    observacionesHipoteca: "",
    controlPlagas: false,
    mantenimientoAire: false,
    reformas: false,
    detalleReformas: "",
    usoSuelo: false,
    detalleUsoSuelo: "",
    estadoLegal: "",
    solicitudLlaves: false
  });

  const [docs, setDocs] = useState<string[]>([]);
  const [prod, setProd] = useState<string[]>([]);
  const [generatedId, setGeneratedId] = useState<string | null>(null);

  const handleCheckbox = (item: string, list: string[], setList: (l: string[]) => void) => {
    setList(list.includes(item) ? list.filter(i => i !== item) : [...list, item]);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.tipo || !formData.zona) {
      alert("Por favor selecciona Tipo y Zona para generar el ID.");
      return;
    }
    const id = generatePropertyId(formData.tipo, formData.zona, 1, user.initials);
    setGeneratedId(id);
    alert(`¡Propiedad Guardada! ID: ${id}`);
  };

  const canEditMarketing = user.role === "Super Administrador" || user.role === "Administrador de Marketing";
  const isAsesor = user.role === "Asesor";

  return (
    <form onSubmit={handleSave} className="max-w-7xl mx-auto px-4 pb-20 space-y-8 animate-in fade-in duration-700">

      {/* Header Info Card - Absolute White */}
      <div className="bg-absolute-white rounded-[2.5rem] p-8 border border-warm-bone shadow-2xl shadow-navy-sophisticate/5 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-navy-sophisticate tracking-tight italic">Módulo de Captación</h1>
          <p className="text-rich-black opacity-60 font-medium">Gestión estratégica de inventario residencial y comercial.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right border-r border-warm-bone pr-5">
            <p className="text-[10px] font-bold text-rich-black/40 uppercase tracking-widest mb-1">Sesión Activa</p>
            <p className="font-bold text-navy-sophisticate">{user.name} <span className="text-warm-bone mx-1">|</span> {user.role}</p>
          </div>
          {/* CTA con Degradado Navy */}
          <button
            type="submit"
            className="bg-gradient-to-r from-navy-sophisticate to-[#2c3e5a] hover:opacity-90 text-absolute-white px-10 py-4 rounded-full font-bold shadow-lg shadow-navy-sophisticate/30 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <Save size={20} />
            Guardar Propiedad
          </button>
        </div>
      </div>

      {/* ID Generado con Degradado Sophisticate */}
      {generatedId && (
        <div className="bg-gradient-to-br from-navy-sophisticate to-blue-900 text-absolute-white p-6 rounded-[2rem] flex items-center justify-between animate-in zoom-in-95 shadow-2xl shadow-navy-soph