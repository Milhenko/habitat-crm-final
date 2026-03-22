"use client";

import React from "react";
import Header from "@/components/Header";
import KPIStats from "@/components/KPIStats";
import LiveActivityLog from "@/components/LiveActivityLog";
import PriceMonitor from "@/components/PriceMonitor";
import LostDealChart from "@/components/LostDealChart";
import { 
  Plus, 
  Filter, 
  Download, 
  LayoutDashboard 
} from "lucide-react";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-zinc-950">
      <Header />
      
      <div className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Sub Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-200 dark:border-zinc-800/50">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 bg-blue-600 rounded-lg text-white">
                <LayoutDashboard className="w-5 h-5" />
              </div>
              <h1 className="text-3xl font-black text-gray-900 dark:text-zinc-100 tracking-tighter uppercase">Panel de Control</h1>
            </div>
            <p className="text-sm text-gray-500 font-medium tracking-tight">Analytics avanzado y KPIs en tiempo real para CRM Habitat.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
             <button className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-600 dark:text-zinc-300 font-bold text-xs hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm">
               <Filter className="w-4 h-4" /> Filtros
             </button>
             <button className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-600 dark:text-zinc-300 font-bold text-xs hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm">
               <Download className="w-4 h-4" /> Reporte PDF
             </button>
             <button className="px-6 py-2.5 bg-zinc-900 hover:bg-black text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 uppercase tracking-widest">
               <Plus className="w-4 h-4" /> Nueva Captación
             </button>
          </div>
        </div>

        {/* Section 1: KPI Scorecard */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Resumen de Operaciones</h2>
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 italic">Actualizado: Ahora</span>
          </div>
          <KPIStats />
        </div>

        {/* Section 2: Charts and Logs */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-1">
             <LiveActivityLog />
          </div>
          <div className="xl:col-span-1">
             <PriceMonitor />
          </div>
          <div className="xl:col-span-1">
             <LostDealChart />
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl shadow-blue-500/20">
           <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
             <div className="space-y-2">
               <h3 className="text-2xl font-black tracking-tighter uppercase italic">CRM Habitat v4.0 PRO</h3>
               <p className="max-w-xl text-blue-100 text-sm font-medium leading-relaxed">
                 Estás utilizando la versión avanzada de monitoreo. Todas las métricas de conversión y velocidad de pipeline se actualizan automáticamente cada 5 minutos basandose en el flujo de ventas.
               </p>
             </div>
             <button className="px-8 py-4 bg-white text-blue-700 font-black rounded-2xl shadow-xl hover:scale-105 transition-all text-xs uppercase tracking-[0.1em]">
               Configurar Alertas SMS
             </button>
           </div>
           
           {/* Decorative Elements */}
           <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/10 rounded-full blur-[100px]"></div>
           <div className="absolute -left-20 -bottom-20 w-60 h-60 bg-indigo-400/20 rounded-full blur-[80px]"></div>
        </div>
      </div>
    </main>
  );
}
