"use client";

import React from "react";
import { 
  MessageSquare, 
  Image as ImageIcon, 
  User, 
  TrendingUp, 
  Clock,
  MoreHorizontal
} from "lucide-react";

const ACTIVITIES = [
  {
    id: 1,
    user: "Carlos Argeñal",
    action: "añadió una nota comercial",
    target: "Lead: Juan Pérez",
    content: "El cliente solicita financiamiento directo. Pendiente revisar pre-aprobación bancaria.",
    time: "Hace 10 min",
    type: "note"
  },
  {
    id: 2,
    user: "Marketing Dept",
    action: "subió una captura de pantalla",
    target: "Lead: María García",
    content: "Evidencia de 'visto' en WhatsApp. Proceder con el Flujo Apocalipsis Zombie.",
    time: "Hace 24 min",
    type: "image",
    image: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400&auto=format&fit=crop&q=60" 
  },
  {
    id: 3,
    user: "Sistema",
    action: "actualizó el precio",
    target: "Propiedad: DP-PSA-0002",
    content: "Baja de precio detectada: $145k -> $138k. Notificando a leads interesados.",
    time: "Hace 1 hora",
    type: "price"
  },
  {
    id: 4,
    user: "Lucía Méndez",
    action: "agendó una visita",
    target: "Lead: Roberto Soto",
    content: "Cita programada para el Sábado 10:00 AM en Puerto Santa Ana.",
    time: "Hace 3 horas",
    type: "event"
  }
];

export default function LiveActivityLog() {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm flex flex-col h-[500px]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-lg font-black text-gray-900 dark:text-zinc-100 uppercase tracking-tighter">Bitácora de Notas (En Vivo)</h3>
          <p className="text-xs text-gray-500">Últimas interacciones comerciales y de marketing.</p>
        </div>
        <button className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 no-scrollbar space-y-8 relative">
        <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-gray-100 dark:bg-zinc-800"></div>
        
        {ACTIVITIES.map((activity) => (
          <div key={activity.id} className="relative pl-12 group">
            <div className="absolute left-0 top-0 w-10 h-10 rounded-full border-4 border-white dark:border-zinc-900 bg-gray-50 dark:bg-zinc-800 flex items-center justify-center z-10 transition-transform group-hover:scale-110">
              {activity.type === "note" && <MessageSquare className="w-4 h-4 text-blue-500" />}
              {activity.type === "image" && <ImageIcon className="w-4 h-4 text-purple-500" />}
              {activity.type === "price" && <TrendingUp className="w-4 h-4 text-green-500" />}
              {activity.type === "event" && <Clock className="w-4 h-4 text-orange-500" />}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-gray-900 dark:text-zinc-100">
                  {activity.user} <span className="font-medium text-gray-400">{activity.action}</span> en {activity.target}
                </p>
                <span className="text-[10px] font-medium text-gray-400">{activity.time}</span>
              </div>
              
              <div className="p-3 bg-gray-50 dark:bg-zinc-800/50 rounded-2xl border border-gray-100 dark:border-zinc-800/50">
                <p className="text-xs text-gray-600 dark:text-zinc-400 leading-relaxed italic">
                  "{activity.content}"
                </p>
                
                {activity.image && (
                  <div className="mt-3 relative aspect-video rounded-xl overflow-hidden border border-gray-200 dark:border-zinc-700">
                    <img 
                      src={activity.image} 
                      alt="Screenshot" 
                      className="object-cover w-full h-full grayscale hover:grayscale-0 transition-all duration-500"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-zinc-800 text-center">
        <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">Ver Historial Completo</button>
      </div>
    </div>
  );
}
