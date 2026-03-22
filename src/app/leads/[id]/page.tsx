import Header from "@/components/Header";
import LeadProfileForm from "@/components/LeadProfileForm";
import { ChevronLeft, User, MessageSquare, Phone, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function LeadPage({ params }: { params: { id: string } }) {
  // In a real app, fetch lead data by ID
  const leadName = "Juan Pérez"; // Placeholder
  const leadPhone = "0991234567";

  return (
    <main className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-zinc-950">
      <div className="max-w-7xl mx-auto">
        <Header />

        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <Link 
              href="/ventas" 
              className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Volver al Pipeline
            </Link>
            <div className="flex items-center gap-4">
               <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg">
                <User className="w-8 h-8" />
               </div>
               <div>
                 <h1 className="text-3xl font-bold text-gray-900 dark:text-zinc-100 tracking-tight">{leadName}</h1>
                 <div className="flex items-center gap-4 mt-1">
                   <div className="flex items-center gap-4">
                     <span className="text-gray-500 dark:text-zinc-400 flex items-center gap-1 text-sm">
                      <Phone className="w-3.5 h-3.5" /> {leadPhone}
                     </span>
                     <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Seguimiento Abierto
                     </span>
                     <span className="flex items-center gap-1 text-[10px] font-black bg-red-100 text-red-700 px-2 py-0.5 rounded-md animate-pulse">
                      <AlertTriangle className="w-3 h-3" /> POLÍTICA DE GUILLOTINA: 45 DÍAS INACTIVOS
                    </span>
                   </div>
                 </div>
               </div>
            </div>
          </div>

          <div className="flex gap-3">
             <button className="px-6 py-2.5 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-600 dark:text-zinc-300 font-bold text-sm hover:bg-gray-50 transition-all flex items-center gap-2">
               <MessageSquare className="w-4 h-4" /> Enviar WhatsApp
             </button>
             <button className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-lg shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2">
               Guardar Cambios
             </button>
          </div>
        </div>

        <LeadProfileForm />
      </div>
    </main>
  );
}
