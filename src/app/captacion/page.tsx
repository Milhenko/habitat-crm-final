'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

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
}

type FormData = Omit<Property, 'id'>

const EMPTY_FORM: FormData = {
  code: '',
  type: '',
  zone: '',
  address: '',
  price_initial: null,
  estado_marketing: null,
  grabado: false,
  editado: false,
  publicado: false,
  notas_marketing: '',
  asesor_id: null,
  asesor_nombre: '',
  asesor_iniciales: '',
}

const TIPOS = ['Casa', 'Departamento', 'Terreno', 'Local Comercial', 'Oficina', 'Bodega', 'Otro']
const ESTADOS_MARKETING: { value: EstadoMarketing; label: string; color: string }[] = [
  { value: null,        label: 'Sin estado',  color: '#6b7280' },
  { value: 'grabado',   label: 'Grabado',     color: '#f59e0b' },
  { value: 'editado',   label: 'Editado',     color: '#3b82f6' },
  { value: 'publicado', label: 'Publicado',   color: '#10b981' },
]

function estadoBadge(estado: EstadoMarketing) {
  const e = ESTADOS_MARKETING.find(x => x.value === estado) ?? ESTADOS_MARKETING[0]
  return (
    <span style={{
      background: e.color + '22',
      color: e.color,
      border: `1px solid ${e.color}55`,
      borderRadius: 6,
      padding: '2px 10px',
      fontSize: 12,
      fontWeight: 600,
      letterSpacing: 0.3,
    }}>
      {e.label}
    </span>
  )
}

