'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
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
  piscina: boolean | null
  gimnasio: boolean | null
  bbq: boolean | null
  salon_eventos: boolean | null
  terraza: boolean | null
  balcon: boolean | null
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
}

type FormData = Omit<Property, 'id'>

const EMPTY_FORM: FormData = {
  code: '', type: '', zone: '', address: '', price_initial: null,
  estado_marketing: null, grabado: false, editado: false, publicado: false,
  notas_marketing: '', asesor_id: null, asesor_nombre: '', asesor_iniciales: '',
  metros_terreno: null, metros_construccion: null, metros_parqueo: null,
  dormitorios: null, banos_completos: null, medio_bano: null, parqueos: null,
  piscina: false, gimnasio: false, bbq: false, salon_eventos: false,
  terraza: false, balcon: false, amoblado: false, exclusividad: false,
  comision: null, validez_contrato: null, tipo_operacion: '',
  propietario_nombre: '', propietario_ci: '', propietario_celular: '',
  propietario_email: '', alicuota: null, entrega_llaves: false,
  observaciones: '', fotos: null,
}

const TIPOS = ['Casa/Villa', 'Departamento', 'Local Comercial', 'Oficina', 'Suite', 'Bodega', 'Terreno', 'Otro']
const ESTADOS_MARKETING = [
  { value: null,        label: 'Sin estado',  bg: 'bg-gray-100',   text: 'text-gray-600' },
  { value: 'grabado',   label: 'Grabado',     bg: 'bg-amber-100',  text: 'text-amber-700' },
  { value: 'editado',   label: 'Editado',     bg: 'bg-blue-100',   text: 'text-blue-700' },
  { value: 'publicado', label: 'Publicado',   bg: 'bg-green-100',  text: 'text-green-700' },
]
const STEPS = ['Inmueble', 'Económico', 'Características', 'Propietario', 'Marketing']

function EstadoBadge({ estado }: { estado: EstadoMarketing }) {
  const e = ESTADOS_MARKETING.find(x => x.value === estado) ?? ESTADOS_MARKETING[0]
  return (
    <span className={`text-[10px] font-black px-2 py-1 rounded-full ${e.bg} ${e.text}`}>
      {e.label}
    </span>
  )
}

function formatPrice(n: number | null) {
  if (!n) return '—'
  return '$' + n.toLocaleString('es-EC')
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-bold text-[#1A1A1A]/50 mb-1.5 uppercase tracking-wide">
      {children}
    </label>
  )
}

