'use client'

import {
  useState, useEffect, useRef, useCallback,
} from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import GlobalHeader from '@/components/GlobalHeader'
import {
  Heart, MessageCircle, Send, ImageIcon, X, Trash2,
  Loader2, Users,
} from 'lucide-react'

/* ══════════════════════════ TYPES ══════════════════════════════ */

interface Author {
  id:         string
  name:       string
  initials:   string
  avatar_url: string | null
  role:       string
}

interface Like   { id: string; user_id: string }
interface RawComment {
  id:         string
  post_id:    string
  user_id:    string
  content:    string
  created_at: string
  author:     Author | Author[]
}
interface Comment {
  id:         string
  post_id:    string
  user_id:    string
  content:    string
  created_at: string
  author:     Author
}
interface Post {
  id:               string
  user_id:          string
  content:          string
  image_url:        string | null
  created_at:       string
  author:           Author
  likes:            Like[]
  comment_count:    number
  /* runtime UI fields */
  comments?:        Comment[]
  showComments:     boolean
  commentsLoading:  boolean
  newComment:       string
  submittingComment: boolean
}

/* ══════════════════════════ CONSTANTS ══════════════════════════ */

const PAGE_SIZE = 8

/* ══════════════════════════ UTILS ══════════════════════════════ */

function normalizeAuthor(raw: Author | Author[] | null | undefined): Author {
  if (!raw) return { id: '', name: 'Usuario', initials: 'U', avatar_url: null, role: '' }
  return Array.isArray(raw) ? raw[0] : raw
}

function normalizeComment(c: RawComment): Comment {
  return { ...c, author: normalizeAuthor(c.author) }
}

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)  return 'ahora mismo'
  if (m < 60) return `hace ${m} min`
  const h = Math.floor(m / 60)
  if (h < 24) return `hace ${h} h`
  const d = Math.floor(h / 24)
  if (d < 7)  return `hace ${d} d`
  return new Date(iso).toLocaleDateString('es-VE', { day: 'numeric', month: 'short' })
}

/* ══════════════════════════ SUB-COMPONENTS ═════════════════════ */

/* ── User Avatar ──────────────────────────────────────────────── */
function UserAvatar({
  author, size = 'md',
}: { author: Author; size?: 'sm' | 'md' | 'lg' }) {
  const cls = {
    sm: 'w-8  h-8  text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  }[size]

  if (author.avatar_url) {
    return (
      <img
        src={author.avatar_url}
        alt={author.name}
        className={`${cls} rounded-full object-cover shrink-0 ring-2 ring-white`}
      />
    )
  }
  return (
    <div className={`${cls} rounded-full bg-gradient-to-br from-[#1E2D40] to-[#3a5270] flex items-center justify-center text-white font-bold shrink-0 ring-2 ring-white`}>
      {author.initials}
    </div>
  )
}

/* ── Post Composer ────────────────────────────────────────────── */
interface ComposerProps {
  author:          Author
  text:            string
  onTextChange:    (v: string) => void
  imagePreview:    string | null
  onImageSelect:   (f: File) => void
  onImageRemove:   () => void
  submitting:      boolean
  onSubmit:        () => void
  imageInputRef:   React.RefObject<HTMLInputElement>
}

function PostComposer({
  author, text, onTextChange, imagePreview,
  onImageSelect, onImageRemove, submitting, onSubmit, imageInputRef,
}: ComposerProps) {
  const [focused, setFocused] = useState(false)
  const canPost = (text.trim().length > 0 || imagePreview) && !submitting

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#EBEAE6] mb-5 overflow-hidden transition-all">
      <div className="flex items-start gap-3 p-4">
        <Link href={`/perfil`} className="shrink-0 mt-0.5">
          <UserAvatar author={author} size="md" />
        </Link>

        <div className="flex-1 min-w-0">
          <textarea
            value={text}
            onChange={e => onTextChange(e.target.value)}
            onFocus={() => setFocused(true)}
            placeholder="¿Qué tienes en mente?"
            rows={focused || text.length > 0 ? 3 : 1}
            className="w-full resize-none bg-transparent text-[#1E2D40] placeholder-[#1E2D40]/35 text-sm leading-relaxed focus:outline-none transition-all"
          />

          {/* Image preview */}
          {imagePreview && (
            <div className="relative mt-2 rounded-xl overflow-hidden inline-block">
              <img
                src={imagePreview}
                alt="Vista previa"
                className="max-h-48 max-w-full rounded-xl object-cover"
              />
              <button
                onClick={onImageRemove}
                className="absolute top-2 right-2 w-7 h-7 bg-black/60 rounded-full flex items-center justify-center hover:bg-black/80 transition-colors"
              >
                <X className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className={`border-t border-[#EBEAE6] px-4 py-2.5 flex items-center justify-between transition-all ${focused || text.length > 0 ? 'opacity-100' : 'opacity-0 h-0 py-0 border-0 overflow-hidden'}`}>
        <div className="flex items-center gap-1">
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) onImageSelect(f) }}
          />
          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#1E2D40]/60 hover:text-[#1E2D40] hover:bg-[#EBEAE6] rounded-lg transition-all"
          >
            <ImageIcon className="w-4 h-4" />
            Foto
          </button>
        </div>

        <button
          onClick={onSubmit}
          disabled={!canPost}
          className="flex items-center gap-2 px-5 py-2 bg-[#1E2D40] text-white text-xs font-bold rounded-xl shadow hover:bg-[#2d4460] active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
        >
          {submitting
            ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Publicando...</>
            : <>Publicar</>
          }
        </button>
      </div>
    </div>
  )
}

