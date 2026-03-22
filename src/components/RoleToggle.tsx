"use client";

import { Role, useAuth } from "@/context/AuthContext";

export default function RoleToggle() {
  const { user, setRole } = useAuth();

  const roles: Role[] = ["Super Administrador", "Administrador de Marketing", "Asesor"];

  return (
    <div className="bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 p-4 mb-6 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold shrink-0">
            {user.initials}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-zinc-100 leading-none">
              {user.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
              Usuario: <span className="font-semibold">{user.role}</span>
            </p>
          </div>
        </div>

        <div className="flex bg-gray-100 dark:bg-zinc-800 p-1 rounded-lg">
          {roles.map((role) => (
            <button
              key={role}
              onClick={() => setRole(role)}
              className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${
                user.role === role
                  ? "bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200"
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
