'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

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
  // Nuevos campos
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
  { value: null,        label: 'Sin estado',  color: '#6b7280' },
  { value: 'grabado',   label: 'Grabado',     color: '#f59e0b' },
  { value: 'editado',   label: 'Editado',     color: '#3b82f6' },
  { value: 'publicado', label: 'Publicado',   color: '#10b981' },
]

const STEPS = ['Inmueble', 'Económico', 'Características', 'Propietario', 'Marketing']

function estadoBadge(estado: EstadoMarketing) {
  const e = ESTADOS_MARKETING.find(x => x.value === estado) ?? ESTADOS_MARKETING[0]
  return (
    <span style={{ background: e.color + '22', color: e.color, border: `1px solid ${e.color}55`, borderRadius: 6, padding: '2px 10px', fontSize: 12, fontWeight: 600 }}>
      {e.label}
    </span>
  )
}

function formatPrice(n: number | null) {
  if (!n) return '—'
  return '$' + n.toLocaleString('es-EC')
}

const inputStyle: React.CSSProperties = {
  width: '100%', background: '#0f1117', border: '1px solid #2d3748',
  borderRadius: 8, padding: '9px 12px', color: '#e2e8f0', fontSize: 14,
  outline: 'none', boxSizing: 'border-box',
}
const td: React.CSSProperties = { padding: '11px 16px', fontSize: 14, verticalAlign: 'middle', whiteSpace: 'nowrap' }
const btnPrimary: React.CSSProperties = { background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }
const btnSecondary: React.CSSProperties = { background: '#2d3748', color: '#cbd5e1', border: '1px solid #3d4a5c', borderRadius: 8, padding: '7px 14px', fontSize: 13, cursor: 'pointer' }
const btnDanger: React.CSSProperties = { background: '#7f1d1d22', color: '#f87171', border: '1px solid #7f1d1d55', borderRadius: 8, padding: '7px 14px', fontSize: 13, cursor: 'pointer' }

function Label({ children }: { children: React.ReactNode }) {
  return <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.4 }}>{children}</label>
}

