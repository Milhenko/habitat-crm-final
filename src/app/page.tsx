// src/app/page.tsx

import React from 'react';

export default function Dashboard() {
  return (
    // 2. GLOBAL BACKGROUND GRADIENT
    <div className="min-h-screen bg-gradient-to-b from-navy-sophisticate to-warm-bone font-sans">

      {/* NAVEGACIÓN SUPERIOR (Navy Sophisticate) */}
      <nav className="bg-navy-sophisticate text-absolute-white p-4 shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-2xl font-bold tracking-wider">HABITAT CRM</div>
          <div className="space-x-4">
            <button className="hover:text-warm-bone transition-colors">Dashboard</button>
            <button className="hover:text-warm-bone transition-colors">Propiedades</button>
            <button className="hover:text-warm-bone transition-colors">Clientes</button>
          </div>
        </div>
      </nav>

      {/* CONTENIDO PRINCIPAL */}
      <main className="p-6">

        {/* 3. SECTION CONTAINERS (Tarjetas de Estadísticas) */}
        <div className="bg-absolute-white rounded-2xl shadow-2xl overflow-hidden mx-auto max-w-7xl my-8 p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 border border-warm-bone rounded-xl text-center">
            <h3 className="text-rich-black text-lg font-semibold mb-2">Nuevos Leads</h3>
            <p className="text-navy-sophisticate text-4xl font-black">24</p>
          </div>
          <div className="p-4 border border-warm-bone rounded-xl text-center">
            <h3 className="text-rich-black text-lg font-semibold mb-2">Visitas Agendadas</h3>
            <p className="text-navy-sophisticate text-4xl font-black">12</p>
          </div>
          <div className="p-4 border border-warm-bone rounded-xl text-center">
            <h3 className="text-rich-black text-lg font-semibold mb-2">Propiedades Activas</h3>
            <p className="text-navy-sophisticate text-4xl font-black">8</p>
          </div>
        </div>

        {/* 3. SECTION CONTAINERS (Área de Trabajo / Tablero) */}
        <div className="bg-absolute-white rounded-2xl shadow-2xl overflow-hidden mx-auto max-w-7xl my-8 p-6">

          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-rich-black">Gestión de Clientes Recientes</h2>
            {/* 4. BUTTONS */}
            <button className="bg-navy-sophisticate text-absolute-white px-6 py-2 rounded-lg font-semibold hover:bg-opacity-90 transition-all shadow-md">
              + Nuevo Cliente
            </button>
          </div>

          {/* Tabla de Ejemplo (Texto en Rich Black) */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-warm-bone text-rich-black">
                  <th className="p-4 font-semibold">Nombre</th>
                  <th className="p-4 font-semibold">Estado</th>
                  <th className="p-4 font-semibold">Propiedad de Interés</th>
                  <th className="p-4 font-semibold">Último Contacto</th>
                </tr>
              </thead>
              <tbody className="text-rich-black">
                <tr className="border-b border-warm-bone hover:bg-warm-bone/20 transition-colors">
                  <td className="p-4 font-medium">Carlos Mendoza</td>
                  <td className="p-4"><span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-bold">Contactado</span></td>
                  <td className="p-4">Villa del Sol - 3 Hab</td>
                  <td className="p-4">Hoy, 10:30 AM</td>
                </tr>
                <tr className="border-b border-warm-bone hover:bg-warm-bone/20 transition-colors">
                  <td className="p-4 font-medium">Ana Patricia Ruiz</td>
                  <td className="p-4"><span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-bold">Nuevo Lead</span></td>
                  <td className="p-4">Departamento Centro</td>
                  <td className="p-4">Ayer</td>
                </tr>
                <tr className="hover:bg-warm-bone/20 transition-colors">
                  <td className="p-4 font-medium">Familia Torres</td>
                  <td className="p-4"><span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-bold">Visita Agendada</span></td>
                  <td className="p-4">Casa Norte - Piscina</td>
                  <td className="p-4">Hace 2 días</td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>
      </main>
    </div>
  );
}