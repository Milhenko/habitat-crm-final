"use client";

import React from "react";
import { 
  Zap, 
  TrendingUp, 
  Calendar, 
  FastForward, 
  MousePointer2, 
  Target, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";

export default function KPIStats() {
  const kpis = [
    { 
      label: "Speed to Lead", 
      value: "4.2 min", 
      sub: "Promedio inicial", 
      icon: <Zap className="w-5 h-5 text-yellow-500" />,
      trend: "up",
      trendValue: "-12%"
    },
    { 
      label: "Tasa de Conversión", 
      value: "18.5%", 
      sub: "Lead a Visita", 
      icon: <TrendingUp className="w-5 h-5 text-green-500" />,
      trend: "up",
      trendValue: "+2.4%"
    },
    { 
      label: "Meetings Booked", 
      value: "42", 
      sub: "Visitas agendadas", 
      icon: <Calendar className="w-5 h-5 text-blue-500" />,
      trend: "up",
      trendValue: "+8"
    },
    { 
      label: "Velocidad Pipeline", 
      value: "22 días", 
      sub: "Ciclo de cierre", 
      icon: <FastForward className="w-5 h-5 text-purple-500" />,
      trend: "down",
      trendValue: "+1 día"
    },
    { 
      label: "Tasa Interacción", 
      value: "64%", 
      sub: "Llamadas/WhatsApp", 
      icon: <MousePointer2 className="w-5 h-5 text-orange-500" />,
      trend: "up",
      trendValue: "+5%"
    },
    { 
      label: "CPL Calificado", 
      value: "$14.50", 
      sub: "Inversión mkt", 
      icon: <Target className="w-5 h-5 text-red-500" />,
      trend: "down",
      trendValue: "-$2.10"
    },
    { 
      label: "Previsión Ingresos", 
      value: "$1.2M", 
      sub: "Fase de cierre", 
      icon: <DollarSign className="w-5 h-5 text-emerald-500" />,
      trend: "up",
      trendValue: "+15%"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
      {kpis.map((kpi, idx) => (
        <div key={idx} className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
             {kpi.icon}
          </div>
          
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-zinc-800 flex items-center justify-center">
              {React.cloneElement(kpi.icon as React.ReactElement, { className: "w-4 h-4" })}
            </div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{kpi.label}</span>
          </div>
          
          <div className="flex items-end justify-between">
            <div>
              <p className="text-2xl font-black text-gray-900 dark:text-zinc-100 tracking-tighter">{kpi.value}</p>
              <p className="text-[10px] text-gray-500 font-medium">{kpi.sub}</p>
            </div>
            
            <div className={`flex items-center gap-0.5 px-2 py-1 rounded-md text-[10px] font-bold ${
              kpi.trend === "up" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
            }`}>
              {kpi.trend === "up" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {kpi.trendValue}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
