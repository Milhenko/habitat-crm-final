'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import GlobalHeader from '@/components/GlobalHeader'

type EstadoMarketing = 'grabado' | 'editado' | 'publicado' | null

interface Property {
  id: string
  code: string | null
  type: string | null
  zone: string | null
  address: string | null
  price_initial: number | null
  estado_marketing: EstadoMarketing
  grabado: boolean | null
  editado: boolean | null
  publicado: boolean | null
  notas_marketing: string | null
  asesor_id: string | null
  asesor_nombre: string | null
  asesor_iniciales: string | null
  metros_terreno: number | null
  metros_construccion: number | null
  metros_parqueo: number | null
  dormitorios: number | null
  banos_completos: number | null
  medio_bano: number | null
  parqueos: number | null
  piscina_propia: boolean | null
  gimnasio_propio: boolean | null
  bbq_propio: boolean | null
  terraza: boolean | null
  balcon: boolean | null
  jacuzzi: boolean | null
  cuarto_servicio: boolean | null
  bano_servicio: boolean | null
  lavanderia: boolean | null
  cocina_equipada: boolean | null
  piscina_urb: boolean | null
  gimnasio_urb: boolean | null
  bbq_urb: boolean | null
  salon_eventos: boolean | null
  cancha_tenis: boolean | null
  juegos_infantiles: boolean | null
  area_comunal: boolean | null
  seguridad_24h: boolean | null
  amoblado: boolean | null
  exclusividad: boolean | null
  comision: number | null
  validez_contrato: number | null
  tipo_operacion: string | null
  propietario_nombre: string | null
  propietario_ci: string | null
  propietario_celular: string | null
  propietario_email: string | null
  alicuota: number | null
  entrega_llaves: boolean | null
  observaciones: string | null
  fotos: string[] | null
  fotos_nombres: string[] | null
  planos: string[] | null
  slug: string | null
  reserva: number | null
  promesa_porcentaje: number | null
  promesa_valor: number | null
  financiamiento_porcentaje: number | null
  financiamiento_valor: number | null
  financiamiento_meses: number | null
  compraventa_porcentaje: number | null
  compraventa_valor: number | null
}

type FormData = Omit<Property, 'id'>

const EMPTY_FORM: FormData = {
  code: '', type: '', zone: '', address: '', price_initial: null,
  estado_marketing: null, grabado: false, editado: false, publicado: false,
  notas_marketing: '', asesor_id: null, asesor_nombre: '', asesor_iniciales: '',
  metros_terreno: null, metros_construccion: null, metros_parqueo: null,
  dormitorios: null, banos_completos: null, medio_bano: null, parqueos: null,
  piscina_propia: false, gimnasio_propio: false, bbq_propio: false,
  terraza: false, balcon: false, jacuzzi: false, cuarto_servicio: false,
  bano_servicio: false, lavanderia: false, cocina_equipada: false,
  piscina_urb: false, gimnasio_urb: false, bbq_urb: false,
  salon_eventos: false, cancha_tenis: false, juegos_infantiles: false,
  area_comunal: false, seguridad_24h: false,
  amoblado: false, exclusividad: false,
  comision: null, validez_contrato: null, tipo_operacion: '',
  propietario_nombre: '', propietario_ci: '', propietario_celular: '',
  propietario_email: '', alicuota: null, entrega_llaves: false,
  observaciones: '', fotos: null, fotos_nombres: null, planos: null,
  slug: '',
  reserva: null, promesa_porcentaje: null, promesa_valor: null,
  financiamiento_porcentaje: null, financiamiento_valor: null,
  financiamiento_meses: null, compraventa_porcentaje: null, compraventa_valor: null,
}

const TIPOS = ['Casa/Villa', 'Departamento', 'Local Comercial', 'Oficina', 'Suite', 'Bodega', 'Terreno', 'Otro']

