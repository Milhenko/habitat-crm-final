"use client";

import React from "react";
import { 
  TrendingDown, 
  HelpCircle, 
  AlertCircle
} from "lucide-react";

const LOST_REASONS = [
  { label: "Compró con la competencia", value: 35, color: "bg-blue-600" },
  { label: "Migración / Mudanza", value: 25, color: "bg-purple-600" },
  { label: "Finanzas / Crédito", value: 20, color: "bg-green-600" },
  { label: "No contesta", value: 12, color: "bg-orange-600" },
  { label: "Otros", value: 8, color: "bg-gray-400" }
];

export default function LostDealChart() {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm flex flex-col h-[500px]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-lg font-black text-gray-900 dark:text-zinc-100 uppercase tracking-tighter">Motivos de Pérdida</h3>
          <p className="text-xs text-gray-500">Análisis de leads descartados en el embudo.</p>
        </div>
        <button className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl">
          <HelpCircle className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-center space-y-8">
        {/* Visual representation of a bar chart with percentages */}
        <div className="space-y-6">
          {LOST_REASONS.map((reason, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-gray-600 dark:text-zinc-400 uppercase tracking-widest">{reason.label}</span>
                <span className="text-xs font-black text-gray-900 dark:text-zinc-100">{reason.value}%</span>
              </div>
              <div className="h-2 w-full bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${reason.color} rounded-full transition-all duration-1000 ease-out delay-[${idx * 100}ms]`}
                  style={{ width: `${reason.value}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-5 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800/50 flex items-start gap-3">
           <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
           <div>
             <p className="text-xs font-bold text-blue-900 dark:text-blue-100">Insight Comercial:</p>
             <p className="text-[11px] text-blue-800/70 dark:text-blue-200/50 leading-relaxed italic">
               "El 35% de las pérdidas se debe a la oferta de la competencia. Se recomienda revisar el script de diferenciación en la Fase D."
             </p>
           </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-center gap-4">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-blue-600"></div>
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Q1 2026</span>
        </div>
        <div className="flex items-center gap-1.5 border-l border-gray-200 dark:border-zinc-800 pl-4">
           <TrendingDown className="w-3 h-3 text-red-500" />
           <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Pérdida Total: 12%</span>
        </div>
      </div>
    </div>
  );
}
