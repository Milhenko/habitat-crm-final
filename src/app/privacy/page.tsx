export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#EBEAE6] py-12 px-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm p-8 md:p-12">
        <h1 className="text-3xl font-black text-[#1E2D40] mb-8">Política de Privacidad</h1>
        
        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-bold text-[#1E2D40] mb-3">Información que recopilamos</h2>
            <p>Habitat Realty Group recopila información personal que usted proporciona voluntariamente cuando se comunica con nosotros a través de formularios de contacto, incluyendo: nombre, correo electrónico, número de teléfono, y preferencias inmobiliarias.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1E2D40] mb-3">Uso de la información</h2>
            <p>Utilizamos su información para:</p>
            <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
              <li>Responder a sus consultas sobre propiedades inmobiliarias</li>
              <li>Enviarle información relevante sobre inmuebles que coincidan con sus preferencias</li>
              <li>Mejorar nuestros servicios</li>
              <li>Cumplir con obligaciones legales</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1E2D40] mb-3">Protección de datos</h2>
            <p>Implementamos medidas de seguridad técnicas y organizativas apropiadas para proteger su información personal contra acceso no autorizado, alteración, divulgación o destrucción.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1E2D40] mb-3">Sus derechos</h2>
            <p>Usted tiene derecho a acceder, corregir o eliminar su información personal en cualquier momento. Para ejercer estos derechos, contáctenos a través de los medios proporcionados en nuestro sitio web.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1E2D40] mb-3">Contacto</h2>
            <p>Para preguntas sobre esta política de privacidad, contáctenos:</p>
            <p className="mt-2">Email: info@habitatrealtygroup.com</p>
            <p>Teléfono: +593 98 863 3307</p>
          </section>

          <p className="text-sm text-gray-500 mt-8">Última actualización: Abril 2026</p>
        </div>
      </div>
    </div>
  )
}
