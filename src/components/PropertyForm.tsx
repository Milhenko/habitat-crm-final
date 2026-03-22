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
      
      {/* Header Info Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 border border-gray-200 dark:border-zinc-800 shadow-xl shadow-blue-900/5 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-zinc-100 tracking-tight italic">Módulo de Captación</h1>
          <p className="text-gray-500 font-medium">Gestión estratégica de inventario residencial y comercial.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right border-r border-gray-100 dark:border-zinc-800 pr-5">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Sesión Activa</p>
            <p className="font-bold text-blue-600">{user.name} <span className="text-gray-300 mx-1">|</span> {user.role}</p>
          </div>
          <button 
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-full font-bold shadow-lg shadow-blue-500/30 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <Save size={20} />
            Guardar Propiedad
          </button>
        </div>
      </div>

      {generatedId && (
        <div className="bg-blue-600 text-white p-6 rounded-[2rem] flex items-center justify-between animate-in zoom-in-95 shadow-2xl shadow-blue-500/40">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
              <CheckCircle2 size={32} />
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-blue-100 mb-1">Éxito en Generación</p>
              <p className="text-2xl font-black font-mono tracking-tighter">ID: {generatedId}</p>
            </div>
          </div>
          <button onClick={() => setGeneratedId(null)} className="text-xs font-bold bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full uppercase tracking-widest">Nueva Ficha</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Property Data */}
        <div className="lg:col-span-2 space-y-8">
          
          <section className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-gray-100 dark:border-zinc-800 p-10 shadow-sm space-y-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center">
                <Building2 className="text-blue-600" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900 dark:text-zinc-100">Ficha Técnica e ID Inteligente</h2>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Parámetros de Estructura y Ubicación</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Tipo de Propiedad</label>
                <select 
                  required
                  className="w-full h-14 px-6 rounded-2xl bg-gray-50 dark:bg-zinc-800 border-none text-gray-900 dark:text-zinc-100 font-bold focus:ring-4 focus:ring-blue-500/10 outline-none appearance-none cursor-pointer"
                  value={formData.tipo}
                  onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                >
                  <option value="">Seleccionar Tipo...</option>
                  {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Zona Macro</label>
                <select 
                  required
                  className="w-full h-14 px-6 rounded-2xl bg-gray-50 dark:bg-zinc-800 border-none text-gray-900 dark:text-zinc-100 font-bold focus:ring-4 focus:ring-blue-500/10 outline-none appearance-none cursor-pointer"
                  value={formData.zona}
                  onChange={(e) => setFormData({...formData, zona: e.target.value})}
                >
                  <option value="">Seleccionar Zona...</option>
                  {MACRO_ZONES.map(z => <option key={z} value={z}>{z}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {[
                { label: "Habitaciones", key: "habitaciones" },
                { label: "Baños", key: "banos" },
                { label: "Parqueos", key: "parqueos" },
                { label: "Antigüedad", key: "antiguedad", sub: "años" },
                { label: "Metraje Const.", key: "metraje", sub: "m²" },
                { label: "Área Terreno", key: "areaTerreno", sub: "m²" }
              ].map(f => (
                <div key={f.key} className="p-5 bg-gray-50/50 dark:bg-zinc-800/30 rounded-3xl border border-gray-100 dark:border-zinc-800 hover:border-blue-200 transition-colors">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">{f.label} {f.sub && <span className="text-gray-300">({f.sub})</span>}</label>
                  <input 
                    type="number"
                    className="w-full bg-transparent border-none p-0 text-xl font-black text-gray-900 dark:text-zinc-100 outline-none focus:ring-0 placeholder:text-gray-200"
                    placeholder="0"
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
              <div className="p-8 bg-green-50/30 dark:bg-green-900/5 rounded-[2rem] border border-green-100 dark:border-green-900/20">
                <label className="text-xs font-black text-green-700 dark:text-green-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <BadgeDollarSign size={16} /> Precio Inicial de Captación
                </label>
                <div className="flex items-center text-3xl font-black text-green-900 dark:text-green-100">
                  <span className="opacity-30 mr-2">$</span>
                  <input 
                    type="text"
                    className="w-full bg-transparent border-none p-0 focus:ring-0 outline-none placeholder:text-green-100/50"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="p-8 bg-blue-50/30 dark:bg-blue-900/5 rounded-[2rem] border border-blue-100 dark:border-blue-900/20">
                <label className="text-xs font-black text-blue-700 dark:text-blue-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <BadgeDollarSign size={16} /> Precio Actualizado
                </label>
                <div className="flex items-center text-3xl font-black text-blue-900 dark:text-blue-100">
                  <span className="opacity-30 mr-2">$</span>
                  <input 
                    type="text"
                    className="w-full bg-transparent border-none p-0 focus:ring-0 outline-none placeholder:text-blue-100/30"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
              <div className="space-y-4">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1 italic">Amoblado</label>
                <div className="flex gap-4">
                  {["Sí", "No"].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setFormData({ ...formData, amoblado: opt === "Sí" })}
                      className={`flex-1 h-14 rounded-2xl font-bold transition-all ${
                        (formData.amoblado && opt === "Sí") || (!formData.amoblado && opt === "No")
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                          : "bg-gray-50 dark:bg-zinc-800 text-gray-400"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1 italic">Link de Ubicación (Google Maps)</label>
                <input
                  type="url"
                  placeholder="https://goo.gl/maps/..."
                  className="w-full h-14 px-6 rounded-2xl bg-gray-50 dark:bg-zinc-800 border-none text-blue-600 font-medium focus:ring-4 focus:ring-blue-500/10 outline-none"
                  value={formData.googleMapsUrl}
                  onChange={(e) => setFormData({ ...formData, googleMapsUrl: e.target.value })}
                />
              </div>
            </div>
          </section>

          {/* New Section: Detalles Legales y Mantenimiento */}
          <section className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-gray-100 dark:border-zinc-800 p-10 shadow-sm space-y-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 rounded-2xl flex items-center justify-center">
                <Info className="text-amber-600" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900 dark:text-zinc-100">Detalles Legales y Mantenimiento</h2>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Estado físico y jurídico avanzado</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div className="p-6 bg-gray-50 dark:bg-zinc-800/30 rounded-3xl space-y-4 border border-transparent hover:border-amber-100 transition-all">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      className="w-6 h-6 rounded-md border-gray-300 text-amber-600 focus:ring-amber-500"
                      checked={formData.hipoteca}
                      onChange={(e) => setFormData({...formData, hipoteca: e.target.checked})}
                    />
                    <span className="font-bold text-sm text-gray-700 dark:text-zinc-300">Propiedad con Hipoteca</span>
                  </label>
                  {formData.hipoteca && (
                    <input 
                      type="text"
                      placeholder="Indique banco y saldo aproximado..."
                      className="w-full h-12 bg-white dark:bg-zinc-800 px-4 rounded-xl border-none text-sm outline-none focus:ring-4 focus:ring-amber-500/10 placeholder:italic"
                      value={formData.observacionesHipoteca}
                      onChange={(e) => setFormData({...formData, observacionesHipoteca: e.target.value})}
                    />
                  )}
                </div>

                <div className="p-6 bg-gray-50 dark:bg-zinc-800/30 rounded-3xl space-y-4 border border-transparent hover:border-amber-100 transition-all">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      className="w-6 h-6 rounded-md border-gray-300 text-amber-600 focus:ring-amber-500"
                      checked={formData.reformas}
                      onChange={(e) => setFormData({...formData, reformas: e.target.checked})}
                    />
                    <span className="font-bold text-sm text-gray-700 dark:text-zinc-300">¿Ha tenido reformas?</span>
                  </label>
                  {formData.reformas && (
                    <input 
                      type="text"
                      placeholder="Detalle los cambios realizados..."
                      className="w-full h-12 bg-white dark:bg-zinc-800 px-4 rounded-xl border-none text-sm outline-none focus:ring-4 focus:ring-amber-500/10"
                      value={formData.detalleReformas}
                      onChange={(e) => setFormData({...formData, detalleReformas: e.target.value})}
                    />
                  )}
                </div>

                <div className="p-6 bg-gray-50 dark:bg-zinc-800/30 rounded-3xl space-y-4 border border-transparent hover:border-amber-100 transition-all">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      className="w-6 h-6 rounded-md border-gray-300 text-amber-600 focus:ring-amber-500"
                      checked={formData.usoSuelo}
                      onChange={(e) => setFormData({...formData, usoSuelo: e.target.checked})}
                    />
                    <span className="font-bold text-sm text-gray-700 dark:text-zinc-300">Uso de Suelo</span>
                  </label>
                  {formData.usoSuelo && (
                    <input 
                      type="text"
                      placeholder="Ej: Residencial, Comercial..."
                      className="w-full h-12 bg-white dark:bg-zinc-800 px-4 rounded-xl border-none text-sm outline-none focus:ring-4 focus:ring-amber-500/10"
                      value={formData.detalleUsoSuelo}
                      onChange={(e) => setFormData({...formData, detalleUsoSuelo: e.target.value})}
                    />
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-4">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Mantenimiento</label>
                  <div className="grid grid-cols-1 gap-3">
                    <label className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-zinc-800/30 rounded-2xl cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="w-5 h-5 rounded-md border-gray-300 text-amber-600 focus:ring-amber-500"
                        checked={formData.controlPlagas}
                        onChange={(e) => setFormData({...formData, controlPlagas: e.target.checked})}
                      />
                      <span className="text-sm font-bold text-gray-600">Control de plagas</span>
                    </label>
                    <label className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-zinc-800/30 rounded-2xl cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="w-5 h-5 rounded-md border-gray-300 text-amber-600 focus:ring-amber-500"
                        checked={formData.mantenimientoAire}
                        onChange={(e) => setFormData({...formData, mantenimientoAire: e.target.checked})}
                      />
                      <span className="text-sm font-bold text-gray-600">Mantenimiento de AA</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Estado Legal</label>
                  <select 
                    className="w-full h-14 px-6 rounded-2xl bg-gray-50 dark:bg-zinc-800 border-none font-bold text-gray-700"
                    value={formData.estadoLegal}
                    onChange={(e) => setFormData({...formData, estadoLegal: e.target.value})}
                  >
                    <option value="">Seleccionar estado...</option>
                    <option value="Divorciados">Divorciados</option>
                    <option value="Hermanos">Hermanos</option>
                    <option value="Socios">Socios</option>
                    <option value="Sociedad conyugal">Sociedad conyugal</option>
                  </select>
                </div>

                <label className="flex items-center gap-3 p-6 bg-amber-50/30 dark:bg-amber-900/5 rounded-3xl border border-amber-100 dark:border-amber-900/20 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="w-6 h-6 rounded-md border-amber-300 text-amber-600 focus:ring-amber-500"
                    checked={formData.solicitudLlaves}
                    onChange={(e) => setFormData({...formData, solicitudLlaves: e.target.checked})}
                  />
                  <div>
                    <span className="font-black text-amber-900 dark:text-amber-100 block text-sm">Solicitud de Llaves</span>
                    <span className="text-[10px] text-amber-600/60 font-bold uppercase tracking-widest">Documento de responsabilidad</span>
                  </div>
                </label>
              </div>
            </div>
          </section>

          <section className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-gray-100 dark:border-zinc-800 p-10 shadow-sm space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 rounded-2xl flex items-center justify-center">
                <FileCheck2 className="text-purple-600" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900 dark:text-zinc-100">Documentación y Checklist</h2>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Garantía Jurídica del Inmueble</p>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">URL de Google Workspace (Drive/Ficha)</label>
              <input 
                type="url"
                className="w-full h-14 px-6 rounded-2xl bg-gray-50 dark:bg-zinc-800 border-none text-sm text-blue-600 dark:text-blue-400 font-medium focus:ring-4 focus:ring-purple-500/10 outline-none"
                placeholder="https://drive.google.com/..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {DOCUMENT_CHECKLIST.map(item => (
                <label key={item} className={`flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${
                  docs.includes(item) 
                    ? "bg-purple-50 border-purple-200 dark:bg-purple-900/10 dark:border-purple-800" 
                    : "bg-gray-50/50 border-gray-100 dark:bg-zinc-800/30 dark:border-zinc-800 hover:border-purple-100"
                }`}>
                  <div className="relative flex items-center justify-center">
                    <input 
                      type="checkbox"
                      className="peer w-6 h-6 rounded-lg border-gray-300 text-purple-600 focus:ring-purple-500 transition-all opacity-0 absolute cursor-pointer"
                      checked={docs.includes(item)}
                      onChange={() => handleCheckbox(item, docs, setDocs)}
                    />
                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                      docs.includes(item) ? "bg-purple-600 border-purple-600 text-white" : "bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-700"
                    }`}>
                      {docs.includes(item) && <CheckCircle2 size={14} strokeWidth={4} />}
                    </div>
                  </div>
                  <span className={`text-sm font-bold ${docs.includes(item) ? "text-purple-900 dark:text-purple-100" : "text-gray-500"}`}>{item}</span>
                </label>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Marketing Section */}
        <div className="space-y-8">
          <section className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-gray-100 dark:border-zinc-800 p-10 shadow-sm space-y-10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-40 h-40 bg-orange-600 opacity-[0.03] rounded-full translate-x-20 -translate-y-20 group-hover:scale-125 transition-transform duration-1000"></div>
            
            <div className="flex items-center gap-4 relative">
              <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/20 rounded-2xl flex items-center justify-center">
                <Megaphone className="text-orange-600" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900 dark:text-zinc-100">Gestión de Marketing</h2>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Visibilidad y Producción</p>
              </div>
            </div>

            {/* RBAC Visibility: Estado de Marketing - COMPLETELY HIDDEN for Asesor */}
            {canEditMarketing ? (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-500">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Estado de Marketing</label>
                <select 
                  className="w-full h-14 px-6 rounded-2xl bg-orange-50 dark:bg-orange-900/10 border-2 border-orange-100 dark:border-orange-800/30 text-orange-900 dark:text-orange-200 font-black focus:ring-4 focus:ring-orange-500/20 outline-none appearance-none cursor-pointer"
                  value={formData.estadoMarketing}
                  onChange={(e) => setFormData({...formData, estadoMarketing: e.target.value})}
                >
                  {MARKETING_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            ) : null}

            <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-zinc-800">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Checklist de Producción</label>
              <div className="flex flex-wrap gap-2">
                {PRODUCTION_CHECKLIST.map(item => (
                  <button 
                    key={item}
                    type="button"
                    onClick={() => handleCheckbox(item, prod, setProd)}
                    className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      prod.includes(item) 
                        ? "bg-orange-600 text-white shadow-lg shadow-orange-500/20" 
                        : "bg-gray-100 dark:bg-zinc-800 text-gray-400 hover:bg-gray-200 dark:hover:bg-zinc-700"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* RBAC Read-only: Notas */}
            <div className="space-y-3">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Observaciones / Notas de Marketing</label>
                {isAsesor && (
                  <span className="text-[9px] bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-0.5 rounded uppercase font-black">Solo Lectura</span>
                )}
              </div>
              <textarea 
                rows={6}
                disabled={isAsesor}
                placeholder={isAsesor ? "Solo Super Administrador y Marketing pueden editar estas notas." : "Ingresa aquí observaciones estratégicas..."}
                className={`w-full p-6 rounded-3xl border-none text-sm font-medium transition-all resize-none shadow-inner ${
                  isAsesor 
                    ? "bg-gray-100 dark:bg-zinc-800/50 text-gray-400 italic cursor-not-allowed selection:bg-transparent" 
                    : "bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 focus:ring-4 focus:ring-orange-500/10"
                }`}
                value={formData.notasMarketing}
                onChange={(e) => setFormData({...formData, notasMarketing: e.target.value})}
              />
            </div>
          </section>

          <div className="p-8 bg-blue-900 rounded-[2.5rem] text-white space-y-4 shadow-2xl shadow-blue-500/20 relative overflow-hidden group">
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-30"></div>
            <div className="flex items-center gap-3">
              <Info className="text-blue-400" size={20} />
              <p className="text-xs font-bold uppercase tracking-widest">Ayuda de Sistema</p>
            </div>
            <p className="text-sm text-blue-100 font-medium leading-relaxed opacity-80">
              El ID se genera automáticamente al presionar "Guardar Propiedad", vinculando el tipo, zona y tus iniciales ({user.initials}).
            </p>
          </div>
        </div>
      </div>
    </form>
  );
}
