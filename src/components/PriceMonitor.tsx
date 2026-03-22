"use client";

import React from "react";
import { 
  Building2, 
  ArrowDown, 
  TrendingDown, 
  User, 
  Calendar,
  MoreVertical
} from "lucide-react";

const PROPERTIES = [
  {
    id: "DP-PSA-0002-JM",
    type: "Departamento",
    initialPrice: 185000,
    currentPrice: 168000,
    advisor: "Juan Pérez",
    lastChange: "12 Mar 2026",
    status: "Baja Critica"
  },
  {
    id: "CS-SAM-0015-LA",
    type: "Casa",
    initialPrice: 420000,
    currentPrice: 395000,
    advisor: "Lucía Argeñal",
    lastChange: "18 Mar 2026",
    status: "Re-negociación"
  },
  {
    id: "LC-CNR-0008-RS",
    type: "Local Comercial",
    initialPrice: 95000,
    currentPrice: 89000,
    advisor: "Roberto Soto",
    lastChange: "05 Mar 2026",
    status: "Oportunidad"
  },
  {
    id: "TR-VIA-0022-CM",
    type: "Terreno",
    initialPrice: 120000,
    currentPrice: 110000,
    advisor: "Carlos Méndez",
    lastChange: "15 Mar 2026",
    status: "Baja Leve"
  }
];

export default function PriceMonitor() {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm overflow-hidden flex flex-col h-[500px]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-lg font-black text-gray-900 dark:text-zinc-100 uppercase tracking-tighter">Monitor de Precios</h3>
          <p className="text-xs text-gray-500">Comparativa de variaciones y caídas de precios.</p>
        </div>
        <div className="flex gap-2">
           <span className="text-[10px] bg-red-100 text-red-600 px-2 py-1 rounded-md font-bold uppercase tracking-wider animate-pulse">Alertas Activas: 4</span>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto no-scrollbar">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-zinc-800/50 rounded-xl">
            <tr>
              <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest rounded-l-xl">Propiedad</th>
              <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Precio Inicial</th>
              <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Precio Actual</th>
              <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Drop (%)</th>
              <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest rounded-r-xl text-center">Gestión</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-zinc-800/50">
            {PROPERTIES.map((prop) => {
              const dropAmount = prop.initialPrice - prop.currentPrice;
              const dropPercent = ((dropAmount / prop.initialPrice) * 100).toFixed(1);
              
              return (
                <tr key={prop.id} className="group hover:bg-gray-50 dark:hover:bg-zinc-800/30 transition-colors">
                  <td className="px-4 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gray-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center text-gray-400 group-hover:text-blue-500 transition-colors">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-900 dark:text-zinc-100 tracking-tight">{prop.id}</p>
                        <p className="text-[10px] text-gray-400 uppercase">{prop.type}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-5 text-xs font-bold text-gray-600 dark:text-zinc-400 line-through decoration-red-400/50 decoration-2">
                    ${prop.initialPrice.toLocaleString()}
                  </td>
                  <td className="px-4 py-5 font-black text-sm text-gray-900 dark:text-zinc-100">
                    ${prop.currentPrice.toLocaleString()}
                  </td>
                  <td className="px-4 py-5">
                    <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                      <TrendingDown className="w-3.5 h-3.5" />
                      <span className="text-xs font-black">{dropPercent}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-5">
                    <div className="flex items-center justify-center gap-2">
                      <div className="flex -space-x-2">
                        <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-zinc-800 border-2 border-white dark:border-zinc-900 flex items-center justify-center">
                          <User className="w-3 h-3 text-gray-400" />
                        </div>
                      </div>
                      <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-auto p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-2xl border border-gray-100 dark:border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Corte: 19 Mar 2026</span>
        </div>
        <button className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-white text-[10px] font-black rounded-xl hover:bg-black transition-all uppercase tracking-widest">
           Exportar Reporte
        </button>
      </div>
    </div>
  );
}
