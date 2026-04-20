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
  slug: string | null
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
  // Amenidades propiedad
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
  // Amenidades urbanización
  piscina_urb: boolean | null
  gimnasio_urb: boolean | null
  bbq_urb: boolean | null
  salon_eventos: boolean | null
  cancha_tenis: boolean | null
  juegos_infantiles: boolean | null
  area_comunal: boolean | null
  seguridad_24h: boolean | null
  // Resto
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
  code: '', type: '', zone: '', address: '', slug: '', price_initial: null,
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
  reserva: null,
  promesa_porcentaje: null,
  promesa_valor: null,
  financiamiento_porcentaje: null,
  financiamiento_valor: null,
  financiamiento_meses: null,
  compraventa_porcentaje: null,
  compraventa_valor: null,
}

const TIPOS = ['Casa/Villa', 'Departamento', 'Local Comercial', 'Oficina', 'Suite', 'Bodega', 'Terreno', 'Otro']
const ESTADOS_MARKETING = [
  { value: null,        label: 'Sin estado',  bg: 'bg-gray-100',   text: 'text-gray-600' },
  { value: 'grabado',   label: 'Grabado',     bg: 'bg-amber-100',  text: 'text-amber-700' },
  { value: 'editado',   label: 'Editado',     bg: 'bg-blue-100',   text: 'text-blue-700' },
  { value: 'publicado', label: 'Publicado',   bg: 'bg-green-100',  text: 'text-green-700' },
]
const STEPS = ['Inmueble', 'Económico', 'Características', 'Propietario', 'Marketing', 'Fotos']

const ASESORES = [
  { nombre: 'Milenko Surati',       iniciales: 'MS' },
  { nombre: 'Gastón Calderón',      iniciales: 'GC' },
  { nombre: 'Rafaela Velásquez',    iniciales: 'RV' },
  { nombre: 'José Morán',           iniciales: 'JM' },
  { nombre: 'Sebastián Jaramillo',  iniciales: 'SJ' },
]

const FOTO_NOMBRES = [
  'Fachada',
  'Sala',
  'Cocina',
  'Dormitorio principal',
  'Dormitorio 2',
  'Dormitorio 3',
  'Baño principal',
  'Terraza / Balcón',
  'Área de servicio',
  'Vista aérea',
  'Piscina',
  'Área comunal',
]

const PLANO_NOMBRES = [
  'Plano 1',
  'Plano 2',
  'Plano 3',
  'Plano 4',
  'Plano 5',
]

const CLOUDINARY_CLOUD = 'dl64kkfbp'
const CLOUDINARY_PRESET = 'habitat_properties'

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