const ZONAS = {
  'Samborondón': {
    'La Puntilla (Km 0-10)': ['Entreríos', 'Riberas del Batán', 'Isla Mocolí', 'Lagos de Batán', 'Las Brisas', 'Tenis Club', 'Plaza Lagos', 'Tornero'],
    'Nuevo Samborondón (Km 10+)': ['Ciudad Celeste', 'El Cortijo', 'Buijo Histórico', 'Santa Mónica']
  },
  'Daule': {
    'La Aurora / Vía a Salitre': ['Villa Club', 'La Joya', 'Villa del Rey', 'La Rioja', 'Casa Laguna', 'Matices', 'Milán']
  },
  'Guayaquil': {
    'Vía a la Costa': ['Puerto Azul', 'Bosques de la Costa', 'Terranostra', 'Vía del Sol', 'Belo Horizonte', 'Costaalmar', 'Arcadia', 'Valle Alto', 'Los Ángeles', 'Chongón'],
    'Norte': ['Urdesa', 'Kennedy', 'Miraflores', 'Alborada', 'Samanes', 'Guayacanes', 'Mucho Lote'],
    'Ceibos y Vía a Daule': ['Los Ceibos', 'Colinas de los Ceibos', 'Lomas de Urdesa', 'Mapasingue'],
    'Puerto Santa Ana': ['Bellini', 'Santana Lofts', 'The Point', 'Emporium'],
    'Centro / Sur': ['Barrio del Centenario', 'Puerto Marítimo', 'Centro Histórico']
  }
}
const ESTADOS_MARKETING = [
  { value: null, label: 'Sin estado', bg: 'bg-gray-100', text: 'text-gray-600' },
  { value: 'grabado', label: 'Grabado', bg: 'bg-amber-100', text: 'text-amber-700' },
  { value: 'editado', label: 'Editado', bg: 'bg-blue-100', text: 'text-blue-700' },
  { value: 'publicado', label: 'Publicado', bg: 'bg-green-100', text: 'text-green-700' },
]
const STEPS = ['Inmueble', 'Económico', 'Características', 'Propietario', 'Marketing', 'Fotos']
const ASESORES = [
  { nombre: 'Milenko Surati', iniciales: 'MS' },
  { nombre: 'Gastón Calderón', iniciales: 'GC' },
  { nombre: 'Rafaela Velásquez', iniciales: 'RV' },
  { nombre: 'José Morán', iniciales: 'JM' },
  { nombre: 'Sebastián Jaramillo', iniciales: 'SJ' },
]
const FOTO_NOMBRES = ['Fachada', 'Sala', 'Cocina', 'Dormitorio principal', 'Dormitorio 2', 'Dormitorio 3', 'Baño principal', 'Terraza / Balcón', 'Área de servicio', 'Vista aérea', 'Piscina', 'Área comunal']
const PLANO_NOMBRES = ['Plano 1', 'Plano 2', 'Plano 3', 'Plano 4', 'Plano 5']
const CLOUDINARY_CLOUD = 'dl64kkfbp'
const CLOUDINARY_PRESET = 'habitat_properties'

function generarSlug(zone: string, type: string, address: string): string {
  return `${zone} ${type} ${address}`
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 50)
}

function EstadoBadge({ estado }: { estado: EstadoMarketing }) {
  const e = ESTADOS_MARKETING.find(x => x.value === estado) ?? ESTADOS_MARKETING[0]
  return <span className={`text-[10px] font-black px-2 py-1 rounded-full ${e.bg} ${e.text}`}>{e.label}</span>
}

function formatPrice(n: number | null) {
  if (!n) return '—'
  return '$' + n.toLocaleString('es-EC')
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-bold text-[#1A1A1A]/50 mb-1.5 uppercase tracking-wide">{children}</label>
}

function Input({ value, onChange, placeholder, type = 'text' }: {
  value: string | number; onChange: (v: string) => void; placeholder?: string; type?: string
}) {
  return (
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full px-3 py-2.5 bg-[#EBEAE6]/50 border border-[#1A1A1A]/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E2D40]/20 text-[#1A1A1A]" />
  )
}

function Select({ value, onChange, children }: {
  value: string | number; onChange: (v: string) => void; children: React.ReactNode
}) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      className="w-full px-3 py-2.5 bg-[#EBEAE6]/50 border border-[#1A1A1A]/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E2D40]/20 text-[#1A1A1A]">
      {children}
    </select>
  )
}

function CheckField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer text-sm text-[#1A1A1A]/70 py-1">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="w-4 h-4 accent-[#1E2D40] rounded" />
      {label}
    </label>
  )
}