/* ── Comment Item ─────────────────────────────────────────────── */
function CommentItem({
  comment, currentUserId, onDelete,
}: { comment: Comment; currentUserId: string | undefined; onDelete: () => void }) {
  return (
    <div className="flex gap-2.5 group">
      <Link href={`/perfil?user=${comment.author.id}`} className="shrink-0 mt-0.5">
        <UserAvatar author={comment.author} size="sm" />
      </Link>
      <div className="flex-1 min-w-0">
        <div className="bg-[#EBEAE6] rounded-2xl rounded-tl-sm px-3.5 py-2.5">
          <Link
            href={`/perfil?user=${comment.author.id}`}
            className="text-xs font-bold text-[#1E2D40] hover:underline"
          >
            {comment.author.name}
          </Link>
          <p className="text-sm text-[#1E2D40]/80 leading-relaxed mt-0.5 break-words">
            {comment.content}
          </p>
        </div>
        <div className="flex items-center gap-3 mt-1 px-1">
          <span className="text-[10px] text-[#1E2D40]/40">
            {formatRelative(comment.created_at)}
          </span>
          {currentUserId === comment.user_id && (
            <button
              onClick={onDelete}
              className="text-[10px] text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all flex items-center gap-0.5"
            >
              <Trash2 className="w-3 h-3" />
              Eliminar
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Post Card ────────────────────────────────────────────────── */
interface PostCardProps {
  post:               Post
  currentUserId:      string | undefined
  onLike:             (id: string) => void
  onToggleComments:   (id: string) => void
  onDeletePost:       (id: string) => void
  onCommentChange:    (id: string, val: string) => void
  onSubmitComment:    (id: string) => void
  onDeleteComment:    (postId: string, commentId: string) => void
}

function PostCard({
  post, currentUserId, onLike, onToggleComments,
  onDeletePost, onCommentChange, onSubmitComment, onDeleteComment,
}: PostCardProps) {
  const isLiked       = post.likes.some(l => l.user_id === currentUserId)
  const likeCount     = post.likes.length
  const isOwn         = post.user_id === currentUserId
  const commentRef    = useRef<HTMLInputElement>(null)

  const handleCommentClick = () => {
    onToggleComments(post.id)
    setTimeout(() => commentRef.current?.focus(), 200)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSubmitComment(post.id)
    }
  }

  return (
    <article className="bg-white rounded-2xl shadow-sm border border-[#EBEAE6] overflow-hidden">

      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <Link href={`/perfil?user=${post.author.id}`} className="shrink-0">
          <UserAvatar author={post.author} size="md" />
        </Link>
        <div className="flex-1 min-w-0">
          <Link
            href={`/perfil?user=${post.author.id}`}
            className="text-sm font-bold text-[#1E2D40] hover:underline leading-tight block truncate"
          >
            {post.author.name}
          </Link>
          <p className="text-[11px] text-[#1E2D40]/45 mt-0.5">
            {post.author.role} · {formatRelative(post.created_at)}
          </p>
        </div>
        {isOwn && (
          <button
            onClick={() => onDeletePost(post.id)}
            title="Eliminar publicación"
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#1E2D40]/30 hover:text-red-500 hover:bg-red-50 transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ── Content ── */}
      {post.content && (
        <div className="px-4 pb-3">
          <p className="text-sm text-[#1E2D40]/85 leading-relaxed whitespace-pre-wrap break-words">
            {post.content}
          </p>
        </div>
      )}

      {/* ── Image ── */}
      {post.image_url && (
        <div className="relative w-full bg-[#EBEAE6]">
          <img
            src={post.image_url}
            alt="Imagen del post"
            className="w-full max-h-[480px] object-cover"
            loading="lazy"
          />
        </div>
      )}

      {/* ── Stats bar ── */}
      {(likeCount > 0 || post.comment_count > 0) && (
        <div className="flex items-center gap-3 px-4 pt-2.5 pb-0">
          {likeCount > 0 && (
            <span className="flex items-center gap-1 text-xs text-[#1E2D40]/45">
              <span className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center">
                <Heart className="w-2.5 h-2.5 text-white fill-white" />
              </span>
              {likeCount}
            </span>
          )}
          {post.comment_count > 0 && (
            <button
              onClick={handleCommentClick}
              className="ml-auto text-xs text-[#1E2D40]/45 hover:text-[#1E2D40] transition-colors"
            >
              {post.comment_count} {post.comment_count === 1 ? 'comentario' : 'comentarios'}
            </button>
          )}
        </div>
      )}

      {/* ── Action buttons ── */}
      <div className="flex items-center border-t border-[#EBEAE6] mx-4 mt-2">
        <button
          onClick={() => onLike(post.id)}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-lg transition-all active:scale-95 ${
            isLiked
              ? 'text-red-500 hover:bg-red-50'
              : 'text-[#1E2D40]/50 hover:text-[#1E2D40] hover:bg-[#EBEAE6]'
          }`}
        >
          <Heart className={`w-4 h-4 transition-all ${isLiked ? 'fill-red-500 scale-110' : ''}`} />
          Me gusta
        </button>
        <div className="w-px h-5 bg-[#EBEAE6]" />
        <button
          onClick={handleCommentClick}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-semibold text-[#1E2D40]/50 hover:text-[#1E2D40] hover:bg-[#EBEAE6] rounded-lg transition-all"
        >
          <MessageCircle className="w-4 h-4" />
          Comentar
        </button>
      </div>

      {/* ── Comments section ── */}
      {post.showComments && (
        <div className="border-t border-[#EBEAE6] px-4 py-3 space-y-3">

          {post.commentsLoading && (
            <div className="flex justify-center py-3">
              <Loader2 className="w-5 h-5 text-[#1E2D40]/40 animate-spin" />
            </div>
          )}

          {!post.commentsLoading && post.comments?.map(c => (
            <CommentItem
              key={c.id}
              comment={c}
              currentUserId={currentUserId}
              onDelete={() => onDeleteComment(post.id, c.id)}
            />
          ))}

          {/* Comment composer */}
          <div className="flex gap-2.5 pt-1">
            <div className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-[#1E2D40] to-[#3a5270] flex items-center justify-center text-white text-xs font-bold ring-2 ring-white" />
            <div className="flex-1 flex items-center gap-2 bg-[#EBEAE6] rounded-2xl px-3 py-2">
              <input
                ref={commentRef}
                type="text"
                value={post.newComment}
                onChange={e => onCommentChange(post.id, e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escribe un comentario..."
                className="flex-1 bg-transparent text-sm text-[#1E2D40] placeholder-[#1E2D40]/35 focus:outline-none"
              />
              <button
                onClick={() => onSubmitComment(post.id)}
                disabled={!post.newComment.trim() || post.submittingComment}
                className="text-[#1E2D40]/50 hover:text-[#1E2D40] disabled:opacity-30 transition-colors"
              >
                {post.submittingComment
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Send className="w-4 h-4" />
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  )
}

/* ── Empty state ──────────────────────────────────────────────── */
function EmptyState({ onCompose }: { onCompose: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 rounded-2xl bg-[#1E2D40]/10 flex items-center justify-center mb-4">
        <Users className="w-9 h-9 text-[#1E2D40]/30" />
      </div>
      <h3 className="text-lg font-bold text-[#1E2D40] mb-1">La comunidad está en silencio</h3>
      <p className="text-sm text-[#1E2D40]/50 max-w-xs leading-relaxed mb-6">
        Sé el primero en compartir algo con tu equipo.
      </p>
      <button
        onClick={onCompose}
        className="px-6 py-2.5 bg-[#1E2D40] text-white text-sm font-semibold rounded-xl shadow hover:bg-[#2d4460] transition-all active:scale-95"
      >
        Crear primera publicación
      </button>
    </div>
  )
}

/* ══════════════════════════ MAIN PAGE ══════════════════════════ */

export default function ComunidadPage() {
  const { user } = useAuth()

  /* ── Feed state ── */
  const [posts,       setPosts]       = useState<Post[]>([])
  const [loading,     setLoading]     = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore,     setHasMore]     = useState(true)
  const [offset,      setOffset]      = useState(0)

  /* ── Composer state ── */
  const [composerText,         setComposerText]         = useState('')
  const [composerImage,        setComposerImage]        = useState<File | null>(null)
  const [composerImagePreview, setComposerImagePreview] = useState<string | null>(null)
  const [submittingPost,       setSubmittingPost]       = useState(false)

  const imageInputRef  = useRef<HTMLInputElement>(null)
  const composerRef    = useRef<HTMLDivElement>(null)
  const sentinelRef    = useRef<HTMLDivElement>(null)

  /* ────────────────────── data helpers ────────────────────── */
  const mapPost = useCallback((raw: any): Post => ({
    ...raw,
    author:           normalizeAuthor(raw.author),
    likes:            (raw.likes   ?? []) as Like[],
    comment_count:    (raw.comments ?? []).length as number,
    showComments:     false,
    commentsLoading:  false,
    newComment:       '',
    submittingComment: false,
  }), [])

  /* ────────────────────── load posts ──────────────────────── */
  const loadPosts = useCallback(async (offsetVal = 0) => {
    if (offsetVal === 0) setLoading(true)
    else setLoadingMore(true)

    const { data, error } = await supabase
      .from('community_posts')
      .select(`
        id, user_id, content, image_url, created_at,
        author:users!user_id ( id, name, initials, avatar_url, role ),
        likes:community_likes ( id, user_id ),
        comments:community_comments ( id )
      `)
      .order('created_at', { ascending: false })
      .range(offsetVal, offsetVal + PAGE_SIZE - 1)

    if (!error && data) {
      const mapped = data.map(mapPost)
      setPosts(prev => offsetVal === 0 ? mapped : [...prev, ...mapped])
      setHasMore(data.length === PAGE_SIZE)
    }

    if (offsetVal === 0) setLoading(false)
    else setLoadingMore(false)
  }, [mapPost])

  /* ────────────────────── initial load ───────────────────── */
  useEffect(() => {
    if (user) loadPosts(0)
  }, [user, loadPosts])

  /* ────────────────────── real-time ──────────────────────── */
  useEffect(() => {
    if (!user) return

    const channel = supabase.channel('community-realtime')

      /* New post from any user */
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'community_posts' },
        async (payload) => {
          const { data } = await supabase
            .from('community_posts')
            .select(`
              id, user_id, content, image_url, created_at,
              author:users!user_id ( id, name, initials, avatar_url, role ),
              likes:community_likes ( id, user_id ),
              comments:community_comments ( id )
            `)
            .eq('id', payload.new.id)
            .single()

          if (data) {
            const newPost = mapPost(data)
            setPosts(prev =>
              prev.some(p => p.id === newPost.id) ? prev : [newPost, ...prev]
            )
          }
        }
      )

      /* Deleted post */
      .on('postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'community_posts' },
        (payload) => {
          setPosts(prev => prev.filter(p => p.id !== payload.old.id))
        }
      )

      /* New like */
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'community_likes' },
        (payload) => {
          const { post_id, id, user_id } = payload.new as any
          setPosts(prev => prev.map(p =>
            p.id === post_id
              ? { ...p, likes: p.likes.some(l => l.user_id === user_id)
                  ? p.likes
                  : [...p.likes, { id, user_id }]
                }
              : p
          ))
        }
      )

      /* Removed like */
      .on('postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'community_likes' },
        (payload) => {
          const { post_id, user_id } = payload.old as any
          if (!post_id) return
          setPosts(prev => prev.map(p =>
            p.id === post_id
              ? { ...p, likes: p.likes.filter(l => l.user_id !== user_id) }
              : p
          ))
        }
      )

      /* New comment */
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'community_comments' },
        async (payload) => {
          const newRaw = payload.new as any

          /* If thread is open, fetch full comment with author */
          const { data } = await supabase
            .from('community_comments')
            .select('id, post_id, user_id, content, created_at, author:users!user_id ( id, name, initials, avatar_url, role )')
            .eq('id', newRaw.id)
            .single()

          setPosts(prev => prev.map(p => {
            if (p.id !== newRaw.post_id) return p
            const alreadyPresent = p.comments?.some(c => c.id === newRaw.id)
            const newComments = (data && !alreadyPresent && p.comments != null)
              ? [...p.comments, normalizeComment(data as RawComment)]
              : p.comments
            return {
              ...p,
              comment_count: alreadyPresent ? p.comment_count : p.comment_count + 1,
              comments: newComments,
            }
          }))
        }
      )

      /* Deleted comment */
      .on('postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'community_comments' },
        (payload) => {
          const { post_id, id } = payload.old as any
          if (!post_id) return
          setPosts(prev => prev.map(p =>
            p.id !== post_id ? p : {
              ...p,
              comment_count: Math.max(0, p.comment_count - 1),
              comments:      p.comments?.filter(c => c.id !== id),
            }
          ))
        }
      )

      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user, mapPost])

  /* ────────────────────── infinite scroll ─────────────────── */
  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return

    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
        const next = offset + PAGE_SIZE
        setOffset(next)
        loadPosts(next)
      }
    }, { threshold: 0.1 })

    observer.observe(el)
    return () => observer.disconnect()
  }, [hasMore, loadingMore, loading, offset, loadPosts])

  /* ────────────────────── handlers ────────────────────────── */

  const handleCreatePost = async () => {
    if (!user || (!composerText.trim() && !composerImage) || submittingPost) return
    setSubmittingPost(true)

    let image_url: string | null = null

    if (composerImage) {
      const ext  = composerImage.name.split('.').pop() ?? 'jpg'
      const path = `${user.id}/${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage
        .from('community-images')
        .upload(path, composerImage, { cacheControl: '3600', upsert: false })

      if (!upErr) {
        const { data: urlData } = supabase.storage.from('community-images').getPublicUrl(path)
        image_url = urlData.publicUrl
      }
    }

    const { data, error } = await supabase
      .from('community_posts')
      .insert({ user_id: user.id, content: composerText.trim(), image_url })
      .select(`
        id, user_id, content, image_url, created_at,
        author:users!user_id ( id, name, initials, avatar_url, role ),
        likes:community_likes ( id, user_id ),
        comments:community_comments ( id )
      `)
      .single()

    if (!error && data) {
      const newPost = mapPost(data)
      /* Add optimistically; real-time will dedup */
      setPosts(prev => prev.some(p => p.id === newPost.id) ? prev : [newPost, ...prev])
      setComposerText('')
      setComposerImage(null)
      setComposerImagePreview(null)
    }

    setSubmittingPost(false)
  }

  const handleLike = async (postId: string) => {
    if (!user) return
    const post        = posts.find(p => p.id === postId)
    if (!post) return
    const existingLike = post.likes.find(l => l.user_id === user.id)

    if (existingLike) {
      /* Optimistic remove */
      setPosts(prev => prev.map(p =>
        p.id === postId ? { ...p, likes: p.likes.filter(l => l.user_id !== user.id) } : p
      ))
      await supabase.from('community_likes').delete().eq('id', existingLike.id)
    } else {
      /* Optimistic add with temp id */
      const temp = { id: `tmp-${Date.now()}`, user_id: user.id }
      setPosts(prev => prev.map(p =>
        p.id === postId ? { ...p, likes: [...p.likes, temp] } : p
      ))
      const { data } = await supabase
        .from('community_likes')
        .insert({ post_id: postId, user_id: user.id })
        .select('id, user_id')
        .single()

      if (data) {
        setPosts(prev => prev.map(p =>
          p.id === postId
            ? { ...p, likes: p.likes.map(l => l.id === temp.id ? data : l) }
            : p
        ))
      }
    }
  }

  const handleToggleComments = async (postId: string) => {
    const post = posts.find(p => p.id === postId)
    if (!post) return

    if (post.showComments) {
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, showComments: false } : p))
      return
    }

    if (post.comments !== undefined) {
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, showComments: true } : p))
      return
    }

    /* First open — fetch thread */
    setPosts(prev => prev.map(p =>
      p.id === postId ? { ...p, showComments: true, commentsLoading: true } : p
    ))

    const { data } = await supabase
      .from('community_comments')
      .select('id, post_id, user_id, content, created_at, author:users!user_id ( id, name, initials, avatar_url, role )')
      .eq('post_id', postId)
      .order('created_at', { ascending: true })

    setPosts(prev => prev.map(p =>
      p.id !== postId ? p : {
        ...p,
        commentsLoading: false,
        comments: (data ?? []).map(c => normalizeComment(c as RawComment)),
      }
    ))
  }

  const handleSubmitComment = async (postId: string) => {
    if (!user) return
    const post = posts.find(p => p.id === postId)
    if (!post || !post.newComment.trim()) return

    setPosts(prev => prev.map(p =>
      p.id === postId ? { ...p, submittingComment: true } : p
    ))

    const content = post.newComment.trim()

    const { data, error } = await supabase
      .from('community_comments')
      .insert({ post_id: postId, user_id: user.id, content })
      .select('id, post_id, user_id, content, created_at, author:users!user_id ( id, name, initials, avatar_url, role )')
      .single()

    if (!error && data) {
      const newC = normalizeComment(data as RawComment)
      setPosts(prev => prev.map(p =>
        p.id !== postId ? p : {
          ...p,
          newComment:       '',
          submittingComment: false,
          comment_count:    p.comment_count + 1,
          comments:         p.comments != null
            ? p.comments.some(c => c.id === newC.id)
              ? p.comments
              : [...p.comments, newC]
            : undefined,
        }
      ))
    } else {
      setPosts(prev => prev.map(p =>
        p.id === postId ? { ...p, submittingComment: false } : p
      ))
    }
  }

  const handleDeletePost = async (postId: string) => {
    /* Optimistic remove */
    setPosts(prev => prev.filter(p => p.id !== postId))
    await supabase.from('community_posts').delete().eq('id', postId)
  }

  const handleDeleteComment = async (postId: string, commentId: string) => {
    setPosts(prev => prev.map(p =>
      p.id !== postId ? p : {
        ...p,
        comment_count: Math.max(0, p.comment_count - 1),
        comments:      p.comments?.filter(c => c.id !== commentId),
      }
    ))
    await supabase.from('community_comments').delete().eq('id', commentId)
  }

  /* ────────────────────── current author (for composer) ───── */
  const currentAuthor: Author = {
    id:         user?.id         ?? '',
    name:       user?.name       ?? '',
    initials:   user?.initials   ?? '?',
    avatar_url: (user as any)?.avatar_url ?? null,
    role:       user?.role       ?? '',
  }

  /* ═══════════════════════ RENDER ═══════════════════════════ */
  return (
    <>
      <GlobalHeader />

      <div className="min-h-screen bg-[#EBEAE6]">
        <div className="max-w-[640px] mx-auto px-4 py-8">

          {/* ── Page title ── */}
          <div className="mb-6 flex items-center gap-3">
            <div>
              <h1 className="text-2xl font-bold text-[#1E2D40] tracking-tight leading-none">
                Comunidad
              </h1>
              <p className="text-sm text-[#1E2D40]/50 mt-1">
                Comparte novedades y conecta con tu equipo
              </p>
            </div>
          </div>

          {/* ── Composer ── */}
          <div ref={composerRef}>
            <PostComposer
              author={currentAuthor}
              text={composerText}
              onTextChange={setComposerText}
              imagePreview={composerImagePreview}
              onImageSelect={f => {
                if (f.size > 8 * 1024 * 1024) return
                setComposerImage(f)
                setComposerImagePreview(URL.createObjectURL(f))
              }}
              onImageRemove={() => { setComposerImage(null); setComposerImagePreview(null) }}
              submitting={submittingPost}
              onSubmit={handleCreatePost}
              imageInputRef={imageInputRef}
            />
          </div>

          {/* ── Feed ── */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-8 h-8 text-[#1E2D40]/40 animate-spin" />
              <p className="text-sm text-[#1E2D40]/40">Cargando publicaciones...</p>
            </div>
          ) : posts.length === 0 ? (
            <EmptyState
              onCompose={() => {
                composerRef.current?.scrollIntoView({ behavior: 'smooth' })
                composerRef.current?.querySelector('textarea')?.focus()
              }}
            />
          ) : (
            <div className="space-y-4">
              {posts.map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUserId={user?.id}
                  onLike={handleLike}
                  onToggleComments={handleToggleComments}
                  onDeletePost={handleDeletePost}
                  onCommentChange={(id, val) =>
                    setPosts(prev => prev.map(p => p.id === id ? { ...p, newComment: val } : p))
                  }
                  onSubmitComment={handleSubmitComment}
                  onDeleteComment={handleDeleteComment}
                />
              ))}

              {/* Infinite scroll sentinel */}
              <div ref={sentinelRef} className="flex items-center justify-center py-6 min-h-[48px]">
                {loadingMore && (
                  <Loader2 className="w-5 h-5 text-[#1E2D40]/40 animate-spin" />
                )}
                {!hasMore && posts.length >= PAGE_SIZE && (
                  <p className="text-xs text-[#1E2D40]/35 font-medium">
                    · Has visto todas las publicaciones ·
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