function formatPrice(n: number | null) {
  if (!n) return '—'
  return '$' + n.toLocaleString('es-EC')
}

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function CaptacionPage() {

  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormData>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const [filterType, setFilterType] = useState('')
  const [filterEstado, setFilterEstado] = useState<string>('all')
  const [filterZone, setFilterZone] = useState('')
  const [search, setSearch] = useState('')

  async function fetchProperties() {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('code', { ascending: true })
    if (error) setError(error.message)
    else setProperties(data as Property[])
    setLoading(false)
  }

  useEffect(() => { fetchProperties() }, [])

  const filtered = properties.filter(p => {
    if (filterType && p.type !== filterType) return false
    if (filterEstado !== 'all' && (p.estado_marketing ?? 'null') !== (filterEstado === 'null' ? 'null' : filterEstado)) return false
    if (filterZone && !(p.zone ?? '').toLowerCase().includes(filterZone.toLowerCase())) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        (p.code ?? '').toLowerCase().includes(q) ||
        (p.address ?? '').toLowerCase().includes(q) ||
        (p.asesor_nombre ?? '').toLowerCase().includes(q)
      )
    }
    return true
  })

  function openCreate() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setFormError(null)
    setShowModal(true)
  }

  function openEdit(p: Property) {
    setEditingId(p.id)
    setForm({
      code: p.code ?? '',
      type: p.type ?? '',
      zone: p.zone ?? '',
      address: p.address ?? '',
      price_initial: p.price_initial,
      estado_marketing: p.estado_marketing,
      grabado: p.grabado ?? false,
      editado: p.editado ?? false,
      publicado: p.publicado ?? false,
      notas_marketing: p.notas_marketing ?? '',
      asesor_id: p.asesor_id,
      asesor_nombre: p.asesor_nombre ?? '',
      asesor_iniciales: p.asesor_iniciales ?? '',
    })
    setFormError(null)
    setShowModal(true)
  }

  async function handleSave() {
    if (!form.address?.trim()) {
      setFormError('La dirección es obligatoria.')
      return
    }
    setSaving(true)
    setFormError(null)
    const payload = {
      ...form,
      price_initial: form.price_initial ? Number(form.price_initial) : null,
    }
    const { error } = editingId
      ? await supabase.from('properties').update(payload).eq('id', editingId)
      : await supabase.from('properties').insert(payload)
    if (error) setFormError(error.message)
    else { setShowModal(false); fetchProperties() }
    setSaving(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar esta captación? Esta acción no se puede deshacer.')) return
    await supabase.from('properties').delete().eq('id', id)
    fetchProperties()
  }

  const total = properties.length
  const publicados = properties.filter(p => p.estado_marketing === 'publicado').length
  const sinEstado = properties.filter(p => !p.estado_marketing).length

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: '#0f1117',
    border: '1px solid #2d3748',
    borderRadius: 8,
    padding: '9px 12px',
    color: '#e2e8f0',
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box',
  }

  const td: React.CSSProperties = {
    padding: '11px 16px',
    fontSize: 14,
    verticalAlign: 'middle',
    whiteSpace: 'nowrap',
  }

  const btnPrimary: React.CSSProperties = {
    background: '#6366f1',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '9px 18px',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  }

  const btnSecondary: React.CSSProperties = {
    background: '#2d3748',
    color: '#cbd5e1',
    border: '1px solid #3d4a5c',
    borderRadius: 8,
    padding: '7px 14px',
    fontSize: 13,
    cursor: 'pointer',
  }

  const btnDanger: React.CSSProperties = {
    background: '#7f1d1d22',
    color: '#f87171',
    border: '1px solid #7f1d1d55',
    borderRadius: 8,
    padding: '7px 14px',
    fontSize: 13,
    cursor: 'pointer',
  }

  return (
    <div style={{ padding: '28px 32px', fontFamily: 'system-ui, sans-serif', color: '#e2e8f0', minHeight: '100vh', background: '#0f1117' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, color: '#f8fafc' }}>Captaciones</h1>
          <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: 14 }}>Portafolio de propiedades captadas</p>
        </div>
        <button onClick={openCreate} style={btnPrimary}>+ Nueva captación</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Total captaciones', value: total,      color: '#6366f1' },
          { label: 'Publicadas',        value: publicados, color: '#10b981' },
          { label: 'Sin estado',        value: sinEstado,  color: '#f59e0b' },
        ].map(s => (
          <div key={s.label} style={{ background: '#1e2433', borderRadius: 12, padding: '18px 22px', border: '1px solid #2d3748' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <input placeholder="Buscar por código, dirección, asesor..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...inputStyle, flex: '1 1 220px' }} />
        <select value={filterType} onChange={e => setFilterType(e.target.value)} style={inputStyle}>
          <option value="">Todos los tipos</option>
          {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={filterEstado} onChange={e => setFilterEstado(e.target.value)} style={inputStyle}>
          <option value="all">Todos los estados</option>
          <option value="null">Sin estado</option>
          {ESTADOS_MARKETING.filter(e => e.value).map(e => (
            <option key={e.value} value={e.value!}>{e.label}</option>
          ))}
        </select>
        <input placeholder="Filtrar por zona..." value={filterZone} onChange={e => setFilterZone(e.target.value)} style={{ ...inputStyle, width: 160 }} />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#64748b' }}>Cargando captaciones...</div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#f87171' }}>Error: {error}</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#64748b' }}>
          {properties.length === 0 ? 'No hay captaciones registradas. Crea la primera.' : 'Sin resultados para los filtros aplicados.'}
        </div>
      ) : (
        <div style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid #2d3748' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: '#1e2433' }}>
            <thead>
              <tr style={{ background: '#161b27', borderBottom: '1px solid #2d3748' }}>
                {['Código', 'Tipo', 'Zona', 'Dirección', 'Precio inicial', 'Estado marketing', 'Asesor', 'Notas', 'Acciones'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr key={p.id} style={{ borderBottom: '1px solid #2d3748', background: i % 2 === 0 ? '#1e2433' : '#1a1f2e' }}>
                  <td style={td}><span style={{ fontWeight: 600, color: '#a5b4fc' }}>{p.code || '—'}</span></td>
                  <td style={td}>{p.type || '—'}</td>
                  <td style={td}>{p.zone || '—'}</td>
                  <td style={{ ...td, maxWidth: 200 }}>{p.address || '—'}</td>
                  <td style={{ ...td, fontWeight: 600 }}>{formatPrice(p.price_initial)}</td>
                  <td style={td}>{estadoBadge(p.estado_marketing)}</td>
                  <td style={td}>
                    {p.asesor_nombre
                      ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ background: '#6366f1', color: '#fff', borderRadius: '50%', width: 26, height: 26, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>
                            {p.asesor_iniciales || p.asesor_nombre.slice(0,2).toUpperCase()}
                          </span>
                          {p.asesor_nombre}
                        </span>
                      : '—'}
                  </td>
                  <td style={{ ...td, maxWidth: 160, color: '#94a3b8', fontSize: 13 }}>
                    {p.notas_marketing ? p.notas_marketing.slice(0, 40) + (p.notas_marketing.length > 40 ? '…' : '') : '—'}
                  </td>
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

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#1e2433', borderRadius: 16, padding: 32, width: '100%', maxWidth: 620, maxHeight: '90vh', overflowY: 'auto', border: '1px solid #2d3748', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#f8fafc' }}>
                {editingId ? 'Editar captación' : 'Nueva captación'}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 22, cursor: 'pointer', lineHeight: 1 }}>×</button>
            </div>

            {formError && (
              <div style={{ background: '#7f1d1d', color: '#fca5a5', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 14 }}>
                {formError}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 6, textTransform: 'uppercase' }}>Código</label>
                <input value={form.code ?? ''} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} style={inputStyle} placeholder="HBT-001" />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 6, textTransform: 'uppercase' }}>Tipo</label>
                <select value={form.type ?? ''} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} style={inputStyle}>
                  <option value="">Seleccionar...</option>
                  {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 6, textTransform: 'uppercase' }}>Zona</label>
                <input value={form.zone ?? ''} onChange={e => setForm(f => ({ ...f, zone: e.target.value }))} style={inputStyle} placeholder="Ej: Samborondón" />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 6, textTransform: 'uppercase' }}>Precio inicial</label>
                <input type="number" value={form.price_initial ?? ''} onChange={e => setForm(f => ({ ...f, price_initial: e.target.value ? Number(e.target.value) : null }))} style={inputStyle} placeholder="0" />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 6, textTransform: 'uppercase' }}>Dirección *</label>
                <input value={form.address ?? ''} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} style={inputStyle} placeholder="Dirección completa" />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 6, textTransform: 'uppercase' }}>Estado marketing</label>
                <select value={form.estado_marketing ?? ''} onChange={e => setForm(f => ({ ...f, estado_marketing: (e.target.value || null) as EstadoMarketing }))} style={inputStyle}>
                  <option value="">Sin estado</option>
                  {ESTADOS_MARKETING.filter(e => e.value).map(e => (
                    <option key={e.value} value={e.value!}>{e.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 6, textTransform: 'uppercase' }}>Asesor nombre</label>
                <input value={form.asesor_nombre ?? ''} onChange={e => setForm(f => ({ ...f, asesor_nombre: e.target.value }))} style={inputStyle} placeholder="Nombre del asesor" />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 6, textTransform: 'uppercase' }}>Asesor iniciales</label>
                <input value={form.asesor_iniciales ?? ''} onChange={e => setForm(f => ({ ...f, asesor_iniciales: e.target.value.toUpperCase() }))} style={inputStyle} placeholder="MR" maxLength={3} />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 6, textTransform: 'uppercase' }}>Notas marketing</label>
                <textarea value={form.notas_marketing ?? ''} onChange={e => setForm(f => ({ ...f, notas_marketing: e.target.value }))} style={{ ...inputStyle, height: 80, resize: 'vertical' }} placeholder="Notas internas..." />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 10, textTransform: 'uppercase' }}>Estado producción</label>
                <div style={{ display: 'flex', gap: 20 }}>
                  {(['grabado', 'editado', 'publicado'] as const).map(key => (
                    <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
                      <input type="checkbox" checked={!!form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.checked }))} style={{ width: 16, height: 16, accentColor: '#6366f1' }} />
                      <span style={{ textTransform: 'capitalize', color: '#cbd5e1' }}>{key}</span>
                    </label>
                  ))}
                </div>
              </div>

            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 28 }}>
              <button onClick={() => setShowModal(false)} style={btnSecondary}>Cancelar</button>
              <button onClick={handleSave} disabled={saving} style={btnPrimary}>
                {saving ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear captación'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}