function generarSlug(zone: string, type: string, address: string): string {
  return `${zone} ${type} ${address}`
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 50)
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
  const [fotosSubidas, setFotosSubidas] = useState<{ nombre: string; url: string }[]>([])
  const [uploadingFoto, setUploadingFoto] = useState<string | null>(null)
  const [planosSubidos, setPlanosSubidos] = useState<{ nombre: string; url: string }[]>([])
  const [uploadingPlano, setUploadingPlano] = useState<string | null>(null)

  async function fetchProperties() {
    setLoading(true); setError(null)
    const { data, error } = await supabase.from('properties').select('*').order('code', { ascending: true })
    if (error) setError(error.message)
    else setProperties(data as Property[])
    setLoading(false)
  }

  useEffect(() => { fetchProperties() }, [])

  // Auto-detectar asesor desde sesión
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
    setFotosSubidas(
      urls.map((url, i) => ({
        url,
        nombre: noms[i] ?? FOTO_NOMBRES[i] ?? `Foto ${i + 1}`,
      }))
    )
    const planoUrls = p.planos ?? []
    setPlanosSubidos(
      planoUrls.map((url, i) => ({
        url,
        nombre: PLANO_NOMBRES[i] ?? `Plano ${i + 1}`,
      }))
    )
    setStep(0); setFormError(null); setShowModal(true)
  }

  const f = (key: keyof FormData, value: unknown) => setForm(prev => ({ ...prev, [key]: value }))

  async function handleSave() {
    const errores: string[] = []
    if (!form.address?.trim())             errores.push('Dirección')
    if (!form.type?.trim())                errores.push('Tipo de inmueble')
    if (!form.tipo_operacion?.trim())      errores.push('Tipo de operación')
    if (!form.price_initial)               errores.push('Precio total')
    if (!form.propietario_nombre?.trim())  errores.push('Nombre del propietario')
    if (!form.propietario_celular?.trim()) errores.push('Celular del propietario')
    if (!form.asesor_nombre?.trim())       errores.push('Asesor responsable')
    if (!form.comision)                    errores.push('Comisión')
    if (errores.length > 0) { setFormError(`Campos obligatorios: ${errores.join(', ')}`); return }

    setSaving(true); setFormError(null)
    const { error } = editingId
      ? await supabase.from('properties').update(form).eq('id', editingId)
      : await supabase.from('properties').insert(form)
    if (error) setFormError(error.message)
    else { setShowModal(false); fetchProperties() }
    setSaving(false)
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

    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`, {
      method: 'POST',
      body: data,
    })
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
              { label: 'Total captaciones', value: total,      color: 'text-[#1E2D40]' },
              { label: 'Publicadas',         value: publicados, color: 'text-green-600' },
              { label: 'Sin estado',         value: sinEstado,  color: 'text-amber-600' },
            ].map(s => (
              <div key={s.label} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-[#1A1A1A]/5 p-5">
                <div className={`text-3xl font-black ${s.color}`}>{s.value}</div>
                <div className="text-xs text-[#1A1A1A]/50 mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-[#1A1A1A]/5 p-5">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
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
              <select
  value={filterAsesor}
  onChange={e => setFilterAsesor(e.target.value)}
  className="px-4 py-2.5 bg-[#EBEAE6]/50 border border-[#1A1A1A]/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E2D40]/20"
>
  <option value="">Todos los asesores</option>
  {ASESORES.map(a => <option key={a.nombre} value={a.nombre}>{a.nombre}</option>)}
</select>
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
                            <button onClick={() => openEdit(p)} className="text-xs font-bold px-3 py-1.5 bg-[#1E2D40]/10 text-[#1E2D40] rounded-lg hover:bg-[#1E2D40]/20 transition-colors">Editar</button>
                            <button onClick={() => handleDelete(p.id)} className="text-xs font-bold px-3 py-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors">Eliminar</button>
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

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">

            <div className="flex items-center justify-between p-6 pb-0">
              <h2 className="text-lg font-black text-[#1E2D40] tracking-tighter">
                {editingId ? 'Editar captación' : 'Nueva captación'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-[#1A1A1A]/40 hover:text-[#1A1A1A] text-2xl leading-none">×</button>
            </div>

            <div className="flex px-6 pt-4 gap-0 border-b border-[#1A1A1A]/10">
              {STEPS.map((s, i) => (
                <button key={s} onClick={() => setStep(i)}
                  className={`flex-1 pb-3 text-[10px] font-black uppercase tracking-wide border-b-2 transition-colors ${step === i ? 'border-[#1E2D40] text-[#1E2D40]' : 'border-transparent text-[#1A1A1A]/30 hover:text-[#1A1A1A]/60'}`}>
                  {i + 1}. {s}
                </button>
              ))}
            </div>

            {formError && (
              <div className="mx-6 mt-4 bg-red-50 border border-red-100 text-red-600 text-xs font-bold px-4 py-3 rounded-xl">{formError}</div>
            )}

            <div className="p-6">

              {step === 0 && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Tipo de inmueble *</Label>
                    <Select value={form.type ?? ''} onChange={v => f('type', v)}>
                      <option value="">Seleccionar...</option>
                      {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
                    </Select>
                  </div>
                  <div>
                    <Label>Zona / Sector</Label>
                    <Input value={form.zone ?? ''} onChange={v => f('zone', v)} placeholder="Ej: Samborondón" />
                  </div>
                  <div className="col-span-2">
                    <Label>Dirección *</Label>
                    <Input value={form.address ?? ''} onChange={v => f('address', v)} placeholder="Dirección completa" />
                  </div>
                  <div className="col-span-2">
                    <Label>URL de la propiedad</Label>
                    <div className="flex items-center gap-2 bg-[#EBEAE6]/50 border border-[#1A1A1A]/10 rounded-xl overflow-hidden">
                      <span className="text-xs text-[#1A1A1A]/40 pl-3 whitespace-nowrap">habitatbienesraicesec.com/propiedades/</span>
                      <input
                        value={form.slug ?? ''}
                        onChange={e => f('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                        className="flex-1 px-2 py-2.5 bg-transparent text-sm focus:outline-none text-[#1E2D40] font-mono"
                        placeholder="se genera automáticamente"
                      />
                    </div>
                    <p className="text-xs text-[#1A1A1A]/30 mt-1">Puedes editarlo manualmente si lo necesitas</p>
                  </div>
                  <div>
                    <Label>M² Terreno</Label>
                    <Input type="number" value={form.metros_terreno ?? ''} onChange={v => f('metros_terreno', v ? +v : null)} placeholder="0" />
                  </div>
                  <div>
                    <Label>M² Construcción</Label>
                    <Input type="number" value={form.metros_construccion ?? ''} onChange={v => f('metros_construccion', v ? +v : null)} placeholder="0" />
                  </div>
                  <div>
                    <Label>M² Parqueo</Label>
                    <Input type="number" value={form.metros_parqueo ?? ''} onChange={v => f('metros_parqueo', v ? +v : null)} placeholder="0" />
                  </div>
                  <div className="col-span-2">
                    <Label>Observaciones</Label>
                    <textarea value={form.observaciones ?? ''} onChange={e => f('observaciones', e.target.value)} placeholder="Notas sobre el inmueble..."
                      className="w-full px-3 py-2.5 bg-[#EBEAE6]/50 border border-[#1A1A1A]/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E2D40]/20 text-[#1A1A1A] h-20 resize-none" />
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Tipo de operación *</Label>
                    <Select value={form.tipo_operacion ?? ''} onChange={v => f('tipo_operacion', v)}>
                      <option value="">Seleccionar...</option>
                      <option value="Venta">Venta</option>
                      <option value="Alquiler">Alquiler</option>
                      <option value="Venta y Alquiler">Venta y Alquiler</option>
                    </Select>
                  </div>
                  <div>
                    <Label>Precio total *</Label>
                    <input type="number" value={form.price_initial ?? ''} onChange={e => {
                      const precio = e.target.value ? +e.target.value : null
                      f('price_initial', precio)
                      if (precio) {
                        if (form.promesa_porcentaje) f('promesa_valor', +(precio * form.promesa_porcentaje / 100).toFixed(2))
                        if (form.financiamiento_porcentaje) f('financiamiento_valor', +(precio * form.financiamiento_porcentaje / 100).toFixed(2))
                        if (form.compraventa_porcentaje) f('compraventa_valor', +(precio * form.compraventa_porcentaje / 100).toFixed(2))
                      }
                    }} className="w-full px-3 py-2.5 bg-[#EBEAE6]/50 border border-[#1A1A1A]/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E2D40]/20 text-[#1A1A1A]" placeholder="0" />
                  </div>
                  <div>
                    <Label>Comisión (%) *</Label>
                    <Input type="number" value={form.comision ?? ''} onChange={v => f('comision', v ? +v : null)} placeholder="4" />
                  </div>
                  <div>
                    <Label>Alícuota mensual ($)</Label>
                    <Input type="number" value={form.alicuota ?? ''} onChange={v => f('alicuota', v ? +v : null)} placeholder="0" />
                  </div>
                  <div>
                    <Label>Validez contrato</Label>
                    <Select value={form.validez_contrato ?? ''} onChange={v => f('validez_contrato', v ? +v : null)}>
                      <option value="">Seleccionar...</option>
                      <option value={3}>3 meses</option>
                      <option value={6}>6 meses</option>
                      <option value={12}>12 meses</option>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2 justify-end">
                    <CheckField label="Exclusividad" checked={!!form.exclusividad} onChange={v => f('exclusividad', v)} />
                    <CheckField label="Amoblado" checked={!!form.amoblado} onChange={v => f('amoblado', v)} />
                    <CheckField label="Entrega de llaves" checked={!!form.entrega_llaves} onChange={v => f('entrega_llaves', v)} />
                  </div>

                  {/* SECCIÓN FINANCIERA */}
                  <div className="col-span-2 pt-4 border-t border-[#1A1A1A]/10">
                    <p className="text-xs font-black text-[#1E2D40] uppercase tracking-wider mb-4">Estructura de pago</p>
                    <div className="space-y-4">

                      {/* Reserva */}
                      <div className="bg-[#EBEAE6]/50 rounded-xl p-4">
                        <p className="text-xs font-bold text-[#1A1A1A]/60 uppercase tracking-wide mb-3">Reserva</p>
                        <div className="grid grid-cols-1 gap-3">
                          <div>
                            <Label>Valor de reserva ($)</Label>
                            <Input type="number" value={form.reserva ?? ''} onChange={v => f('reserva', v ? +v : null)} placeholder="2000" />
                          </div>
                        </div>
                      </div>

                      {/* Promesa de compraventa */}
                      <div className="bg-[#EBEAE6]/50 rounded-xl p-4">
                        <p className="text-xs font-bold text-[#1A1A1A]/60 uppercase tracking-wide mb-3">Promesa de compraventa</p>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label>Porcentaje (%)</Label>
                            <input type="number" value={form.promesa_porcentaje ?? ''} onChange={e => {
                              const pct = e.target.value ? +e.target.value : null
                              f('promesa_porcentaje', pct)
                              if (pct && form.price_initial) f('promesa_valor', +(form.price_initial * pct / 100).toFixed(2))
                            }} className="w-full px-3 py-2.5 bg-white border border-[#1A1A1A]/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E2D40]/20 text-[#1A1A1A]" placeholder="10" />
                          </div>
                          <div>
                            <Label>Valor ($) — automático</Label>
                            <div className="w-full px-3 py-2.5 bg-white/50 border border-[#1A1A1A]/10 rounded-xl text-sm text-[#1E2D40] font-bold">
                              {form.promesa_valor ? `$${form.promesa_valor.toLocaleString('es-EC')}` : '—'}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Financiamiento */}
                      <div className="bg-[#EBEAE6]/50 rounded-xl p-4">
                        <p className="text-xs font-bold text-[#1A1A1A]/60 uppercase tracking-wide mb-3">Financiamiento</p>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label>Porcentaje (%)</Label>
                            <input type="number" value={form.financiamiento_porcentaje ?? ''} onChange={e => {
                              const pct = e.target.value ? +e.target.value : null
                              f('financiamiento_porcentaje', pct)
                              if (pct && form.price_initial) f('financiamiento_valor', +(form.price_initial * pct / 100).toFixed(2))
                            }} className="w-full px-3 py-2.5 bg-white border border-[#1A1A1A]/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E2D40]/20 text-[#1A1A1A]" placeholder="20" />
                          </div>
                          <div>
                            <Label>Valor ($) — automático</Label>
                            <div className="w-full px-3 py-2.5 bg-white/50 border border-[#1A1A1A]/10 rounded-xl text-sm text-[#1E2D40] font-bold">
                              {form.financiamiento_valor ? `$${form.financiamiento_valor.toLocaleString('es-EC')}` : '—'}
                            </div>
                          </div>
                          <div className="col-span-2">
                            <Label>Plazo (meses) — mín. 1, máx. 48</Label>
                            <input type="number" min={1} max={48} value={form.financiamiento_meses ?? ''} onChange={e => {
                              const val = Math.min(48, Math.max(1, +e.target.value))
                              f('financiamiento_meses', e.target.value ? val : null)
                            }} className="w-full px-3 py-2.5 bg-white border border-[#1A1A1A]/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E2D40]/20 text-[#1A1A1A]" placeholder="12" />
                          </div>
                        </div>
                      </div>

                      {/* Compraventa */}
                      <div className="bg-[#EBEAE6]/50 rounded-xl p-4">
                        <p className="text-xs font-bold text-[#1A1A1A]/60 uppercase tracking-wide mb-3">Compraventa</p>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label>Porcentaje (%)</Label>
                            <input type="number" value={form.compraventa_porcentaje ?? ''} onChange={e => {
                              const pct = e.target.value ? +e.target.value : null
                              f('compraventa_porcentaje', pct)
                              if (pct && form.price_initial) f('compraventa_valor', +(form.price_initial * pct / 100).toFixed(2))
                            }} className="w-full px-3 py-2.5 bg-white border border-[#1A1A1A]/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E2D40]/20 text-[#1A1A1A]" placeholder="70" />
                          </div>
                          <div>
                            <Label>Valor ($) — automático</Label>
                            <div className="w-full px-3 py-2.5 bg-white/50 border border-[#1A1A1A]/10 rounded-xl text-sm text-[#1E2D40] font-bold">
                              {form.compraventa_valor ? `$${form.compraventa_valor.toLocaleString('es-EC')}` : '—'}
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Dormitorios</Label>
                      <Input type="number" value={form.dormitorios ?? ''} onChange={v => f('dormitorios', v ? +v : null)} placeholder="0" />
                    </div>
                    <div>
                      <Label>Baños completos</Label>
                      <Input type="number" value={form.banos_completos ?? ''} onChange={v => f('banos_completos', v ? +v : null)} placeholder="0" />
                    </div>
                    <div>
                      <Label>Medio baño</Label>
                      <Input type="number" value={form.medio_bano ?? ''} onChange={v => f('medio_bano', v ? +v : null)} placeholder="0" />
                    </div>
                    <div>
                      <Label>Parqueos</Label>
                      <Input type="number" value={form.parqueos ?? ''} onChange={v => f('parqueos', v ? +v : null)} placeholder="0" />
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-black text-[#1E2D40] uppercase tracking-wider mb-3 pb-2 border-b border-[#1A1A1A]/10">Amenidades de la propiedad</p>
                    <div className="grid grid-cols-3 gap-1">
                      <CheckField label="Piscina propia" checked={!!form.piscina_propia} onChange={v => f('piscina_propia', v)} />
                      <CheckField label="Gimnasio propio" checked={!!form.gimnasio_propio} onChange={v => f('gimnasio_propio', v)} />
                      <CheckField label="BBQ propio" checked={!!form.bbq_propio} onChange={v => f('bbq_propio', v)} />
                      <CheckField label="Terraza" checked={!!form.terraza} onChange={v => f('terraza', v)} />
                      <CheckField label="Balcón" checked={!!form.balcon} onChange={v => f('balcon', v)} />
                      <CheckField label="Jacuzzi" checked={!!form.jacuzzi} onChange={v => f('jacuzzi', v)} />
                      <CheckField label="Cuarto de servicio" checked={!!form.cuarto_servicio} onChange={v => f('cuarto_servicio', v)} />
                      <CheckField label="Baño de servicio" checked={!!form.bano_servicio} onChange={v => f('bano_servicio', v)} />
                      <CheckField label="Lavandería" checked={!!form.lavanderia} onChange={v => f('lavanderia', v)} />
                      <CheckField label="Cocina equipada" checked={!!form.cocina_equipada} onChange={v => f('cocina_equipada', v)} />
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-black text-[#1E2D40] uppercase tracking-wider mb-3 pb-2 border-b border-[#1A1A1A]/10">Amenidades de la urbanización</p>
                    <div className="grid grid-cols-3 gap-1">
                      <CheckField label="Piscina" checked={!!form.piscina_urb} onChange={v => f('piscina_urb', v)} />
                      <CheckField label="Gimnasio" checked={!!form.gimnasio_urb} onChange={v => f('gimnasio_urb', v)} />
                      <CheckField label="BBQ comunal" checked={!!form.bbq_urb} onChange={v => f('bbq_urb', v)} />
                      <CheckField label="Salón de eventos" checked={!!form.salon_eventos} onChange={v => f('salon_eventos', v)} />
                      <CheckField label="Cancha de tenis" checked={!!form.cancha_tenis} onChange={v => f('cancha_tenis', v)} />
                      <CheckField label="Juegos infantiles" checked={!!form.juegos_infantiles} onChange={v => f('juegos_infantiles', v)} />
                      <CheckField label="Área comunal" checked={!!form.area_comunal} onChange={v => f('area_comunal', v)} />
                      <CheckField label="Seguridad 24h" checked={!!form.seguridad_24h} onChange={v => f('seguridad_24h', v)} />
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label>Nombre del propietario *</Label>
                    <Input value={form.propietario_nombre ?? ''} onChange={v => f('propietario_nombre', v)} placeholder="Nombre completo" />
                  </div>
                  <div>
                    <Label>C.I. / RUC</Label>
                    <Input value={form.propietario_ci ?? ''} onChange={v => f('propietario_ci', v)} placeholder="0000000000" />
                  </div>
                  <div>
                    <Label>Celular *</Label>
                    <Input value={form.propietario_celular ?? ''} onChange={v => f('propietario_celular', v)} placeholder="09XXXXXXXX" />
                  </div>
                  <div className="col-span-2">
                    <Label>Email</Label>
                    <Input type="email" value={form.propietario_email ?? ''} onChange={v => f('propietario_email', v)} placeholder="correo@ejemplo.com" />
                  </div>
                  <div className="col-span-2">
                    <Label>Asesor responsable *</Label>
                    <Select value={form.asesor_nombre ?? ''} onChange={v => {
                      const asesor = ASESORES.find(a => a.nombre === v)
                      f('asesor_nombre', v)
                      f('asesor_iniciales', asesor?.iniciales || '')
                    }}>
                      <option value="">Seleccionar asesor...</option>
                      {ASESORES.map(a => <option key={a.nombre} value={a.nombre}>{a.nombre}</option>)}
                    </Select>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label>Estado marketing</Label>
                    <Select value={form.estado_marketing ?? ''} onChange={v => f('estado_marketing', (v || null) as EstadoMarketing)}>
                      <option value="">Sin estado</option>
                      {ESTADOS_MARKETING.filter(e => e.value).map(e => <option key={String(e.value)} value={String(e.value!)}>{e.label}</option>)}
                    </Select>
                  </div>
                  <div>
                    <Label>Estado de producción</Label>
                    <div className="flex gap-6 mt-1">
                      <CheckField label="Grabado" checked={!!form.grabado} onChange={v => f('grabado', v)} />
                      <CheckField label="Editado" checked={!!form.editado} onChange={v => f('editado', v)} />
                      <CheckField label="Publicado" checked={!!form.publicado} onChange={v => f('publicado', v)} />
                    </div>
                  </div>
                  <div>
                    <Label>Notas de marketing</Label>
                    <textarea value={form.notas_marketing ?? ''} onChange={e => f('notas_marketing', e.target.value)} placeholder="Notas internas..."
                      className="w-full px-3 py-2.5 bg-[#EBEAE6]/50 border border-[#1A1A1A]/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E2D40]/20 text-[#1A1A1A] h-24 resize-none" />
                  </div>
                </div>
              )}

              {step === 5 && (
                <div className="space-y-4">
                  <p className="text-xs text-[#1A1A1A]/50 mb-4">
                    Sube las fotos con el nombre correcto. Formatos: JPG, PNG. Máx 10MB por foto.
                  </p>
                  <div className="grid grid-cols-1 gap-3">
                    {FOTO_NOMBRES.map(nombre => {
                      const subida = fotosSubidas.find(item => item.nombre === nombre)
                      const uploading = uploadingFoto === nombre
                      return (
                        <div key={nombre} className={`flex items-center gap-3 p-3 rounded-xl border ${subida ? 'border-green-200 bg-green-50' : 'border-[#1A1A1A]/10 bg-[#EBEAE6]/30'}`}>
                          <div className="flex-1">
                            <p className="text-sm font-bold text-[#1E2D40]">{nombre}</p>
                            {subida && <p className="text-xs text-green-600 mt-0.5 truncate">✓ Subida correctamente</p>}
                          </div>
                          {subida && (
                            <img src={subida.url} alt={nombre} className="w-14 h-14 object-cover rounded-lg" />
                          )}
                          <label className={`cursor-pointer text-xs font-bold px-3 py-2 rounded-lg transition-colors ${uploading ? 'bg-gray-100 text-gray-400' : subida ? 'bg-[#1E2D40]/10 text-[#1E2D40]' : 'bg-[#1E2D40] text-white'}`}>
                            {uploading ? 'Subiendo...' : subida ? 'Cambiar' : 'Subir foto'}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              disabled={uploading}
                              onChange={e => {
                                const file = e.target.files?.[0]
                                if (file) handleFotoUpload(nombre, file)
                              }}
                            />
                          </label>
                        </div>
                      )
                    })}
                  </div>
                  {fotosSubidas.length > 0 && (
                    <p className="text-xs text-[#1A1A1A]/50 text-center mt-2">
                      {fotosSubidas.length} de {FOTO_NOMBRES.length} fotos subidas
                    </p>
                  )}

                  <div className="mt-6 pt-6 border-t border-[#1A1A1A]/10">
                    <p className="text-xs font-black text-[#1E2D40] uppercase tracking-wider mb-3">Planos (opcional)</p>
                    <p className="text-xs text-[#1A1A1A]/50 mb-4">Puedes subir hasta 5 planos del inmueble.</p>
                    <div className="grid grid-cols-1 gap-3">
                      {PLANO_NOMBRES.map(nombre => {
                        const subido = planosSubidos.find(item => item.nombre === nombre)
                        const uploading = uploadingPlano === nombre
                        return (
                          <div key={nombre} className={`flex items-center gap-3 p-3 rounded-xl border ${subido ? 'border-blue-200 bg-blue-50' : 'border-[#1A1A1A]/10 bg-[#EBEAE6]/30'}`}>
                            <div className="flex-1">
                              <p className="text-sm font-bold text-[#1E2D40]">{nombre}</p>
                              {subido && <p className="text-xs text-blue-600 mt-0.5">✓ Subido correctamente</p>}
                            </div>
                            {subido && <img src={subido.url} alt={nombre} className="w-14 h-14 object-cover rounded-lg" />}
                            <label className={`cursor-pointer text-xs font-bold px-3 py-2 rounded-lg transition-colors ${uploading ? 'bg-gray-100 text-gray-400' : subido ? 'bg-blue-100 text-blue-700' : 'bg-[#1E2D40] text-white'}`}>
                              {uploading ? 'Subiendo...' : subido ? 'Cambiar' : 'Subir plano'}
                              <input type="file" accept="image/*,.pdf" className="hidden" disabled={uploading} onChange={e => { const file = e.target.files?.[0]; if (file) handlePlanoUpload(nombre, file) }} />
                            </label>
                          </div>
                        )
                      })}
                    </div>
                    {planosSubidos.length > 0 && <p className="text-xs text-[#1A1A1A]/50 text-center mt-2">{planosSubidos.length} de 5 planos subidos</p>}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between px-6 pb-6">
              <div>
                {step > 0 && (
                  <button onClick={() => setStep(s => s - 1)} className="text-sm font-bold px-4 py-2 bg-[#EBEAE6] text-[#1A1A1A]/70 rounded-xl hover:bg-[#EBEAE6]/80 transition-colors">
                    ← Anterior
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowModal(false)} className="text-sm font-bold px-4 py-2 bg-[#EBEAE6] text-[#1A1A1A]/70 rounded-xl hover:bg-[#EBEAE6]/80 transition-colors">
                  Cancelar
                </button>
                {step < STEPS.length - 1 ? (
                  <button onClick={() => setStep(s => s + 1)} className="text-sm font-bold px-4 py-2 bg-[#1E2D40] text-white rounded-xl hover:bg-[#1E2D40]/90 transition-colors">
                    Siguiente →
                  </button>
                ) : (
                  <button onClick={handleSave} disabled={saving} className="text-sm font-bold px-4 py-2 bg-[#1E2D40] text-white rounded-xl hover:bg-[#1E2D40]/90 transition-colors disabled:opacity-50">
                    {saving ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear captación'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
