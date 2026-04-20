'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import GlobalHeader from '@/components/GlobalHeader'
import { Camera, Mail, Phone, Briefcase, Edit3, X, TrendingUp, Users, Target, Loader2, CheckCircle2, AlertCircle, User, Building2, XCircle, CalendarX, CalendarCheck } from 'lucide-react'

const CLOUDINARY_CLOUD = 'dl64kkfbp'
const CLOUDINARY_PRESET = 'habitat_properties'

interface UserProfile {
  id: string
  name: string
  email: string
  role: string
  initials: string
  bio?: string
  avatar_url?: string
  phone?: string
  job_title?: string
}

interface EditForm {
  name: string
  bio: string
  phone: string
  job_title: string
}

interface Stats {
  total_leads: number
  conversiones: number
  tareas_pendientes: number
  captaciones: number
  descartados: number
  visitas_fallidas: number
  visitas_exitosas: number
}

type ToastType = 'success' | 'error'
interface Toast { msg: string; type: ToastType }

function Avatar({ url, initials, size = 'lg' }: { url?: string | null; initials: string; size?: 'sm' | 'lg' }) {
  const dim = size === 'lg' ? 'w-36 h-36 text-4xl' : 'w-16 h-16 text-xl'
  if (url) {
    return <img src={url} alt="Avatar" className={`${dim} rounded-full object-cover object-top border-4 border-white shadow-xl`} />
  }
  return (
    <div className={`${dim} rounded-full bg-gradient-to-br from-[#1E2D40] to-[#3a5270] flex items-center justify-center text-white font-bold border-4 border-white shadow-xl`}>
      {initials}
    </div>
  )
}

