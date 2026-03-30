'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import GlobalHeader from '@/components/GlobalHeader'
import { Camera, MapPin, Link as LinkIcon, Mail, Phone, Award, TrendingUp, Users } from 'lucide-react'

interface UserProfile {
  id: string
  name: string
  email: string
  role: string
  initials: string
  bio?: string
  avatar_url?: string
  phone?: string
  linkedin?: string
  instagram?: string
  location?: string
}

interface Stats {
  total_leads: number
  conversiones: number
  en_proceso: number
}

export default function PerfilPage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [stats, setStats] = useState<Stats>({ total_leads: 0, conversiones: 0, en_proceso: 0 })
  const [isEditing, setIsEditing] = useState(false)
  const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>({})

  useEffect(() => {
    if (user) {
      loadProfile()
      loadStats()
    }
  }, [user])

  const loadProfile = async () => {
    if (!user) return

    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (data) {
      setProfile(data)
      setEditedProfile(data)
    }
  }

  const loadStats = async () => {
    if (!user) return

    const { count: total } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('assigned_to', user.id)

    const { count: conversiones } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('assigned_to', user.id)
      .eq('status', 'Cierre Ganado')

    const { count: en_proceso } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('assigned_to', user.id)
      .neq('status', 'Cierre Ganado')
      .neq('status', 'Descartados / En Pausa')

    setStats({
      total_leads: total || 0,
      conversiones: conversiones || 0,
      en_proceso: en_proceso || 0
    })
  }

  const handleSave = async () => {
    if (!user) return

    const { error } = await supabase
      .from('users')
      .update(editedProfile)
      .eq('id', user.id)

    if (!error) {
      setProfile({ ...profile, ...editedProfile } as UserProfile)
      setIsEditing(false)
    }
  }

  if (!profile) {
    return (
      <>
        <GlobalHeader />
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="text-slate-500">Cargando perfil...</div>
        </div>
      </>
    )
  }

  return (
    <>
      <GlobalHeader />
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-4xl mx-auto py-8 px-6">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 mb-6">
            <div className="flex items-start gap-8">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold">
                  {profile.initials}
                </div>
                {isEditing && (
                  <button className="absolute bottom-0 right-0 w-10 h-10 bg-white rounded-full shadow-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50">
                    <Camera className="w-5 h-5 text-slate-600" />
                  </button>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-slate-900">{profile.name}</h1>
                    <p className="text-slate-500 mt-1">{profile.role}</p>
                  </div>
                  
                  <button
                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {isEditing ? 'Guardar' : 'Editar Perfil'}
                  </button>
                </div>

                <div className="flex gap-8 mb-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-slate-900">{stats.total_leads}</p>
                    <p className="text-sm text-slate-500">Leads Total</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{stats.conversiones}</p>
                    <p className="text-sm text-slate-500">Conversiones</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{stats.en_proceso}</p>
                    <p className="text-sm text-slate-500">En Proceso</p>
                  </div>
                </div>

                {isEditing ? (
                  <textarea
                    value={editedProfile.bio || ''}
                    onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })}
                    placeholder="Escribe una biografía..."
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                ) : (
                  <p className="text-slate-700">
                    {profile.bio || 'Agrega una biografía para que tu equipo te conozca mejor.'}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Información de Contacto</h2>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-slate-400" />
                {isEditing ? (
                  <input
                    type="email"
                    value={editedProfile.email || ''}
                    onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <span className="text-slate-700">{profile.email}</span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-slate-400" />
                {isEditing ? (
                  <input
                    type="tel"
                    value={editedProfile.phone || ''}
                    onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })}
                    placeholder="Teléfono"
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <span className="text-slate-700">{profile.phone || 'No especificado'}</span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-slate-400" />
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfile.location || ''}
                    onChange={(e) => setEditedProfile({ ...editedProfile, location: e.target.value })}
                    placeholder="Ubicación"
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <span className="text-slate-700">{profile.location || 'No especificado'}</span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <LinkIcon className="w-5 h-5 text-slate-400" />
                {isEditing ? (
                  <input
                    type="url"
                    value={editedProfile.linkedin || ''}
                    onChange={(e) => setEditedProfile({ ...editedProfile, linkedin: e.target.value })}
                    placeholder="LinkedIn URL"
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <a href={profile.linkedin || '#'} target="_blank" className="text-blue-600 hover:underline">
                    {profile.linkedin || 'No especificado'}
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Logros y Actividad</h2>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="aspect-square bg-slate-100 rounded-lg flex items-center justify-center">
                <Award className="w-12 h-12 text-slate-300" />
              </div>
              <div className="aspect-square bg-slate-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-12 h-12 text-slate-300" />
              </div>
              <div className="aspect-square bg-slate-100 rounded-lg flex items-center justify-center">
                <Users className="w-12 h-12 text-slate-300" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
