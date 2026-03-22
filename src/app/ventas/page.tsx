import Header from "@/components/Header";
import KanbanBoard from "@/components/KanbanBoard";

export default function VentasPage() {
  return (
    <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-zinc-950">
      <div className="max-w-[1600px] mx-auto">
        <Header />
        
        <header className="mb-8">
          <h1 className="text-3xl font-light tracking-tight text-gray-900 dark:text-zinc-100">
            Pipeline de Ventas
          </h1>
          <p className="text-gray-500 dark:text-zinc-400">Gestiona tus prospectos y cierres en el flujo comercial de CRM Habitat.</p>
        </header>

        <KanbanBoard />
      </div>
    </main>
  );
}