export default function CaptacionPage() {
  const { user } = useAuth()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormData>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [step, setStep] = useState(0)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterEstado, setFilterEstado] = useState('all')
  const [filterAsesor, setFilterAsesor] = useState('')
  const [filterZona, setFilterZona] = useState('')
  const [filterOperacion, setFilterOperacion] = useState('')
  const [fotosSubidas, setFotosSubidas] = useState<{ nombre: string; url: string }[]>([])
  const [uploadingFoto, setUploadingFoto] = useState<string | null>(null)
  const [planosSubidos, setPlanosSubidos] = useState<{ nombre: string; url: string }[]>([])
  const [uploadingPlano, setUploadingPlano] = useState<string | null>(null)
  const [viewingProperty, setViewingProperty] = useState<Property | null>(null)

  async function fetchProperties() {
    setLoading(true); setError(null)
    const { data, error } = await supabase.from('properties').select('*').order('code', { ascending: true })
    if (error) setError(error.message)
    else setProperties(data as Property[])
    setLoading(false)
  }

  useEffect(() => { fetchProperties() }, [])

  useEffect(() => {
    if (user && !editingId) {
      const asesor = ASESORES.find(a => a.nombre.toLowerCase() === user.name?.toLowerCase())
      setForm(prev => ({
        ...prev,
        asesor_nombre: user.name || '',
        asesor_iniciales: asesor?.iniciales || user.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || '',
      }))
    }
  }, [user, showModal])

  useEffect(() => {
    if (!editingId && (form.zone || form.type || form.address)) {
      const slug = generarSlug(form.zone ?? '', form.type ?? '', form.address ?? '')
      setForm(prev => ({ ...prev, slug }))
    }
  }, [form.zone, form.type, form.address])

  const filtered = properties.filter(p => {
    if (filterType && p.type !== filterType) return false
    if (filterAsesor && p.asesor_nombre !== filterAsesor) return false
    if (filterZona && !(p.zone ?? '').toLowerCase().includes(filterZona.toLowerCase())) return false
    if (filterOperacion && p.tipo_operacion !== filterOperacion) return false
    if (filterEstado !== 'all' && (p.estado_marketing ?? 'null') !== (filterEstado === 'null' ? 'null' : filterEstado)) return false
    if (search) {
      const q = search.toLowerCase()
      return (p.code ?? '').toLowerCase().includes(q) || (p.address ?? '').toLowerCase().includes(q) || (p.asesor_nombre ?? '').toLowerCase().includes(q)
    }
    return true
  })

  function openCreate() {
    setEditingId(null)
    const asesor = ASESORES.find(a => a.nombre.toLowerCase() === user?.name?.toLowerCase())
    setForm({
      ...EMPTY_FORM,
      asesor_nombre: user?.name || '',
      asesor_iniciales: asesor?.iniciales || user?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || '',
    })
    setStep(0); setFormError(null); setFotosSubidas([]); setPlanosSubidos([]); setShowModal(true)
  }

  function openEdit(p: Property) {
    setEditingId(p.id)
    setForm({ ...p } as FormData)
    const urls = p.fotos ?? []
    const noms = p.fotos_nombres ?? []
    setFotosSubidas(urls.map((url, i) => ({ url, nombre: noms[i] ?? FOTO_NOMBRES[i] ?? `Foto ${i + 1}` })))
    const planoUrls = p.planos ?? []
    setPlanosSubidos(planoUrls.map((url, i) => ({ url, nombre: PLANO_NOMBRES[i] ?? `Plano ${i + 1}` })))
    setStep(0); setFormError(null); setShowModal(true)
  }

  const f = (key: keyof FormData, value: unknown) => setForm(prev => ({ ...prev, [key]: value }))

  async function handleSave() {
    const errores: string[] = []
    if (!form.address?.trim()) errores.push('Dirección')
    if (!form.type?.trim()) errores.push('Tipo de inmueble')
    if (!form.tipo_operacion?.trim()) errores.push('Tipo de operación')
    if (!form.price_initial) errores.push('Precio referencial')
    if (!form.propietario_nombre?.trim()) errores.push('Nombre del propietario')
    if (!form.propietario_celular?.trim()) errores.push('Celular del propietario')
    if (!form.asesor_nombre?.trim()) errores.push('Asesor responsable')
    if (!form.comision) errores.push('Comisión')
    if (errores.length > 0) { 
        setFormError(`Campos obligatorios: ${errores.join(', ')}`)
        return 
    }

    setSaving(true)
    setFormError(null)
    
    try {
        const { error } = editingId
            ? await supabase.from('properties').update(form).eq('id', editingId)
            : await supabase.from('properties').insert(form)
        
        if (error) {
            console.error('❌ Error al guardar:', error)
            setFormError(error.message)
        } else {
            console.log('✅ Propiedad guardada correctamente')
            setShowModal(false)
            fetchProperties()
        }
    } catch (err) {
        console.error('❌ Exception al guardar:', err)
        setFormError('Error inesperado al guardar')
    } finally {
        setSaving(false)
    }
}

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar esta captación?')) return
    await supabase.from('properties').delete().eq('id', id)
    fetchProperties()
  }

  async function handleFotoUpload(nombre: string, file: File) {
    setUploadingFoto(nombre)
    const data = new FormData()
    data.append('file', file)
    data.append('upload_preset', CLOUDINARY_PRESET)
    data.append('public_id', `habitat/${form.type || 'propiedad'}/${nombre.toLowerCase().replace(/ /g, '_')}_${Date.now()}`)
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`, { method: 'POST', body: data })
    const result = await res.json()
    if (result.secure_url) {
      const nuevas = fotosSubidas.filter(item => item.nombre !== nombre)
      const actualizadas = [...nuevas, { nombre, url: result.secure_url }]
      setFotosSubidas(actualizadas)
      f('fotos', actualizadas.map(item => item.url))
      f('fotos_nombres', actualizadas.map(item => item.nombre))
    }
    setUploadingFoto(null)
  }

  async function handlePlanoUpload(nombre: string, file: File) {
    setUploadingPlano(nombre)
    const data = new FormData()
    data.append('file', file)
    data.append('upload_preset', CLOUDINARY_PRESET)
    data.append('public_id', `habitat/planos/${nombre.toLowerCase().replace(/ /g, '_')}_${Date.now()}`)
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`, { method: 'POST', body: data })
    const result = await res.json()
    if (result.secure_url) {
      const nuevos = planosSubidos.filter(item => item.nombre !== nombre)
      const actualizados = [...nuevos, { nombre, url: result.secure_url }]
      setPlanosSubidos(actualizados)
      f('planos', actualizados.map(item => item.url))
    }
    setUploadingPlano(null)
  }

  const total = filtered.length
  const publicados = filtered.filter(p => p.estado_marketing === 'publicado').length
  const sinEstado = filtered.filter(p => !p.estado_marketing).length

  return (
    <div className="min-h-screen bg-[#EBEAE6]">
      <GlobalHeader />
      <main className="p-6 md:p-10">
        <div className="max-w-[1400px] mx-auto space-y-6">

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-black text-[#1E2D40] tracking-tighter">
                Portafolio de <span className="underline decoration-2 underline-offset-4">Captaciones</span>
              </h1>
              <p className="text-xs text-[#1A1A1A]/50 mt-1">{total} propiedades captadas</p>
            </div>
            <button onClick={openCreate} className="bg-[#1E2D40] text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-[#1E2D40]/90 transition-colors">
              + Nueva captación
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Total captaciones', value: total, color: 'text-[#1E2D40]' },
              { label: 'Publicadas', value: publicados, color: 'text-green-600' },
              { label: 'Sin estado', value: sinEstado, color: 'text-amber-600' },
            ].map(s => (
              <div key={s.label} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-[#1A1A1A]/5 p-5">
                <div className={`text-3xl font-black ${s.color}`}>{s.value}</div>
                <div className="text-xs text-[#1A1A1A]/50 mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-[#1A1A1A]/5 p-5">
            <div className="flex flex-col md:flex-row gap-3 flex-wrap">
              <div className="flex-1 relative min-w-[200px]">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1A1A1A]/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input type="text" placeholder="Buscar por código, dirección, asesor..." value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#EBEAE6]/50 border border-[#1A1A1A]/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E2D40]/20" />
              </div>
              <select value={filterType} onChange={e => setFilterType(e.target.value)}
                className="px-4 py-2.5 bg-[#EBEAE6]/50 border border-[#1A1A1A]/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E2D40]/20">
                <option value="">Todos los tipos</option>
                {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <select value={filterEstado} onChange={e => setFilterEstado(e.target.value)}
                className="px-4 py-2.5 bg-[#EBEAE6]/50 border border-[#1A1A1A]/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E2D40]/20">
                <option value="all">Todos los estados</option>
                <option value="null">Sin estado</option>
                {ESTADOS_MARKETING.filter(e => e.value).map(e => <option key={String(e.value)} value={String(e.value)}>{e.label}</option>)}
              </select>
              <select value={filterAsesor} onChange={e => setFilterAsesor(e.target.value)}
                className="px-4 py-2.5 bg-[#EBEAE6]/50 border border-[#1A1A1A]/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E2D40]/20">
                <option value="">Todos los asesores</option>
                {ASESORES.map(a => <option key={a.nombre} value={a.nombre}>{a.nombre}</option>)}
              </select>
              <select value={filterOperacion} onChange={e => setFilterOperacion(e.target.value)}
                className="px-4 py-2.5 bg-[#EBEAE6]/50 border border-[#1A1A1A]/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E2D40]/20">
                <option value="">Todas las operaciones</option>
                <option value="Venta">Venta</option>
                <option value="Alquiler">Alquiler</option>
                <option value="Venta y Alquiler">Venta y Alquiler</option>
              </select>
              <input placeholder="Filtrar por zona..." value={filterZona} onChange={e => setFilterZona(e.target.value)}
                className="px-4 py-2.5 bg-[#EBEAE6]/50 border border-[#1A1A1A]/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E2D40]/20 w-40" />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64"><p className="text-[#1A1A1A]/50 text-sm">Cargando captaciones...</p></div>
          ) : error ? (
            <div className="flex items-center justify-center h-64"><p className="text-red-500 text-sm">Error: {error}</p></div>
          ) : filtered.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-[#1A1A1A]/40 text-sm">{properties.length === 0 ? 'No hay captaciones. Crea la primera.' : 'Sin resultados.'}</p>
            </div>
          ) : (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-[#1A1A1A]/5 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#1A1A1A]/5">
                      {['Código', 'Tipo', 'Operación', 'Zona', 'Precio', 'M² Const.', 'Dorm.', 'Estado mkt', 'Asesor', 'Acciones'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-[10px] font-black text-[#1A1A1A]/40 uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((p, i) => (
                      <tr key={p.id} className={`border-b border-[#1A1A1A]/5 hover:bg-[#1E2D40]/5 transition-colors ${i % 2 === 0 ? '' : 'bg-[#EBEAE6]/30'}`}>
                        <td className="px-4 py-3 text-sm font-black text-[#1E2D40]">{p.code || '—'}</td>
                        <td className="px-4 py-3 text-sm text-[#1A1A1A]/70 whitespace-nowrap">{p.type || '—'}</td>
                        <td className="px-4 py-3 text-sm text-[#1A1A1A]/70 whitespace-nowrap">{p.tipo_operacion || '—'}</td>
                        <td className="px-4 py-3 text-sm text-[#1A1A1A]/70 whitespace-nowrap">{p.zone || '—'}</td>
                        <td className="px-4 py-3 text-sm font-bold text-[#1A1A1A] whitespace-nowrap">{formatPrice(p.price_initial)}</td>
                        <td className="px-4 py-3 text-sm text-[#1A1A1A]/70">{p.metros_construccion ? `${p.metros_construccion} m²` : '—'}</td>
                        <td className="px-4 py-3 text-sm text-[#1A1A1A]/70">{p.dormitorios ?? '—'}</td>
                        <td className="px-4 py-3"><EstadoBadge estado={p.estado_marketing} /></td>
                        <td className="px-4 py-3 text-sm text-[#1A1A1A]/70 whitespace-nowrap">
                          {p.asesor_nombre ? (
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-[#1E2D40]/10 flex items-center justify-center text-[#1E2D40] font-black text-[10px]">
                                {p.asesor_iniciales || p.asesor_nombre.charAt(0)}
                              </div>
                              {p.asesor_nombre}
                            </div>
                          ) : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button onClick={() => setViewingProperty(p)} className="text-xs font-bold px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors">Ver</button>
                            {(user?.role === 'Super Administrador' || user?.name === p.asesor_nombre) && (
                              <button onClick={() => openEdit(p)} className="text-xs font-bold px-3 py-1.5 bg-[#1E2D40]/10 text-[#1E2D40] rounded-lg hover:bg-[#1E2D40]/20 transition-colors">Editar</button>
                            )}
                            {user?.role === 'Super Administrador' && (
                              <button onClick={() => handleDelete(p.id)} className="text-xs font-bold px-3 py-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors">Eliminar</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

{/* (CONTINÚA en siguiente mensaje - archivo es muy largo) */}
