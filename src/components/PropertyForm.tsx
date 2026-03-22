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

      {/* HEADER CARD */}
      <div className="bg-absolute-white rounded-[2.5rem] p-8 border border-warm-bone shadow-2xl shadow-navy-sophisticate/5 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-navy-sophisticate tracking-tight italic">Módulo de Captación</h1>
          <p className="text-rich-black/60 font-medium">Gestión estratégica de inventario residencial y comercial.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right border-r border-warm-bone pr-5">
            <p className="text-[10px] font-bold text-rich-black/40 uppercase tracking-widest mb-1">Sesión Activa</p>
            <p className="font-bold text-navy-sophisticate">{user.name} <span className="text-warm-bone mx-1">|</span> {user.role}</p>
          </div>
          <button
            type="submit"
            className="bg-navy-sophisticate hover:bg-opacity-90 text-absolute-white px-10 py-4 rounded-full font-bold shadow-lg shadow-navy-sophisticate/30 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <Save size={20} />
            Guardar Propiedad
          </button>
        </div>
      </div>

      {generatedId && (
        <div className="bg-gradient-to-br from-navy-sophisticate to-blue-900 text-absolute-white p-6 rounded-[2rem] flex items-center justify-between animate-in zoom-in-95 shadow-2xl shadow-navy-sophisticate/40">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-absolute-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
              <CheckCircle2 size={32} />
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-warm-bone/80 mb-1">Éxito en Generación</p>
              <p className="text-2xl font-black font-mono tracking-tighter">ID: {generatedId}</p>
            </div>
          </div>
          <button type="button" onClick={() => setGeneratedId(null)} className="text-xs font-bold bg-absolute-white/10 hover:bg-absolute-white/20 px-4 py-2 rounded-full uppercase tracking-widest">Nueva Ficha</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">

          {/* FICHA TÉCNICA */}
          <section className="bg-absolute-white rounded-[2.5rem] border border-warm-bone p-10 shadow-sm space-y-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-warm-bone rounded-2xl flex items-center justify-center">
                <Building2 className="text-navy-sophisticate" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black text-rich-black">Ficha Técnica e ID Inteligente</h2>
                <p className="text-xs font-bold text-rich-black/40 uppercase tracking-widest">Parámetros de Estructura y Ubicación</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[11px] font-black text-rich-black/50 uppercase tracking-widest ml-1">Tipo de Propiedad</label>
                <select
                  required
                  className="w-full h-14 px-6 rounded-2xl bg-warm-bone/20 border-none text-rich-black font-bold focus:ring-4 focus:ring-navy-sophisticate/10 outline-none appearance-none cursor-pointer"
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                >
                  <option value="">Seleccionar Tipo...</option>
                  {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="space-y-3">
                <label className="text-[11px] font-black text-rich-black/50 uppercase tracking-widest ml-1">Zona Macro</label>
                <select
                  required
                  className="w-full h-14 px-6 rounded-2xl bg-warm-bone/20 border-none text-rich-black font-bold focus:ring-4 focus:ring-navy-sophisticate/10 outline-none appearance-none cursor-pointer"
                  value={formData.zona}
                  onChange={(e) => setFormData({ ...formData, zona: e.target.value })}
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
                <div key={f.key} className="p-5 bg-warm-bone/10 rounded-3xl border border-warm-bone hover:border-navy-sophisticate/30 transition-colors">
                  <label className="text-[10px] font-black text-rich-black/40 uppercase tracking-widest mb-2 block">{f.label} {f.sub && <span>({f.sub})</span>}</label>
                  <input
                    type="number"
                    className="w-full bg-transparent border-none p-0 text-xl font-black text-rich-black outline-none focus:ring-0 placeholder:text-warm-bone"
                    placeholder="0"
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
              <div className="p-8 bg-warm-bone/20 rounded-[2rem] border border-warm-bone">
                <label className="text-xs font-black text-navy-sophisticate uppercase tracking-widest mb-3 flex items-center gap-2">
                  <BadgeDollarSign size={16} /> Precio Inicial
                </label>
                <div className="flex items-center text-3xl font-black text-rich-black">
                  <span className="opacity-20 mr-2">$</span>
                  <input type="text" className="w-full bg-transparent border-none p-0 focus:ring-0 outline-none" placeholder="0.00" />
                </div>
              </div>
              <div className="p-8 bg-navy-sophisticate/5 rounded-[2rem] border border-navy-sophisticate/10">
                <label className="text-xs font-black text-navy-sophisticate uppercase tracking-widest mb-3 flex items-center gap-2">
                  <BadgeDollarSign size={16} /> Precio Actualizado
                </label>
                <div className="flex items-center text-3xl font-black text-navy-sophisticate">
                  <span className="opacity-20 mr-2">$</span>
                  <input type="text" className="w-full bg-transparent border-none p-0 focus:ring-0 outline-none" placeholder="0.00" />
                </div>
              </div>
            </div>
          </section>

          {/* DETALLES LEGALES */}
          <section className="bg-absolute-white rounded-[2.5rem] border border-warm-bone p-10 shadow-sm space-y-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-warm-bone rounded-2xl flex items-center justify-center">
                <Info className="text-navy-sophisticate" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black text-rich-black">Detalles Legales y Mantenimiento</h2>
                <p className="text-xs font-bold text-rich-black/40 uppercase tracking-widest">Estado físico y jurídico</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div className="p-6 bg-warm-bone/10 rounded-3xl space-y-4 border border-warm-bone/50">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-6 h-6 rounded-md border-warm-bone text-navy-sophisticate focus:ring-navy-sophisticate"
                      checked={formData.hipoteca}
                      onChange={(e) => setFormData({ ...formData, hipoteca: e.target.checked })}
                    />
                    <span className="font-bold text-sm text-rich-black">Propiedad con Hipoteca</span>
                  </label>
                  {formData.hipoteca && (
                    <input
                      type="text"
                      placeholder="Indique banco y saldo..."
                      className="w-full h-12 bg-absolute-white px-4 rounded-xl border border-warm-bone text-sm outline-none"
                      value={formData.observacionesHipoteca}
                      onChange={(e) => setFormData({ ...formData, observacionesHipoteca: e.target.value })}
                    />
                  )}
                </div>

                <div className="p-6 bg-warm-bone/10 rounded-3xl space-y-4 border border-warm-bone/50">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-6 h-6 rounded-md border-warm-bone text-navy-sophisticate focus:ring-navy-sophisticate"
                      checked={formData.reformas}
                      onChange={(e) => setFormData({ ...formData, reformas: e.target.checked })}
                    />
                    <span className="font-bold text-sm text-rich-black">¿Ha tenido reformas?</span>
                  </label>
                  {formData.reformas && (
                    <input
                      type="text"
                      placeholder="Detalle los cambios..."
                      className="w-full h-12 bg-absolute-white px-4 rounded-xl border border-warm-bone text-sm outline-none"
                      value={formData.detalleReformas}
                      onChange={(e) => setFormData({ ...formData, detalleReformas: e.target.value })}
                    />
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-4">
                  <label className="text-[11px] font-black text-rich-black/40 uppercase tracking-widest ml-1">Estado Legal</label>
                  <select
                    className="w-full h-14 px-6 rounded-2xl bg-warm-bone/20 border-none font-bold text-rich-black"
                    value={formData.estadoLegal}
                    onChange={(e) => setFormData({ ...formData, estadoLegal: e.target.value })}
                  >
                    <option value="">Seleccionar estado...</option>
                    <option value="Sociedad conyugal">Sociedad conyugal</option>
                    <option value="Divorciados">Divorciados</option>
                    <option value="Hermanos">Hermanos</option>
                  </select>
                </div>

                <label className="flex items-center gap-3 p-6 bg-gradient-to-r from-warm-bone/50 to-warm-bone/10 rounded-3xl border border-warm-bone cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-6 h-6 rounded-md border-warm-bone text-navy-sophisticate focus:ring-navy-sophisticate"
                    checked={formData.solicitudLlaves}
                    onChange={(e) => setFormData({ ...formData, solicitudLlaves: e.target.checked })}
                  />
                  <div>
                    <span className="font-black text-navy-sophisticate block text-sm">Solicitud de Llaves</span>
                    <span className="text-[10px] text-rich-black/40 font-bold uppercase tracking-widest">Documento de responsabilidad</span>
                  </div>
                </label>
              </div>
            </div>
          </section>
        </div>

        {/* COLUMNA DERECHA: MARKETING */}
        <div className="space-y-8">
          <section className="bg-absolute-white rounded-[2.5rem] border border-warm-bone p-10 shadow-sm space-y-10 relative overflow-hidden">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-navy-sophisticate text-absolute-white rounded-2xl flex items-center justify-center">
                <Megaphone size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black text-rich-black">Marketing</h2>
                <p className="text-xs font-bold text-rich-black/40 uppercase tracking-widest">Visibilidad</p>
              </div>
            </div>

            {canEditMarketing && (
              <div className="space-y-3">
                <label className="text-[11px] font-black text-rich-black/50 uppercase tracking-widest ml-1">Estado de Marketing</label>
                <select
                  className="w-full h-14 px-6 rounded-2xl bg-navy-sophisticate text-absolute-white font-black focus:ring-4 focus:ring-navy-sophisticate/20 outline-none appearance-none cursor-pointer"
                  value={formData.estadoMarketing}
                  onChange={(e) => setFormData({ ...formData, estadoMarketing: e.target.value })}
                >
                  {MARKETING_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            )}

            <div className="space-y-4 pt-4 border-t border-warm-bone">
              <label className="text-[11px] font-black text-rich-black/40 uppercase tracking-widest ml-1">Producción</label>
              <div className="flex flex-wrap gap-2">
                {PRODUCTION_CHECKLIST.map(item => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleCheckbox(item, prod, setProd)}
                    className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${prod.includes(item)
                        ? "bg-navy-sophisticate text-absolute-white shadow-lg"
                        : "bg-warm-bone/30 text-rich-black/40 hover:bg-warm-bone"
                      }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              rows={6}
              disabled={isAsesor}
              placeholder={isAsesor ? "Solo lectura para Asesores." : "Notas estratégicas..."}
              className="w-full p-6 rounded-3xl bg-warm-bone/10 border-none text-sm font-medium focus:ring-4 focus:ring-navy-sophisticate/5 resize-none"
              value={formData.notasMarketing}
              onChange={(e) => setFormData({ ...formData, notasMarketing: e.target.value })}
            />
          </section>

          <div className="p-8 bg-gradient-to-br from-navy-sophisticate to-[#16212d] rounded-[2.5rem] text-absolute-white space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <Info className="text-warm-bone" size={20} />
              <p className="text-xs font-bold uppercase tracking-widest">Ayuda de Sistema</p>
            </div>
            <p className="text-sm text-warm-bone/80 font-medium leading-relaxed">
              El ID se genera automáticamente al guardar, vinculando tipo, zona y tus iniciales ({user.initials}).
            </p>
          </div>
        </div>
      </div>
    </form>
  );
}