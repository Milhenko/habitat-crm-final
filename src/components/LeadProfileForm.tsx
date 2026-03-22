"use client";

import React, { useState } from "react";
import { 
  ChevronDown, 
  ChevronUp, 
  User, 
  Target, 
  MapPin, 
  Wallet, 
  Clock, 
  AlertTriangle, 
  Save,
  CheckCircle2,
  MoreVertical,
  MessageSquare,
  AlertCircle
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface AccordionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}

const Accordion = ({ title, icon, children, isOpen, onToggle }: AccordionProps) => (
  <div className="border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-900 shadow-sm mb-4">
    <button
      onClick={onToggle}
      className={cn(
        "w-full px-6 py-4 flex items-center justify-between transition-colors",
        isOpen ? "bg-gray-50 dark:bg-zinc-800/50" : "hover:bg-gray-50 dark:hover:bg-zinc-800/30"
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn("p-2 rounded-lg", isOpen ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-zinc-800 text-gray-500")}>
          {icon}
        </div>
        <span className="font-bold text-gray-900 dark:text-zinc-100">{title}</span>
      </div>
      {isOpen ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
    </button>
    {isOpen && <div className="px-6 py-6 border-t border-gray-100 dark:border-zinc-800 animate-in slide-in-from-top-2 duration-200">{children}</div>}
  </div>
);

export default function LeadProfileForm() {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    intent: true,
    location: false,
    finance: false,
    timing: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      {/* BLOQUE 1: Apertura e Intención */}
      <Accordion 
        title="Bloque 1: Apertura e Intención" 
        icon={<Target className="w-5 h-5" />}
        isOpen={openSections.intent}
        onToggle={() => toggleSection("intent")}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-2">
            <label className="form-label mb-1">¿Qué le llamó la atención de la propiedad?</label>
            <textarea className="form-input resize-none" rows={2} placeholder="Ej. El metraje, la ubicación en PSA..." />
          </div>
          <div>
            <label className="form-label mb-1">Número de personas que vivirán</label>
            <input type="number" className="form-input" placeholder="Ej. 4" />
          </div>
          <div>
            <label className="form-label mb-1">Otros tomadores de decisión</label>
            <input type="text" className="form-input" placeholder="Socios, Esposo/a, Padres..." />
          </div>
          <div>
            <label className="form-label mb-1">¿Primera casa?</label>
            <select className="form-input">
              <option value="">Seleccionar...</option>
              <option value="si">Sí</option>
              <option value="no">No</option>
            </select>
          </div>
          <div>
            <label className="form-label mb-1">Objetivo de la compra</label>
            <select className="form-input">
              <option value="">Seleccionar...</option>
              <option value="vivir">Para Vivir</option>
              <option value="alquilar">Inversión (Alquilar)</option>
              <option value="comercial">Uso Comercial</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="form-label mb-1">Situación actual</label>
            <select className="form-input">
              <option value="">Seleccionar...</option>
              <option value="alquilando">Alquilando actualmente</option>
              <option value="familiar">Viviendo con familiar</option>
              <option value="propia">Casa propia (desea cambiar)</option>
            </select>
          </div>
        </div>
      </Accordion>

      {/* BLOQUE 2: Ubicación, Entorno y Requerimientos */}
      <Accordion 
        title="Bloque 2: Ubicación, Entorno y Requerimientos" 
        icon={<MapPin className="w-5 h-5" />}
        isOpen={openSections.location}
        onToggle={() => toggleSection("location")}
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="form-label mb-1">Sector donde reside actualmente</label>
              <input type="text" className="form-input" placeholder="Ej. Urdesa, Ceibos..." />
            </div>
            <div>
              <label className="form-label mb-1">¿Conoce la ubicación de esta propiedad?</label>
              <select className="form-input">
                <option value="">Seleccionar...</option>
                <option value="si">Sí, perfectamente</option>
                <option value="no">No, necesita guía</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="form-label mb-1">Plan B de zona y ¿por qué?</label>
              <textarea className="form-input resize-none" rows={2} placeholder="Otras zonas de interés y motivos..." />
            </div>
            <div className="col-span-2">
              <label className="form-label mb-1">Rutinas y movilidad (Trabajo/Colegios)</label>
              <textarea className="form-input resize-none" rows={2} placeholder="¿Qué tan cerca necesita estar de sus puntos clave?" />
            </div>
          </div>

          <div>
            <label className="form-label mb-3 font-bold">Requisitos Indispensables</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {["Seguridad 24/7", "Parqueos", "Ascensor", "Piscina/Áreas Sociales", "Pet Friendly", "Planta Eléctrica"].map(item => (
                <label key={item} className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600" />
                  <span className="text-sm text-gray-600 dark:text-zinc-400">{item}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </Accordion>

      {/* BLOQUE 3: Diagnóstico Financiero */}
      <Accordion 
        title="Bloque 3: Diagnóstico Financiero" 
        icon={<Wallet className="w-5 h-5" />}
        isOpen={openSections.finance}
        onToggle={() => toggleSection("finance")}
      >
        <div className="space-y-8">
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/40 p-4 rounded-lg flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div className="text-sm">
              <span className="font-bold text-amber-800 dark:text-amber-400">⚠️ AVISO ASESOR:</span>
              <p className="text-amber-700 dark:text-amber-500">Validar ingresos cruzando tabla referencial de banco vs. cuota/ingresos para asegurar factibilidad.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="form-label mb-1">Rango de presupuesto (USD)</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-400">$</span>
                <input type="number" className="form-input pl-7" placeholder="Ej. 150000" />
              </div>
            </div>
            <div>
              <label className="form-label mb-1">Cuota mensual ideal (USD)</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-400">$</span>
                <input type="number" className="form-input pl-7" placeholder="Ej. 1200" />
              </div>
            </div>
            <div>
              <label className="form-label mb-1">Forma de compra</label>
              <select className="form-input">
                <option value="">Seleccionar...</option>
                <option value="contado">Contado</option>
                <option value="credito">Crédito Hipotecario</option>
                <option value="mixto">Mixto</option>
              </select>
            </div>
            <div>
              <label className="form-label mb-1">Institución Financiera</label>
              <select className="form-input">
                <option value="">Seleccionar...</option>
                <option value="bancos">Bancos Privados</option>
                <option value="biess">BIESS</option>
                <option value="cooperativas">Cooperativas</option>
              </select>
            </div>
            <div>
              <label className="form-label mb-1">Disponibilidad de entrada</label>
              <select className="form-input">
                <option value="">Seleccionar...</option>
                <option value="lista">Lista / Inmediata</option>
                <option value="necesita_plazo">Necesita plazo</option>
              </select>
            </div>
            <div>
              <label className="form-label mb-1 font-bold italic text-blue-600">¿Está precalificado?</label>
              <div className="flex gap-4 mt-2">
                {["Sí", "No"].map(opt => (
                  <label key={opt} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="precalificado" className="w-4 h-4 text-blue-600 focus:ring-blue-600 border-gray-300" />
                    <span className="text-sm font-medium dark:text-zinc-300">{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 dark:border-zinc-800">
            <h4 className="text-sm font-bold text-gray-700 dark:text-zinc-300 mb-4">Validación de Estado</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4">
              {[
                "¿Necesita vender casa actual?",
                "¿Depende de pólizas o fondos de reserva?",
                "¿Está saliendo de deudas actualmente?"
              ].map(q => (
                <div key={q} className="flex items-center justify-between pr-8">
                  <span className="text-sm text-gray-600 dark:text-zinc-400">{q}</span>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input type="radio" name={q} className="w-3.5 h-3.5" /> <span className="text-xs">Sí</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input type="radio" name={q} className="w-3.5 h-3.5" /> <span className="text-xs">No</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Accordion>

      {/* BLOQUE 4: Timing, Urgencia y Cierre */}
      <Accordion 
        title="Bloque 4: Timing, Urgencia y Cierre" 
        icon={<Clock className="w-5 h-5" />}
        isOpen={openSections.timing}
        onToggle={() => toggleSection("timing")}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-2">
            <label className="form-label mb-1">¿Algo lo frena a tomar una decisión hoy?</label>
            <input type="text" className="form-input" placeholder="Ej. Esperando aprobación, Falta vender activo..." />
          </div>
          <div className="col-span-2">
            <label className="form-label mb-1">Información específica que desea recibir</label>
            <textarea className="form-input resize-none" rows={2} placeholder="Ficha técnica, planos, tabla de pagos..." />
          </div>
          <div>
            <label className="form-label mb-1">Fecha estimada de mudanza</label>
            <input type="date" className="form-input" />
          </div>
          <div>
            <label className="form-label mb-1">Fecha para reconfirmar visita/llamada</label>
            <input type="date" className="form-input text-blue-600 font-bold" />
          </div>
          <div>
            <label className="form-label mb-1">¿Agendar visita mañana?</label>
            <select className="form-input font-bold border-blue-600">
              <option value="">Seleccionar...</option>
              <option value="si">Confirmar Mañana</option>
              <option value="proximo">Próximos días</option>
              <option value="no">Aún no</option>
            </select>
          </div>
        </div>
      </Accordion>

      {/* BLOQUE EXTRA: Automatizaciones */}
      <div className="mt-8 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <AlertCircle className="w-24 h-24 text-red-500" />
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-600/20 rounded-xl flex items-center justify-center border border-red-500/30">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-xl font-black text-white uppercase tracking-tighter italic">Flujo Apocalipsis Zombie</h3>
            </div>
            <p className="text-zinc-400 text-sm max-w-md">Estrategia de goteo (Drip) agresiva para leads en Seguimiento Abierto que han dejado de responder.</p>
          </div>

          <div className="flex flex-col items-end gap-3">
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" value="" className="sr-only peer" />
              <div className="w-14 h-7 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-600"></div>
              <span className="ms-3 text-sm font-bold text-zinc-300 uppercase">Activar Automatización</span>
            </label>
          </div>
        </div>

        <div className="mt-8 relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-zinc-800"></div>
          <div className="flex justify-between relative z-10">
            {[
              { label: "Mes 1", text: "Mensaje de Rescate", icon: <MessageSquare className="w-4 h-4" /> },
              { label: "Mes 3", text: "Oferta Last Call", icon: <Clock className="w-4 h-4" /> },
              { label: "Mes 6", text: "Descarte Final", icon: <AlertCircle className="w-4 h-4" /> }
            ].map((step, i) => (
              <div key={i} className="flex flex-col items-center gap-3 bg-zinc-900 px-4">
                <div className="w-10 h-10 rounded-full bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center text-zinc-400 group-hover:border-red-500/50 transition-colors">
                  {step.icon}
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-black text-zinc-500 uppercase">{step.label}</p>
                  <p className="text-xs font-bold text-zinc-300">{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-10 flex justify-center sticky bottom-8">
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-4 rounded-full font-bold shadow-xl flex items-center gap-2 transform active:scale-95 transition-all">
          <Save className="w-5 h-5" />
          Guardar Perfil del Lead
        </button>
      </div>
    </div>
  );
}
