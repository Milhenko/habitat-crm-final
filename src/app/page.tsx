import Header from "@/components/Header";
import PropertyForm from "@/components/PropertyForm";

export default function Home() {
  return (
    <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-zinc-950">
      <div className="max-w-[1600px] mx-auto">
        <Header />
        <PropertyForm />
      </div>
    </main>
  );
}
