'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import GlobalHeader from '@/components/GlobalHeader'
import LeadProfilePanel from '@/components/LeadProfilePanel'

const STAGES = [
  { id: 'lead_entrante', label: 'Lead Entrante', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
  { id: 'contacto_efectivo', label: 'Contacto Efectivo', color: 'bg-blue-100 text-blue-700 border-blue-300' },
  { id: 'aterrizaje_opciones', label: 'Aterrizaje y Opciones', color: 'bg-purple-100 text-purple-700 border-purple-300' },
  { id: 'seguimiento_abierto', label: 'Seguimiento Abierto (Infinito)', color: 'bg-orange-100 text-orange-700 border-orange-300' },
  { id: 'visita_agendada', label: 'Visita Agendada', color: 'bg-indigo-100 text-indigo-700 border-indigo-300' },
  { id: 'visita_realizada', label: 'Visita Realizada', color: 'bg-cyan-100 text-cyan-700 border-cyan-300' },
  { id: 'reserva', label: 'Reserva', color: 'bg-teal-100 text-teal-700 border-teal-300' },
  { id: 'cierre_ganado', label: 'Cierre Ganado', color: 'bg-green-100 text-green-700 border-green-300' },
  { id: 'descartados_pausa', label: 'Descartados / En Pausa', color: 'bg-red-100 text-red-700 border-red-300' },
]

const PAGE_SIZE = 50

export default function VentasPage() {
  const { user } = useAuth()
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedLead, setSelectedLead] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStage, setFilterStage] = useState<string>('all')
  const [filterAsesor, setFilterAsesor] = useState<string>('all')
  const [visibleCounts, setVisibleCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    const initialCounts: Record<string, number> = {}
    STAGES.forEach(s => { initialCounts[s.id] = PAGE_SIZE })
    setVisibleCounts(initialCounts)
  }, [])

  async function fetchLeads() {
    setLoading(true)
    setError(null)
    let query = supabase.from('leads').select('*')
    if (user?.role !== 'Super Administrador') {
      query = query.or(`assigned_to.eq.${user?.email},assigned_to_name.eq.${user?.name}`)
    }
    const { data, error: fetchError } = await query.order('created_at', { ascending: false })
    if (fetchError) {
      setError(fetchError.message)
    } else {
      setLeads(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchLeads()
    const channel = supabase.channel('leads_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => {
        fetchLeads()
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [user])

  const filtered = leads.filter(l => {
    if (filterStage !== 'all' && l.sales_stage !== filterStage) return false
    if (filterAsesor !== 'all' && l.assigned_to_name !== filterAsesor) return false
    if (searchTerm) {
      const q = searchTerm.toLowerCase()
      return (l.name?.toLowerCase().includes(q) || l.phone?.toLowerCase().includes(q) || l.email?.toLowerCase().includes(q))
    }
    return true
  })

  const grouped: Record<string, any[]> = {}
  STAGES.forEach(s => { grouped[s.id] = [] })
  filtered.forEach(l => {
    const stage = l.sales_stage || 'lead_entrante'
    if (grouped[stage]) grouped[stage].push(l)
  })

  async function handleDrop(leadId: string, newStage: string) {
    const { error: updateError } = await supabase.from('leads').update({ sales_stage: newStage }).eq('id', leadId)
    if (updateError) alert('Error al mover lead: ' + updateError.message)
    else fetchLeads()
  }

  function handleDragOver(e: React.DragEvent) { e.preventDefault() }

  function handleDragStart(e: React.DragEvent, leadId: string) {
    e.dataTransfer.setData('leadId', leadId)
  }

  function handleDropZone(e: React.DragEvent, newStage: string) {
    e.preventDefault()
    const leadId = e.dataTransfer.getData('leadId')
    if (leadId) handleDrop(leadId, newStage)
  }

  const asesores = Array.from(new Set(leads.map(l => l.assigned_to_name).filter(Boolean)))

  if (loading) return <div className="min-h-screen bg-[#EBEAE6] flex items-center justify-center"><p className="text-[#1A1A1A]/50">Cargando pipeline...</p></div>
  if (error) return <div className="min-h-screen bg-[#EBEAE6] flex items-center justify-center"><p className="text-red-500">Error: {error}</p></div>

  return (
    <div className="min-h-screen bg-[#EBEAE6]">
      <GlobalHeader />
      <main className="p-6">
        <div className="max-w-[1600px] mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-[#1E2D40] tracking-tighter">Pipeline de <span className="underline decoration-2 underline-offset-4">Ventas</span></h1>
              <p className="text-xs text-[#1A1A1A]/50 mt-1">{filtered.length} leads en el pipeline</p>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-[#1A1A1A]/5 p-4">
            <div className="flex gap-3 flex-wrap">
              <input type="text" placeholder="Buscar por nombre, teléfono o email..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                className="flex-1 min-w-[200px] px-4 py-2.5 bg-[#EBEAE6]/50 border border-[#1A1A1A]/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E2D40]/20" />
              <select value={filterStage} onChange={e => setFilterStage(e.target.value)}
                className="px-4 py-2.5 bg-[#EBEAE6]/50 border border-[#1A1A1A]/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E2D40]/20">
                <option value="all">Todas las etapas</option>
                {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
              <select value={filterAsesor} onChange={e => setFilterAsesor(e.target.value)}
                className="px-4 py-2.5 bg-[#EBEAE6]/50 border border-[#1A1A1A]/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E2D40]/20">
                <option value="all">Todos los asesores</option>
                {asesores.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4">
            {STAGES.map(stage => {
              const stageLeads = grouped[stage.id] || []
              const visibleCount = visibleCounts[stage.id] || PAGE_SIZE
              const visibleLeads = stageLeads.slice(0, visibleCount)
              const hasMore = stageLeads.length > visibleCount

              return (
                <div key={stage.id} className="flex-shrink-0 w-80">
                  <div className={`rounded-2xl border-2 ${stage.color} p-4 h-full min-h-[600px] flex flex-col`}
                    onDragOver={handleDragOver} onDrop={e => handleDropZone(e, stage.id)}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-black text-sm uppercase tracking-wide">{stage.label}</h3>
                      <span className="text-xs font-bold px-2 py-1 rounded-full bg-white/50">{stageLeads.length}</span>
                    </div>

                    <div className="space-y-2 flex-1 overflow-y-auto">
                      {visibleLeads.map(lead => (
                        <div key={lead.id} draggable onDragStart={e => handleDragStart(e, lead.id)} onClick={() => setSelectedLead(lead)}
                          className="bg-white rounded-xl p-3 shadow-sm border border-[#1A1A1A]/10 hover:shadow-md transition-shadow cursor-pointer">
                          <p className="font-bold text-sm text-[#1E2D40] truncate">{lead.name || 'Sin nombre'}</p>
                          <p className="text-xs text-[#1A1A1A]/60 truncate mt-1">{lead.phone || lead.email || 'Sin contacto'}</p>
                          {lead.assigned_to_name && (
                            <p className="text-xs text-[#1A1A1A]/40 mt-2">{lead.assigned_to_name}</p>
                          )}
                        </div>
                      ))}

                      {hasMore && (
                        <button onClick={() => setVisibleCounts(prev => ({ ...prev, [stage.id]: visibleCount + PAGE_SIZE }))}
                          className="w-full py-2 text-xs font-bold text-[#1E2D40] bg-white/50 rounded-lg hover:bg-white transition-colors">
                          Ver más ({stageLeads.length - visibleCount} restantes)
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </main>

      {selectedLead && (
        <LeadProfilePanel lead={selectedLead} onClose={() => { setSelectedLead(null); fetchLeads() }} mode="edit" />
      )}
    </div>
  )
}
