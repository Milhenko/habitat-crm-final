import Header from "@/components/Header";
import PropertyForm from "@/components/PropertyForm";

export default function Home() {
  return (
    /* Eliminamos bg-gray-50 y bg-zinc-950 para que brille el degradado que pusimos en globals.css */
    <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 text-rich-black">
      <div className="max-w-[1600px] mx-auto">
        <Header />
        <PropertyForm />
      </div>
    </main>
  );
}