function CheckField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, color: '#cbd5e1', padding: '6px 0' }}>
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} style={{ width: 16, height: 16, accentColor: '#6366f1' }} />
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
      return (p.code ?? '').toLowerCase().includes(q) || (p.address ?? '').toLowerCase().includes(q) || (p.asesor_nombre ?? '').toLowerCase().includes(q)
    }
    return true
  })

  function openCreate() { setEditingId(null); setForm(EMPTY_FORM); setStep(0); setFormError(null); setShowModal(true) }
  function openEdit(p: Property) {
    setEditingId(p.id)
    setForm({ ...p } as FormData)
    setStep(0); setFormError(null); setShowModal(true)
  }

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

  const f = (key: keyof FormData, value: unknown) => setForm(prev => ({ ...prev, [key]: value }))

  const total = properties.length
  const publicados = properties.filter(p => p.estado_marketing === 'publicado').length
  const sinEstado = properties.filter(p => !p.estado_marketing).length

  return (
    <div style={{ padding: '28px 32px', fontFamily: 'system-ui, sans-serif', color: '#e2e8f0', minHeight: '100vh', background: '#0f1117' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, color: '#f8fafc' }}>Captaciones</h1>
          <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: 14 }}>Portafolio de propiedades captadas</p>
        </div>
        <button onClick={openCreate} style={btnPrimary}>+ Nueva captación</button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
        {[{ label: 'Total', value: total, color: '#6366f1' }, { label: 'Publicadas', value: publicados, color: '#10b981' }, { label: 'Sin estado', value: sinEstado, color: '#f59e0b' }].map(s => (
          <div key={s.label} style={{ background: '#1e2433', borderRadius: 12, padding: '18px 22px', border: '1px solid #2d3748' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <input placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...inputStyle, flex: '1 1 200px' }} />
        <select value={filterType} onChange={e => setFilterType(e.target.value)} style={inputStyle}>
          <option value="">Todos los tipos</option>
          {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={filterEstado} onChange={e => setFilterEstado(e.target.value)} style={inputStyle}>
          <option value="all">Todos los estados</option>
          <option value="null">Sin estado</option>
          {ESTADOS_MARKETING.filter(e => e.value).map(e => <option key={String(e.value)} value={String(e.value)}>{e.label}</option>)}
        </select>
      </div>

      {/* Tabla */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#64748b' }}>Cargando...</div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#f87171' }}>Error: {error}</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#64748b' }}>
          {properties.length === 0 ? 'No hay captaciones. Crea la primera.' : 'Sin resultados.'}
        </div>
      ) : (
        <div style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid #2d3748' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: '#1e2433' }}>
            <thead>
              <tr style={{ background: '#161b27', borderBottom: '1px solid #2d3748' }}>
                {['Código', 'Tipo', 'Operación', 'Zona', 'Precio', 'M² Const.', 'Dorm.', 'Estado', 'Asesor', 'Acciones'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr key={p.id} style={{ borderBottom: '1px solid #2d3748', background: i % 2 === 0 ? '#1e2433' : '#1a1f2e' }}>
                  <td style={td}><span style={{ fontWeight: 600, color: '#a5b4fc' }}>{p.code || '—'}</span></td>
                  <td style={td}>{p.type || '—'}</td>
                  <td style={td}>{p.tipo_operacion || '—'}</td>
                  <td style={td}>{p.zone || '—'}</td>
                  <td style={{ ...td, fontWeight: 600 }}>{formatPrice(p.price_initial)}</td>
                  <td style={td}>{p.metros_construccion ? `${p.metros_construccion} m²` : '—'}</td>
                  <td style={td}>{p.dormitorios ?? '—'}</td>
                  <td style={td}>{estadoBadge(p.estado_marketing)}</td>
                  <td style={td}>{p.asesor_nombre || '—'}</td>
                  <td style={td}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => openEdit(p)} style={btnSecondary}>Editar</button>
                      <button onClick={() => handleDelete(p.id)} style={btnDanger}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal multi-step */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#1e2433', borderRadius: 16, width: '100%', maxWidth: 660, maxHeight: '92vh', overflowY: 'auto', border: '1px solid #2d3748', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}>

            {/* Header modal */}
            <div style={{ padding: '24px 28px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#f8fafc' }}>
                {editingId ? 'Editar captación' : 'Nueva captación'}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 22, cursor: 'pointer' }}>×</button>
            </div>

            {/* Steps */}
            <div style={{ padding: '20px 28px 0', display: 'flex', gap: 0 }}>
              {STEPS.map((s, i) => (
                <button key={s} onClick={() => setStep(i)} style={{
                  flex: 1, padding: '8px 4px', fontSize: 11, fontWeight: 600,
                  background: 'none', border: 'none', borderBottom: `2px solid ${step === i ? '#6366f1' : '#2d3748'}`,
                  color: step === i ? '#a5b4fc' : '#64748b', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: 0.5
                }}>{i + 1}. {s}</button>
              ))}
            </div>

            {formError && (
              <div style={{ margin: '16px 28px 0', background: '#7f1d1d', color: '#fca5a5', padding: '10px 14px', borderRadius: 8, fontSize: 14 }}>
                {formError}
              </div>
            )}

            <div style={{ padding: '24px 28px' }}>

              {/* PASO 1 — Inmueble */}
              {step === 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <Label>Código</Label>
                    <input value={form.code ?? ''} onChange={e => f('code', e.target.value)} style={inputStyle} placeholder="HBT-001" />
                  </div>
                  <div>
                    <Label>Tipo de inmueble</Label>
                    <select value={form.type ?? ''} onChange={e => f('type', e.target.value)} style={inputStyle}>
                      <option value="">Seleccionar...</option>
                      {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label>Zona / Sector</Label>
                    <input value={form.zone ?? ''} onChange={e => f('zone', e.target.value)} style={inputStyle} placeholder="Ej: Samborondón" />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <Label>Dirección *</Label>
                    <input value={form.address ?? ''} onChange={e => f('address', e.target.value)} style={inputStyle} placeholder="Dirección completa" />
                  </div>
                  <div>
                    <Label>M² Terreno</Label>
                    <input type="number" value={form.metros_terreno ?? ''} onChange={e => f('metros_terreno', e.target.value ? +e.target.value : null)} style={inputStyle} placeholder="0" />
                  </div>
                  <div>
                    <Label>M² Construcción</Label>
                    <input type="number" value={form.metros_construccion ?? ''} onChange={e => f('metros_construccion', e.target.value ? +e.target.value : null)} style={inputStyle} placeholder="0" />
                  </div>
                  <div>
                    <Label>M² Parqueo</Label>
                    <input type="number" value={form.metros_parqueo ?? ''} onChange={e => f('metros_parqueo', e.target.value ? +e.target.value : null)} style={inputStyle} placeholder="0" />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <Label>Observaciones</Label>
                    <textarea value={form.observaciones ?? ''} onChange={e => f('observaciones', e.target.value)} style={{ ...inputStyle, height: 72, resize: 'vertical' }} placeholder="Notas sobre el inmueble..." />
                  </div>
                </div>
              )}

              {/* PASO 2 — Económico */}
              {step === 1 && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <Label>Tipo de operación</Label>
                    <select value={form.tipo_operacion ?? ''} onChange={e => f('tipo_operacion', e.target.value)} style={inputStyle}>
                      <option value="">Seleccionar...</option>
                      <option value="Venta">Venta</option>
                      <option value="Alquiler">Alquiler</option>
                      <option value="Venta y Alquiler">Venta y Alquiler</option>
                    </select>
                  </div>
                  <div>
                    <Label>Precio referencial</Label>
                    <input type="number" value={form.price_initial ?? ''} onChange={e => f('price_initial', e.target.value ? +e.target.value : null)} style={inputStyle} placeholder="0" />
                  </div>
                  <div>
                    <Label>Comisión (%)</Label>
                    <input type="number" value={form.comision ?? ''} onChange={e => f('comision', e.target.value ? +e.target.value : null)} style={inputStyle} placeholder="4" />
                  </div>
                  <div>
                    <Label>Alícuota mensual ($)</Label>
                    <input type="number" value={form.alicuota ?? ''} onChange={e => f('alicuota', e.target.value ? +e.target.value : null)} style={inputStyle} placeholder="0" />
                  </div>
                  <div>
                    <Label>Validez contrato (meses)</Label>
                    <select value={form.validez_contrato ?? ''} onChange={e => f('validez_contrato', e.target.value ? +e.target.value : null)} style={inputStyle}>
                      <option value="">Seleccionar...</option>
                      <option value={3}>3 meses</option>
                      <option value={6}>6 meses</option>
                      <option value={12}>12 meses</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, justifyContent: 'flex-end' }}>
                    <CheckField label="Exclusividad" checked={!!form.exclusividad} onChange={v => f('exclusividad', v)} />
                    <CheckField label="Amoblado" checked={!!form.amoblado} onChange={v => f('amoblado', v)} />
                    <CheckField label="Entrega de llaves" checked={!!form.entrega_llaves} onChange={v => f('entrega_llaves', v)} />
                  </div>
                </div>
              )}

              {/* PASO 3 — Características */}
              {step === 2 && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <Label>Dormitorios</Label>
                    <input type="number" value={form.dormitorios ?? ''} onChange={e => f('dormitorios', e.target.value ? +e.target.value : null)} style={inputStyle} placeholder="0" />
                  </div>
                  <div>
                    <Label>Baños completos</Label>
                    <input type="number" value={form.banos_completos ?? ''} onChange={e => f('banos_completos', e.target.value ? +e.target.value : null)} style={inputStyle} placeholder="0" />
                  </div>
                  <div>
                    <Label>Medio baño</Label>
                    <input type="number" value={form.medio_bano ?? ''} onChange={e => f('medio_bano', e.target.value ? +e.target.value : null)} style={inputStyle} placeholder="0" />
                  </div>
                  <div>
                    <Label>Parqueos</Label>
                    <input type="number" value={form.parqueos ?? ''} onChange={e => f('parqueos', e.target.value ? +e.target.value : null)} style={inputStyle} placeholder="0" />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <Label>Amenidades</Label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4, marginTop: 8 }}>
                      <CheckField label="Piscina" checked={!!form.piscina} onChange={v => f('piscina', v)} />
                      <CheckField label="Gimnasio" checked={!!form.gimnasio} onChange={v => f('gimnasio', v)} />
                      <CheckField label="BBQ" checked={!!form.bbq} onChange={v => f('bbq', v)} />
                      <CheckField label="Salón de eventos" checked={!!form.salon_eventos} onChange={v => f('salon_eventos', v)} />
                      <CheckField label="Terraza" checked={!!form.terraza} onChange={v => f('terraza', v)} />
                      <CheckField label="Balcón" checked={!!form.balcon} onChange={v => f('balcon', v)} />
                    </div>
                  </div>
                </div>
              )}

              {/* PASO 4 — Propietario */}
              {step === 3 && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <Label>Nombre del propietario</Label>
                    <input value={form.propietario_nombre ?? ''} onChange={e => f('propietario_nombre', e.target.value)} style={inputStyle} placeholder="Nombre completo" />
                  </div>
                  <div>
                    <Label>C.I. / RUC</Label>
                    <input value={form.propietario_ci ?? ''} onChange={e => f('propietario_ci', e.target.value)} style={inputStyle} placeholder="0000000000" />
                  </div>
                  <div>
                    <Label>Celular</Label>
                    <input value={form.propietario_celular ?? ''} onChange={e => f('propietario_celular', e.target.value)} style={inputStyle} placeholder="09XXXXXXXX" />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <Label>Email</Label>
                    <input type="email" value={form.propietario_email ?? ''} onChange={e => f('propietario_email', e.target.value)} style={inputStyle} placeholder="correo@ejemplo.com" />
                  </div>
                  <div>
                    <Label>Asesor responsable</Label>
                    <input value={form.asesor_nombre ?? ''} onChange={e => f('asesor_nombre', e.target.value)} style={inputStyle} placeholder="Nombre del asesor" />
                  </div>
                  <div>
                    <Label>Iniciales asesor</Label>
                    <input value={form.asesor_iniciales ?? ''} onChange={e => f('asesor_iniciales', e.target.value.toUpperCase())} style={inputStyle} placeholder="MS" maxLength={3} />
                  </div>
                </div>
              )}

              {/* PASO 5 — Marketing */}
              {step === 4 && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <Label>Estado marketing</Label>
                    <select value={form.estado_marketing ?? ''} onChange={e => f('estado_marketing', (e.target.value || null) as EstadoMarketing)} style={inputStyle}>
                      <option value="">Sin estado</option>
                      {ESTADOS_MARKETING.filter(e => e.value).map(e => <option key={String(e.value)} value={String(e.value!)}>{e.label}</option>)}
                    </select>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <Label>Estado de producción</Label>
                    <div style={{ display: 'flex', gap: 24, marginTop: 8 }}>
                      <CheckField label="Grabado" checked={!!form.grabado} onChange={v => f('grabado', v)} />
                      <CheckField label="Editado" checked={!!form.editado} onChange={v => f('editado', v)} />
                      <CheckField label="Publicado" checked={!!form.publicado} onChange={v => f('publicado', v)} />
                    </div>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <Label>Notas de marketing</Label>
                    <textarea value={form.notas_marketing ?? ''} onChange={e => f('notas_marketing', e.target.value)} style={{ ...inputStyle, height: 100, resize: 'vertical' }} placeholder="Notas internas del proceso de marketing..." />
                  </div>
                </div>
              )}

            </div>

            {/* Footer modal */}
            <div style={{ padding: '0 28px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 8 }}>
                {step > 0 && <button onClick={() => setStep(s => s - 1)} style={btnSecondary}>← Anterior</button>}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setShowModal(false)} style={btnSecondary}>Cancelar</button>
                {step < STEPS.length - 1
                  ? <button onClick={() => setStep(s => s + 1)} style={btnPrimary}>Siguiente →</button>
                  : <button onClick={handleSave} disabled={saving} style={btnPrimary}>{saving ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear captación'}</button>
                }
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}