function Input({ value, onChange, placeholder, type = 'text' }: {
  value: string | number
  onChange: (v: string) => void
  placeholder?: string
  type?: string
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2.5 bg-[#EBEAE6]/50 border border-[#1A1A1A]/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E2D40]/20 text-[#1A1A1A]"
    />
  )
}

function Select({ value, onChange, children }: {
  value: string | number
  onChange: (v: string) => void
  children: React.ReactNode
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full px-3 py-2.5 bg-[#EBEAE6]/50 border border-[#1A1A1A]/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E2D40]/20 text-[#1A1A1A]"
    >
      {children}
    </select>
  )
}

function CheckField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer text-sm text-[#1A1A1A]/70 py-1">
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        className="w-4 h-4 accent-[#1E2D40] rounded"
      />
      {label}
    </label>
  )
}

export default function CaptacionPage() {
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

  async function fetchProperties() {
    setLoading(true); setError(null)
    const { data, error } = await supabase.from('properties').select('*').order('code', { ascending: true })
    if (error) setError(error.message)
    else setProperties(data as Property[])
    setLoading(false)
  }

  useEffect(() => { fetchProperties() }, [])

  const filtered = properties.filter(p => {
    if (filterType && p.type !== filterType) return false
    if (filterEstado !== 'all' && (p.estado_marketing ?? 'null') !== (filterEstado === 'null' ? 'null' : filterEstado)) return false
    if (search) {
      const q = search.toLowerCase()
      return (p.code ?? '').toLowerCase().includes(q) ||
             (p.address ?? '').toLowerCase().includes(q) ||
             (p.asesor_nombre ?? '').toLowerCase().includes(q)
    }
    return true
  })

  function openCreate() { setEditingId(null); setForm(EMPTY_FORM); setStep(0); setFormError(null); setShowModal(true) }
  function openEdit(p: Property) {
    setEditingId(p.id)
    setForm({ ...p } as FormData)
    setStep(0); setFormError(null); setShowModal(true)
  }

  const f = (key: keyof FormData, value: unknown) => setForm(prev => ({ ...prev, [key]: value }))

  async function handleSave() {
    const errores: string[] = []
    if (!form.address?.trim())             errores.push('Dirección')
    if (!form.type?.trim())                errores.push('Tipo de inmueble')
    if (!form.tipo_operacion?.trim())      errores.push('Tipo de operación')
    if (!form.price_initial)               errores.push('Precio referencial')
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

  const total = properties.length
  const publicados = properties.filter(p => p.estado_marketing === 'publicado').length
  const sinEstado = properties.filter(p => !p.estado_marketing).length

  return (
    <div className="min-h-screen bg-[#EBEAE6]">
      <GlobalHeader />

      <main className="p-6 md:p-10">
        <div className="max-w-[1400px] mx-auto space-y-6">

          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-black text-[#1E2D40] tracking-tighter">
                Portafolio de <span className="underline decoration-2 underline-offset-4">Captaciones</span>
              </h1>
              <p className="text-xs text-[#1A1A1A]/50 mt-1">{total} propiedades captadas</p>
            </div>
            <button
              onClick={openCreate}
              className="bg-[#1E2D40] text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-[#1E2D40]/90 transition-colors"
            >
              + Nueva captación
            </button>
          </div>

          {/* Stats */}
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

          {/* Filtros */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-[#1A1A1A]/5 p-5">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1A1A1A]/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Buscar por código, dirección, asesor..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#EBEAE6]/50 border border-[#1A1A1A]/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E2D40]/20"
                />
              </div>
              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
                className="px-4 py-2.5 bg-[#EBEAE6]/50 border border-[#1A1A1A]/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E2D40]/20"
              >
                <option value="">Todos los tipos</option>
                {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <select
                value={filterEstado}
                onChange={e => setFilterEstado(e.target.value)}
                className="px-4 py-2.5 bg-[#EBEAE6]/50 border border-[#1A1A1A]/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E2D40]/20"
              >
                <option value="all">Todos los estados</option>
                <option value="null">Sin estado</option>
                {ESTADOS_MARKETING.filter(e => e.value).map(e => (
                  <option key={String(e.value)} value={String(e.value)}>{e.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tabla */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-[#1A1A1A]/50 text-sm">Cargando captaciones...</p>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-red-500 text-sm">Error: {error}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-[#1A1A1A]/40 text-sm">
                {properties.length === 0 ? 'No hay captaciones. Crea la primera.' : 'Sin resultados para los filtros aplicados.'}
              </p>
            </div>
          ) : (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-[#1A1A1A]/5 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#1A1A1A]/5">
                      {['Código', 'Tipo', 'Operación', 'Zona', 'Precio', 'M² Const.', 'Dorm.', 'Estado mkt', 'Asesor', 'Acciones'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-[10px] font-black text-[#1A1A1A]/40 uppercase tracking-wider whitespace-nowrap">
                          {h}
                        </th>
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
                            <button
                              onClick={() => openEdit(p)}
                              className="text-xs font-bold px-3 py-1.5 bg-[#1E2D40]/10 text-[#1E2D40] rounded-lg hover:bg-[#1E2D40]/20 transition-colors"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDelete(p.id)}
                              className="text-xs font-bold px-3 py-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"
                            >
                              Eliminar
                            </button>
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

      {/* Modal multi-step */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">

            {/* Header modal */}
            <div className="flex items-center justify-between p-6 pb-0">
              <h2 className="text-lg font-black text-[#1E2D40] tracking-tighter">
                {editingId ? 'Editar captación' : 'Nueva captación'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-[#1A1A1A]/40 hover:text-[#1A1A1A] text-2xl leading-none">×</button>
            </div>

            {/* Steps */}
            <div className="flex px-6 pt-4 gap-0 border-b border-[#1A1A1A]/10">
              {STEPS.map((s, i) => (
                <button
                  key={s}
                  onClick={() => setStep(i)}
                  className={`flex-1 pb-3 text-[10px] font-black uppercase tracking-wide border-b-2 transition-colors ${
                    step === i
                      ? 'border-[#1E2D40] text-[#1E2D40]'
                      : 'border-transparent text-[#1A1A1A]/30 hover:text-[#1A1A1A]/60'
                  }`}
                >
                  {i + 1}. {s}
                </button>
              ))}
            </div>

            {formError && (
              <div className="mx-6 mt-4 bg-red-50 border border-red-100 text-red-600 text-xs font-bold px-4 py-3 rounded-xl">
                {formError}
              </div>
            )}

            <div className="p-6">

              {/* PASO 1 — Inmueble */}
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
                    <textarea
                      value={form.observaciones ?? ''}
                      onChange={e => f('observaciones', e.target.value)}
                      placeholder="Notas sobre el inmueble..."
                      className="w-full px-3 py-2.5 bg-[#EBEAE6]/50 border border-[#1A1A1A]/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E2D40]/20 text-[#1A1A1A] h-20 resize-none"
                    />
                  </div>
                </div>
              )}

              {/* PASO 2 — Económico */}
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
                    <Label>Precio referencial *</Label>
                    <Input type="number" value={form.price_initial ?? ''} onChange={v => f('price_initial', v ? +v : null)} placeholder="0" />
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
                </div>
              )}

              {/* PASO 3 — Características */}
              {step === 2 && (
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
                  <div className="col-span-2">
                    <Label>Amenidades</Label>
                    <div className="grid grid-cols-3 gap-1 mt-2">
                      <CheckField label="Piscina" checked={!!form.piscina} onChange={v => f('piscina', v)} />
                      <CheckField label="Gimnasio" checked={!!form.gimnasio} onChange={v => f('gimnasio', v)} />
                      <CheckField label="BBQ" checked={!!form.bbq} onChange={v => f('bbq', v)} />
                      <CheckField label="Salón eventos" checked={!!form.salon_eventos} onChange={v => f('salon_eventos', v)} />
                      <CheckField label="Terraza" checked={!!form.terraza} onChange={v => f('terraza', v)} />
                      <CheckField label="Balcón" checked={!!form.balcon} onChange={v => f('balcon', v)} />
                    </div>
                  </div>
                </div>
              )}

              {/* PASO 4 — Propietario */}
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
                  <div>
                    <Label>Asesor responsable *</Label>
                    <Input value={form.asesor_nombre ?? ''} onChange={v => f('asesor_nombre', v)} placeholder="Nombre del asesor" />
                  </div>
                  <div>
                    <Label>Iniciales asesor</Label>
                    <input
                      value={form.asesor_iniciales ?? ''}
                      onChange={e => f('asesor_iniciales', e.target.value.toUpperCase())}
                      placeholder="MS"
                      maxLength={3}
                      className="w-full px-3 py-2.5 bg-[#EBEAE6]/50 border border-[#1A1A1A]/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E2D40]/20 text-[#1A1A1A]"
                    />
                  </div>
                </div>
              )}

              {/* PASO 5 — Marketing */}
              {step === 4 && (
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label>Estado marketing</Label>
                    <Select value={form.estado_marketing ?? ''} onChange={v => f('estado_marketing', (v || null) as EstadoMarketing)}>
                      <option value="">Sin estado</option>
                      {ESTADOS_MARKETING.filter(e => e.value).map(e => (
                        <option key={String(e.value)} value={String(e.value)}>{e.label}</option>
                      ))}
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
                    <textarea
                      value={form.notas_marketing ?? ''}
                      onChange={e => f('notas_marketing', e.target.value)}
                      placeholder="Notas internas del proceso de marketing..."
                      className="w-full px-3 py-2.5 bg-[#EBEAE6]/50 border border-[#1A1A1A]/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E2D40]/20 text-[#1A1A1A] h-24 resize-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Footer modal */}
            <div className="flex items-center justify-between px-6 pb-6">
              <div>
                {step > 0 && (
                  <button
                    onClick={() => setStep(s => s - 1)}
                    className="text-sm font-bold px-4 py-2 bg-[#EBEAE6] text-[#1A1A1A]/70 rounded-xl hover:bg-[#EBEAE6]/80 transition-colors"
                  >
                    ← Anterior
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="text-sm font-bold px-4 py-2 bg-[#EBEAE6] text-[#1A1A1A]/70 rounded-xl hover:bg-[#EBEAE6]/80 transition-colors"
                >
                  Cancelar
                </button>
                {step < STEPS.length - 1 ? (
                  <button
                    onClick={() => setStep(s => s + 1)}
                    className="text-sm font-bold px-4 py-2 bg-[#1E2D40] text-white rounded-xl hover:bg-[#1E2D40]/90 transition-colors"
                  >
                    Siguiente →
                  </button>
                ) : (
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="text-sm font-bold px-4 py-2 bg-[#1E2D40] text-white rounded-xl hover:bg-[#1E2D40]/90 transition-colors disabled:opacity-50"
                  >
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
