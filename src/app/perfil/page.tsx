'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import GlobalHeader from '@/components/GlobalHeader'
import {
  Camera, Mail, Phone, Briefcase, Edit3, X,
  TrendingUp, Users, Target, Loader2, CheckCircle2,
  AlertCircle, User
} from 'lucide-react'

/* ─────────────────────────── types ─────────────────────────── */
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
}

type ToastType = 'success' | 'error'
interface Toast { msg: string; type: ToastType }

/* ─────────────────────────── helpers ───────────────────────── */
function Avatar({
  url, initials, size = 'lg'
}: { url?: string | null; initials: string; size?: 'sm' | 'lg' }) {
  const dim = size === 'lg' ? 'w-36 h-36 text-4xl' : 'w-16 h-16 text-xl'
  if (url) {
    return (
      <img
        src={url}
        alt="Avatar"
        className={`${dim} rounded-full object-cover border-4 border-white shadow-xl`}
      />
    )
  }
  return (
    <div
      className={`${dim} rounded-full bg-gradient-to-br from-[#1E2D40] to-[#3a5270] flex items-center justify-center text-white font-bold border-4 border-white shadow-xl`}
    >
      {initials}
    </div>
  )
}

/* ═══════════════════════════ PAGE ════════════════════════════ */
export default function PerfilPage() {
  const { user } = useAuth()

  const [profile, setProfile]         = useState<UserProfile | null>(null)
  const [stats, setStats]             = useState<Stats>({ total_leads: 0, conversiones: 0, tareas_pendientes: 0 })
  const [loading, setLoading]         = useState(true)

  // modal state
  const [modalOpen, setModalOpen]     = useState(false)
  const [form, setForm]               = useState<EditForm>({ name: '', bio: '', phone: '', job_title: '' })
  const [avatarFile, setAvatarFile]   = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [saving, setSaving]           = useState(false)

  // toast
  const [toast, setToast]             = useState<Toast | null>(null)
  const fileRef                       = useRef<HTMLInputElement>(null)

  /* ── load ── */
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
    const [{ count: total }, { count: conv }, { count: pending }] = await Promise.all([
      supabase.from('leads').select('*', { count: 'exact', head: true }).eq('assigned_to', user.id),
      supabase.from('leads').select('*', { count: 'exact', head: true }).eq('assigned_to', user.id).eq('status', 'Cierre Ganado'),
      supabase.from('leads').select('*', { count: 'exact', head: true }).eq('assigned_to', user.id)
        .not('status', 'in', '("Cierre Ganado","Descartados / En Pausa")')
    ])
    setStats({ total_leads: total ?? 0, conversiones: conv ?? 0, tareas_pendientes: pending ?? 0 })
  }, [user])

  useEffect(() => { if (user) { loadProfile(); loadStats() } }, [user, loadProfile, loadStats])

  /* ── open modal ── */
  const openModal = () => {
    if (!profile) return
    setForm({
      name:      profile.name      ?? '',
      bio:       profile.bio       ?? '',
      phone:     profile.phone     ?? '',
      job_title: profile.job_title ?? '',
    })
    setAvatarFile(null)
    setAvatarPreview(null)
    setModalOpen(true)
  }

  /* ── avatar file pick ── */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      showToast('La imagen debe pesar menos de 5 MB', 'error')
      return
    }
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  /* ── save ── */
  const handleSave = async () => {
    if (!user || !profile) return
    setSaving(true)

    let avatar_url = profile.avatar_url ?? null

    // upload avatar if changed
    if (avatarFile) {
      const ext  = avatarFile.name.split('.').pop()
      const path = `${user.id}/avatar.${ext}`
      const { error: upErr } = await supabase.storage
        .from('avatars')
        .upload(path, avatarFile, { upsert: true })

      if (upErr) {
        showToast('Error al subir la imagen. Verifica el bucket de almacenamiento.', 'error')
        setSaving(false)
        return
      }

      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
      avatar_url = urlData.publicUrl
    }

    const updates: Partial<UserProfile & { full_name?: string }> = {
      name:      form.name.trim()      || profile.name,
      bio:       form.bio.trim()       || null,
      phone:     form.phone.trim()     || null,
      job_title: form.job_title.trim() || null,
      avatar_url,
    }

    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id)

    if (error) {
      showToast('Error al guardar los cambios.', 'error')
    } else {
      setProfile(prev => prev ? { ...prev, ...updates } as UserProfile : prev)
      setModalOpen(false)
      showToast('Perfil actualizado correctamente.', 'success')
    }
    setSaving(false)
  }

  /* ── toast helper ── */
  const showToast = (msg: string, type: ToastType) => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  /* ── loading screen ── */
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

  /* ── preview values (used in modal preview) ── */
  const previewName    = form.name.trim()      || profile.name
  const previewBio     = form.bio.trim()       || ''
  const previewJob     = form.job_title.trim() || profile.job_title || profile.role
  const previewAvatar  = avatarPreview || profile.avatar_url

  /* ════════════════════ RENDER ════════════════════ */
  return (
    <>
      <GlobalHeader />

      {/* ── Toast ── */}
      <div
        className={`
          fixed top-20 right-6 z-[200] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl
          text-sm font-semibold transition-all duration-500
          ${toast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}
          ${toast?.type === 'success'
            ? 'bg-emerald-500 text-white'
            : 'bg-red-500 text-white'}
        `}
        aria-live="polite"
      >
        {toast?.type === 'success'
          ? <CheckCircle2 className="w-5 h-5 shrink-0" />
          : <AlertCircle  className="w-5 h-5 shrink-0" />}
        {toast?.msg}
      </div>

      {/* ── Background ── */}
      <div className="min-h-screen bg-[#EBEAE6]">

        {/* ── Cover strip ── */}
        <div className="h-48 md:h-56 w-full bg-gradient-to-r from-[#1E2D40] via-[#2d4460] to-[#1E2D40] relative overflow-hidden">
          {/* subtle pattern */}
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #fff 1px, transparent 1px), radial-gradient(circle at 80% 20%, #fff 1px, transparent 1px)', backgroundSize: '60px 60px' }}
          />
        </div>

        {/* ── Profile card ── */}
        <div className="max-w-3xl mx-auto px-4 -mt-20 pb-12">

          {/* Header Card */}
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">

            {/* Avatar + main info */}
            <div className="px-8 pt-0 pb-8">
              <div className="flex flex-col items-center text-center">

                {/* Avatar ring */}
                <div className="relative -mt-0 translate-y-0 mb-1 mt-[-72px]">
                  <div className="rounded-full ring-4 ring-white shadow-2xl">
                    <Avatar
                      url={profile.avatar_url}
                      initials={profile.initials}
                      size="lg"
                    />
                  </div>
                </div>

                {/* Name & title */}
                <h1 className="mt-4 text-2xl md:text-3xl font-bold text-[#1E2D40] tracking-tight leading-tight">
                  {profile.name}
                </h1>
                <p className="mt-1 text-sm font-semibold text-[#1E2D40]/60 uppercase tracking-widest">
                  {profile.job_title || profile.role}
                </p>

                {/* Bio */}
                {profile.bio && (
                  <p className="mt-3 text-[#1E2D40]/75 text-sm max-w-md leading-relaxed">
                    {profile.bio}
                  </p>
                )}

                {/* Stats row */}
                <div className="mt-6 flex items-stretch divide-x divide-[#EBEAE6] border border-[#EBEAE6] rounded-2xl overflow-hidden w-full max-w-sm">
                  <StatPill
                    icon={<Users className="w-4 h-4" />}
                    value={stats.total_leads}
                    label="Leads asignados"
                    color="text-[#1E2D40]"
                  />
                  <StatPill
                    icon={<TrendingUp className="w-4 h-4" />}
                    value={stats.conversiones}
                    label="Conversiones"
                    color="text-emerald-600"
                  />
                  <StatPill
                    icon={<Target className="w-4 h-4" />}
                    value={stats.tareas_pendientes}
                    label="En gestión"
                    color="text-amber-500"
                  />
                </div>

                {/* Editar perfil button */}
                <button
                  onClick={openModal}
                  className="mt-6 inline-flex items-center gap-2 px-7 py-3 bg-[#1E2D40] text-white text-sm font-semibold rounded-full shadow-md hover:bg-[#2d4460] active:scale-95 transition-all duration-200"
                >
                  <Edit3 className="w-4 h-4" />
                  Editar perfil
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-[#EBEAE6]" />

            {/* Contact info row */}
            <div className="px-8 py-6 flex flex-wrap justify-center gap-6">
              <InfoChip icon={<Mail className="w-4 h-4" />} label={profile.email} />
              {profile.phone && (
                <InfoChip icon={<Phone className="w-4 h-4" />} label={profile.phone} />
              )}
              <InfoChip icon={<Briefcase className="w-4 h-4" />} label={profile.role} />
            </div>
          </div>

          {/* Stats detail cards */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              icon={<Users className="w-6 h-6 text-[#1E2D40]" />}
              value={stats.total_leads}
              label="Leads totales asignados"
              bg="bg-white"
              accent="bg-[#1E2D40]/10"
            />
            <StatCard
              icon={<TrendingUp className="w-6 h-6 text-emerald-600" />}
              value={stats.conversiones}
              label="Cierres ganados"
              bg="bg-white"
              accent="bg-emerald-50"
            />
            <StatCard
              icon={<Target className="w-6 h-6 text-amber-500" />}
              value={stats.tareas_pendientes}
              label="Gestiones activas"
              bg="bg-white"
              accent="bg-amber-50"
            />
          </div>
        </div>
      </div>

      {/* ════════════════ EDIT MODAL ════════════════ */}
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${modalOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => !saving && setModalOpen(false)}
      />

      {/* Drawer panel */}
      <div
        className={`
          fixed inset-y-0 right-0 z-[110] w-full max-w-2xl bg-white shadow-2xl
          flex flex-col transition-transform duration-400 ease-in-out
          ${modalOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#EBEAE6] bg-[#1E2D40]">
          <h2 className="text-white font-bold text-lg tracking-tight">Editar perfil</h2>
          <button
            onClick={() => !saving && setModalOpen(false)}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col lg:flex-row h-full">

            {/* ── Left: Live preview ── */}
            <div className="lg:w-[42%] bg-[#EBEAE6] flex flex-col items-center justify-center p-8 gap-4 min-h-[260px]">
              <p className="text-xs font-bold uppercase tracking-widest text-[#1E2D40]/50 mb-2">Vista previa</p>

              {/* Preview avatar */}
              <div className="relative group">
                {previewAvatar
                  ? <img src={previewAvatar} alt="preview" className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg" />
                  : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#1E2D40] to-[#3a5270] flex items-center justify-center text-white text-2xl font-bold border-4 border-white shadow-lg">
                      {profile.initials}
                    </div>
                  )
                }
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="absolute inset-0 rounded-full bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <Camera className="w-6 h-6 text-white" />
                  <span className="text-[10px] text-white font-semibold mt-1">Cambiar</span>
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              {/* Preview name */}
              <div className="text-center mt-1">
                <p className="font-bold text-[#1E2D40] text-lg leading-tight">
                  {previewName || profile.name}
                </p>
                <p className="text-xs text-[#1E2D40]/60 font-semibold uppercase tracking-widest mt-0.5">
                  {previewJob}
                </p>
                {previewBio && (
                  <p className="text-xs text-[#1E2D40]/70 mt-2 max-w-[200px] leading-relaxed line-clamp-3">
                    {previewBio}
                  </p>
                )}
              </div>

              {/* Upload hint */}
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#1E2D40] bg-white rounded-full border border-[#1E2D40]/20 hover:border-[#1E2D40] transition-colors shadow-sm"
              >
                <Camera className="w-3.5 h-3.5" />
                {avatarFile ? 'Cambiar imagen' : 'Subir foto de perfil'}
              </button>
              {avatarFile && (
                <p className="text-[10px] text-[#1E2D40]/50 -mt-1">
                  {avatarFile.name}
                </p>
              )}
            </div>

            {/* ── Right: Form ── */}
            <div className="flex-1 p-6 md:p-8 space-y-6">

              {/* Email (read-only) */}
              <div>
                <label className="block text-xs font-bold text-[#1E2D40]/60 uppercase tracking-widest mb-1.5">
                  Correo electrónico
                </label>
                <div className="flex items-center gap-3 px-4 py-3 bg-[#EBEAE6] rounded-xl border border-transparent">
                  <Mail className="w-4 h-4 text-[#1E2D40]/40 shrink-0" />
                  <span className="text-sm text-[#1E2D40]/60 font-medium">{profile.email}</span>
                  <span className="ml-auto text-[10px] bg-[#1E2D40]/10 text-[#1E2D40]/50 px-2 py-0.5 rounded-full font-semibold">Solo lectura</span>
                </div>
              </div>

              {/* Full name */}
              <FormField
                icon={<User className="w-4 h-4" />}
                label="Nombre completo"
                value={form.name}
                onChange={v => setForm(f => ({ ...f, name: v }))}
                placeholder="Tu nombre completo"
              />

              {/* Job title */}
              <FormField
                icon={<Briefcase className="w-4 h-4" />}
                label="Cargo / Título"
                value={form.job_title}
                onChange={v => setForm(f => ({ ...f, job_title: v }))}
                placeholder="Ej: Asesor Inmobiliario Senior"
              />

              {/* Phone */}
              <FormField
                icon={<Phone className="w-4 h-4" />}
                label="Teléfono"
                value={form.phone}
                onChange={v => setForm(f => ({ ...f, phone: v }))}
                placeholder="+58 412 000 0000"
                type="tel"
              />

              {/* Bio */}
              <div>
                <label className="block text-xs font-bold text-[#1E2D40]/60 uppercase tracking-widest mb-1.5">
                  Biografía
                </label>
                <textarea
                  value={form.bio}
                  onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                  placeholder="Cuéntale a tu equipo sobre ti..."
                  rows={4}
                  maxLength={280}
                  className="w-full px-4 py-3 bg-[#EBEAE6] rounded-xl border border-transparent focus:border-[#1E2D40]/30 focus:bg-white focus:outline-none text-sm text-[#1E2D40] placeholder-[#1E2D40]/35 transition-all resize-none"
                />
                <p className="text-right text-[10px] text-[#1E2D40]/40 mt-1">
                  {form.bio.length}/280
                </p>
              </div>

            </div>
          </div>
        </div>

        {/* Modal footer */}
        <div className="border-t border-[#EBEAE6] px-6 py-4 flex items-center justify-end gap-3 bg-white">
          <button
            onClick={() => !saving && setModalOpen(false)}
            disabled={saving}
            className="px-5 py-2.5 text-sm font-semibold text-[#1E2D40]/60 hover:text-[#1E2D40] transition-colors rounded-xl hover:bg-[#EBEAE6]"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-7 py-2.5 bg-[#1E2D40] text-white text-sm font-semibold rounded-xl shadow hover:bg-[#2d4460] active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</>
              : <>Guardar cambios</>
            }
          </button>
        </div>
      </div>
    </>
  )
}

/* ─────────────────── sub-components ─────────────────────── */

function StatPill({ icon, value, label, color }: {
  icon: React.ReactNode; value: number; label: string; color: string
}) {
  return (
    <div className="flex-1 flex flex-col items-center py-4 px-2 gap-0.5">
      <span className={`flex items-center gap-1 text-xl font-bold ${color}`}>{value}</span>
      <span className="text-[10px] text-[#1E2D40]/50 font-medium text-center leading-tight">{label}</span>
    </div>
  )
}

function StatCard({ icon, value, label, bg, accent }: {
  icon: React.ReactNode; value: number; label: string; bg: string; accent: string
}) {
  return (
    <div className={`${bg} rounded-2xl shadow-sm p-5 flex items-center gap-4`}>
      <div className={`${accent} w-12 h-12 rounded-xl flex items-center justify-center shrink-0`}>
        {icon}
      </div>
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

function FormField({ icon, label, value, onChange, placeholder, type = 'text' }: {
  icon: React.ReactNode
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
}) {
  return (
    <div>
      <label className="block text-xs font-bold text-[#1E2D40]/60 uppercase tracking-widest mb-1.5">
        {label}
      </label>
      <div className="flex items-center gap-3 px-4 py-3 bg-[#EBEAE6] rounded-xl border border-transparent focus-within:border-[#1E2D40]/30 focus-within:bg-white transition-all">
        <span className="text-[#1E2D40]/40 shrink-0">{icon}</span>
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm text-[#1E2D40] placeholder-[#1E2D40]/35 focus:outline-none"
        />
      </div>
    </div>
  )
}