export default function PerfilPage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [stats, setStats] = useState<Stats>({
    total_leads: 0, conversiones: 0, tareas_pendientes: 0,
    captaciones: 0, descartados: 0, visitas_fallidas: 0, visitas_exitosas: 0
  })
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState<EditForm>({ name: '', bio: '', phone: '', job_title: '' })
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<Toast | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const loadProfile = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data } = await supabase
      .from('users')
      .select('id, name, email, role, initials, bio, avatar_url, phone, job_title')
      .eq('id', user.id)
      .single()
    if (data) setProfile(data as UserProfile)
    setLoading(false)
  }, [user])

  const loadStats = useCallback(async () => {
    if (!user) return

    const isSuperAdmin = user.role === 'Super Administrador'

    const baseQuery = () => isSuperAdmin
      ? supabase.from('leads').select('*', { count: 'exact', head: true })
      : supabase.from('leads').select('*', { count: 'exact', head: true }).eq('assigned_to_name', user.name)

    const [
      { count: total },
      { count: conv },
      { count: pending },
      { count: descartados },
      { count: visitas_fallidas },
      { count: visitas_exitosas },
      { count: captaciones }
    ] = await Promise.all([
      baseQuery(),
      baseQuery().eq('status', 'Cierre Ganado'),
      baseQuery().not('status', 'in', '("Cierre Ganado","Descartados / En Pausa","Visita Realizada")'),
      baseQuery().eq('status', 'Descartados / En Pausa'),
      baseQuery().eq('status', 'Visita Agendada'),
      baseQuery().eq('status', 'Visita Realizada'),
      isSuperAdmin
        ? supabase.from('properties').select('*', { count: 'exact', head: true })
        : supabase.from('properties').select('*', { count: 'exact', head: true }).eq('asesor_nombre', user.name)
    ])

    setStats({
      total_leads: total ?? 0,
      conversiones: conv ?? 0,
      tareas_pendientes: pending ?? 0,
      captaciones: captaciones ?? 0,
      descartados: descartados ?? 0,
      visitas_fallidas: visitas_fallidas ?? 0,
      visitas_exitosas: visitas_exitosas ?? 0,
    })
  }, [user])

  useEffect(() => {
    if (user) { loadProfile(); loadStats() }
  }, [user, loadProfile, loadStats])

  const openModal = () => {
    if (!profile) return
    setForm({ name: profile.name ?? '', bio: profile.bio ?? '', phone: profile.phone ?? '', job_title: profile.job_title ?? '' })
    setAvatarFile(null)
    setAvatarPreview(null)
    setModalOpen(true)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { showToast('La imagen debe pesar menos de 5 MB', 'error'); return }
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const handleSave = async () => {
    if (!user || !profile) return
    setSaving(true)
    let avatar_url = profile.avatar_url ?? null

    if (avatarFile) {
      const formData = new FormData()
      formData.append('file', avatarFile)
      formData.append('upload_preset', CLOUDINARY_PRESET)
      formData.append('public_id', `habitat/asesores/${user.id}_${Date.now()}`)
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`,
        { method: 'POST', body: formData }
      )
      const result = await res.json()
      if (!result.secure_url) {
        showToast('Error al subir la imagen.', 'error')
        setSaving(false)
        return
      }
      avatar_url = result.secure_url
    }

    const updates: Partial<UserProfile & { full_name?: string }> = {
      name: form.name.trim() || profile.name,
      bio: form.bio.trim() || null,
      phone: form.phone.trim() || null,
      job_title: form.job_title.trim() || null,
      avatar_url,
    }

    const { error } = await supabase.from('users').update(updates).eq('id', user.id)

    if (error) {
      showToast('Error al guardar los cambios.', 'error')
    } else {
      setProfile(prev => prev ? { ...prev, ...updates } as UserProfile : prev)
      setModalOpen(false)
      showToast('Perfil actualizado correctamente.', 'success')
    }
    setSaving(false)
  }

  const showToast = (msg: string, type: ToastType) => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  if (loading) {
    return (
      <>
        <GlobalHeader />
        <div className="min-h-screen bg-[#EBEAE6] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#1E2D40] animate-spin" />
        </div>
      </>
    )
  }

  if (!profile) {
    return (
      <>
        <GlobalHeader />
        <div className="min-h-screen bg-[#EBEAE6] flex items-center justify-center text-[#1E2D40] font-medium">
          No se encontró el perfil.
        </div>
      </>
    )
  }

  const previewName = form.name.trim() || profile.name
  const previewBio = form.bio.trim() || ''
  const previewJob = form.job_title.trim() || profile.job_title || profile.role
  const previewAvatar = avatarPreview || profile.avatar_url

  return (
    <>
      <GlobalHeader />

      <div className={`fixed top-20 right-6 z-[200] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl text-sm font-semibold transition-all duration-500 ${toast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'} ${toast?.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`} aria-live="polite">
        {toast?.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
        {toast?.msg}
      </div>

      <div className="min-h-screen bg-[#EBEAE6]">
        <div className="h-48 md:h-56 w-full bg-gradient-to-r from-[#1E2D40] via-[#2d4460] to-[#1E2D40] relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #fff 1px, transparent 1px), radial-gradient(circle at 80% 20%, #fff 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        </div>

        <div className="max-w-3xl mx-auto px-4 -mt-20 pb-12">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className="px-8 pt-0 pb-8">
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-1 mt-[-72px]">
                  <div className="rounded-full ring-4 ring-white shadow-2xl">
                    <Avatar url={profile.avatar_url} initials={profile.initials} size="lg" />
                  </div>
                </div>
                <h1 className="mt-4 text-2xl md:text-3xl font-bold text-[#1E2D40] tracking-tight leading-tight">{profile.name}</h1>
                <p className="mt-1 text-sm font-semibold text-[#1E2D40]/60 uppercase tracking-widest">{profile.job_title || profile.role}</p>
                {profile.bio && <p className="mt-3 text-[#1E2D40]/75 text-sm max-w-md leading-relaxed">{profile.bio}</p>}

                {/* Stats pills — 4 columnas x 2 filas */}
                <div className="mt-6 grid grid-cols-4 gap-2 w-full">
                  <StatPill icon={<Users className="w-3 h-3" />} value={stats.total_leads} label="Leads" color="text-[#1E2D40]" />
                  <StatPill icon={<TrendingUp className="w-3 h-3" />} value={stats.conversiones} label="Cierres" color="text-emerald-600" />
                  <StatPill icon={<Target className="w-3 h-3" />} value={stats.tareas_pendientes} label="En gestión" color="text-amber-500" />
                  <StatPill icon={<Building2 className="w-3 h-3" />} value={stats.captaciones} label="Captaciones" color="text-indigo-600" />
                  <StatPill icon={<XCircle className="w-3 h-3" />} value={stats.descartados} label="Descartados" color="text-red-500" />
                  <StatPill icon={<CalendarX className="w-3 h-3" />} value={stats.visitas_fallidas} label="V. fallidas" color="text-orange-500" />
                  <StatPill icon={<CalendarCheck className="w-3 h-3" />} value={stats.visitas_exitosas} label="V. exitosas" color="text-green-600" />
                </div>

                <button onClick={openModal} className="mt-6 inline-flex items-center gap-2 px-7 py-3 bg-[#1E2D40] text-white text-sm font-semibold rounded-full shadow-md hover:bg-[#2d4460] active:scale-95 transition-all duration-200">
                  <Edit3 className="w-4 h-4" /> Editar perfil
                </button>
              </div>
            </div>

            <div className="border-t border-[#EBEAE6]" />

            <div className="px-8 py-6 flex flex-wrap justify-center gap-6">
              <InfoChip icon={<Mail className="w-4 h-4" />} label={profile.email} />
              {profile.phone && <InfoChip icon={<Phone className="w-4 h-4" />} label={profile.phone} />}
              <InfoChip icon={<Briefcase className="w-4 h-4" />} label={profile.role} />
            </div>
          </div>

          {/* Stat cards detalle */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard icon={<Users className="w-6 h-6 text-[#1E2D40]" />} value={stats.total_leads} label="Leads totales" bg="bg-white" accent="bg-[#1E2D40]/10" />
            <StatCard icon={<TrendingUp className="w-6 h-6 text-emerald-600" />} value={stats.conversiones} label="Cierres ganados" bg="bg-white" accent="bg-emerald-50" />
            <StatCard icon={<Target className="w-6 h-6 text-amber-500" />} value={stats.tareas_pendientes} label="Gestiones activas" bg="bg-white" accent="bg-amber-50" />
            <StatCard icon={<Building2 className="w-6 h-6 text-indigo-600" />} value={stats.captaciones} label="Captaciones propias" bg="bg-white" accent="bg-indigo-50" />
            <StatCard icon={<XCircle className="w-6 h-6 text-red-500" />} value={stats.descartados} label="Leads descartados" bg="bg-white" accent="bg-red-50" />
            <StatCard icon={<CalendarX className="w-6 h-6 text-orange-500" />} value={stats.visitas_fallidas} label="Visitas fallidas" bg="bg-white" accent="bg-orange-50" />
            <StatCard icon={<CalendarCheck className="w-6 h-6 text-green-600" />} value={stats.visitas_exitosas} label="Visitas exitosas" bg="bg-white" accent="bg-green-50" />
          </div>
        </div>
      </div>

      {/* MODAL */}
      <div className={`fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${modalOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => !saving && setModalOpen(false)} />

      <div className={`fixed inset-y-0 right-0 z-[110] w-full max-w-2xl bg-white shadow-2xl flex flex-col transition-transform duration-400 ease-in-out ${modalOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#EBEAE6] bg-[#1E2D40]">
          <h2 className="text-white font-bold text-lg tracking-tight">Editar perfil</h2>
          <button onClick={() => !saving && setModalOpen(false)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col lg:flex-row h-full">
            <div className="lg:w-[42%] bg-[#EBEAE6] flex flex-col items-center justify-center p-8 gap-4 min-h-[260px]">
              <p className="text-xs font-bold uppercase tracking-widest text-[#1E2D40]/50 mb-2">Vista previa</p>
              <div className="relative group">
                {previewAvatar
                  ? <img src={previewAvatar} alt="preview" className="w-24 h-24 rounded-full object-cover object-center border-4 border-white shadow-lg" />
                  : <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#1E2D40] to-[#3a5270] flex items-center justify-center text-white text-2xl font-bold border-4 border-white shadow-lg">{profile.initials}</div>
                }
                <button type="button" onClick={() => fileRef.current?.click()} className="absolute inset-0 rounded-full bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera className="w-6 h-6 text-white" />
                  <span className="text-[10px] text-white font-semibold mt-1">Cambiar</span>
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </div>
              <div className="text-center mt-1">
                <p className="font-bold text-[#1E2D40] text-lg leading-tight">{previewName || profile.name}</p>
                <p className="text-xs text-[#1E2D40]/60 font-semibold uppercase tracking-widest mt-0.5">{previewJob}</p>
                {previewBio && <p className="text-xs text-[#1E2D40]/70 mt-2 max-w-[200px] leading-relaxed line-clamp-3">{previewBio}</p>}
              </div>
              <button type="button" onClick={() => fileRef.current?.click()} className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#1E2D40] bg-white rounded-full border border-[#1E2D40]/20 hover:border-[#1E2D40] transition-colors shadow-sm">
                <Camera className="w-3.5 h-3.5" />
                {avatarFile ? 'Cambiar imagen' : 'Subir foto de perfil'}
              </button>
              {avatarFile && <p className="text-[10px] text-[#1E2D40]/50 -mt-1">{avatarFile.name}</p>}
            </div>

            <div className="flex-1 p-6 md:p-8 space-y-6">
              <div>
                <label className="block text-xs font-bold text-[#1E2D40]/60 uppercase tracking-widest mb-1.5">Correo electrónico</label>
                <div className="flex items-center gap-3 px-4 py-3 bg-[#EBEAE6] rounded-xl border border-transparent">
                  <Mail className="w-4 h-4 text-[#1E2D40]/40 shrink-0" />
                  <span className="text-sm text-[#1E2D40]/60 font-medium">{profile.email}</span>
                  <span className="ml-auto text-[10px] bg-[#1E2D40]/10 text-[#1E2D40]/50 px-2 py-0.5 rounded-full font-semibold">Solo lectura</span>
                </div>
              </div>
              <FormField icon={<User className="w-4 h-4" />} label="Nombre completo" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="Tu nombre completo" />
              <FormField icon={<Briefcase className="w-4 h-4" />} label="Cargo / Título" value={form.job_title} onChange={v => setForm(f => ({ ...f, job_title: v }))} placeholder="Ej: Asesor Inmobiliario Senior" />
              <FormField icon={<Phone className="w-4 h-4" />} label="Teléfono" value={form.phone} onChange={v => setForm(f => ({ ...f, phone: v }))} placeholder="+593 9X XXX XXXX" type="tel" />
              <div>
                <label className="block text-xs font-bold text-[#1E2D40]/60 uppercase tracking-widest mb-1.5">Biografía</label>
                <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} placeholder="Cuéntale a tu equipo sobre ti..." rows={4} maxLength={280} className="w-full px-4 py-3 bg-[#EBEAE6] rounded-xl border border-transparent focus:border-[#1E2D40]/30 focus:bg-white focus:outline-none text-sm text-[#1E2D40] placeholder-[#1E2D40]/35 transition-all resize-none" />
                <p className="text-right text-[10px] text-[#1E2D40]/40 mt-1">{form.bio.length}/280</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-[#EBEAE6] px-6 py-4 flex items-center justify-end gap-3 bg-white">
          <button onClick={() => !saving && setModalOpen(false)} disabled={saving} className="px-5 py-2.5 text-sm font-semibold text-[#1E2D40]/60 hover:text-[#1E2D40] transition-colors rounded-xl hover:bg-[#EBEAE6]">
            Cancelar
          </button>
          <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 px-7 py-2.5 bg-[#1E2D40] text-white text-sm font-semibold rounded-xl shadow hover:bg-[#2d4460] active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</> : <>Guardar cambios</>}
          </button>
        </div>
      </div>
    </>
  )
}

function StatPill({ icon, value, label, color }: { icon: React.ReactNode; value: number; label: string; color: string }) {
  return (
    <div className="flex flex-col items-center py-3 px-1 gap-0.5 border border-[#EBEAE6] rounded-2xl">
      <span className={`flex items-center gap-1 text-lg font-bold ${color}`}>{value}</span>
      <span className="text-[9px] text-[#1E2D40]/50 font-medium text-center leading-tight">{label}</span>
    </div>
  )
}

function StatCard({ icon, value, label, bg, accent }: { icon: React.ReactNode; value: number; label: string; bg: string; accent: string }) {
  return (
    <div className={`${bg} rounded-2xl shadow-sm p-5 flex items-center gap-4`}>
      <div className={`${accent} w-12 h-12 rounded-xl flex items-center justify-center shrink-0`}>{icon}</div>
      <div>
        <p className="text-2xl font-bold text-[#1E2D40]">{value}</p>
        <p className="text-xs text-[#1E2D40]/55 font-medium leading-snug">{label}</p>
      </div>
    </div>
  )
}

function InfoChip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-[#1E2D40]/65 font-medium">
      <span className="text-[#1E2D40]/40">{icon}</span>
      {label}
    </div>
  )
}

function FormField({ icon, label, value, onChange, placeholder, type = 'text' }: { icon: React.ReactNode; label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div>
      <label className="block text-xs font-bold text-[#1E2D40]/60 uppercase tracking-widest mb-1.5">{label}</label>
      <div className="flex items-center gap-3 px-4 py-3 bg-[#EBEAE6] rounded-xl border border-transparent focus-within:border-[#1E2D40]/30 focus-within:bg-white transition-all">
        <span className="text-[#1E2D40]/40 shrink-0">{icon}</span>
        <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="flex-1 bg-transparent text-sm text-[#1E2D40] placeholder-[#1E2D40]/35 focus:outline-none" />
      </div>
    </div>
  )
}
