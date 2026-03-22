import RoleToggle from "@/components/RoleToggle";
import PropertyForm from "@/components/PropertyForm";

export default function CaptacionPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-zinc-950">
      <RoleToggle />
      <div className="pt-4">
        <PropertyForm />
      </div>
    </main>
  );
}
