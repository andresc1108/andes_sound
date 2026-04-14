"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import {
  Home,
  Compass,
  Disc3,
  Music2,
  Users,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Volume2,
  VolumeX,
  ListMusic,
  Mic2,
  Trash2,
  Plus,
  ChevronDown,
  Search,
  Library,
  Heart,
  Dices,
  Sparkles,
  X,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

// ============================================================
// API KEY — SIEMPRE desde variable de entorno
// .env.local → NEXT_PUBLIC_YT_API_KEY=tu_key
// Vercel → Settings → Environment Variables
// ============================================================
const YT_API_KEY = process.env.NEXT_PUBLIC_YT_API_KEY || ""

// ============================================================
// INTERFACES
// ============================================================
interface Song {
  id: string
  title: string
  artist: string
  duration: string
  durationSeconds: number
  coverUrl: string
  videoId?: string
  liked?: boolean
}

interface TrendingItem {
  title: string
  artist: string
  videoId: string
  coverUrl: string
  color: string
}

// ============================================================
// LISTA DOBLEMENTE ENLAZADA (DLL)
// ============================================================
class DLLNode {
  data: Song; prev: DLLNode | null = null; next: DLLNode | null = null
  constructor(data: Song) { this.data = data }
}

class DoublyLinkedList {
  head: DLLNode | null = null; tail: DLLNode | null = null; size = 0

  insertAtHead(song: Song) {
    const n = new DLLNode(song)
    if (!this.head) { this.head = this.tail = n }
    else { n.next = this.head; this.head.prev = n; this.head = n }
    this.size++
  }

  insertAtTail(song: Song) {
    const n = new DLLNode(song)
    if (!this.tail) { this.head = this.tail = n }
    else { n.prev = this.tail; this.tail.next = n; this.tail = n }
    this.size++
  }

  insertAtPosition(song: Song, pos: number) {
    if (pos <= 0) { this.insertAtHead(song); return }
    if (pos >= this.size) { this.insertAtTail(song); return }
    const n = new DLLNode(song)
    let cur = this.head
    for (let i = 0; i < pos - 1 && cur; i++) cur = cur.next
    if (!cur) return
    n.next = cur.next; n.prev = cur
    if (cur.next) cur.next.prev = n
    cur.next = n; this.size++
  }

  removeById(id: string) {
    let cur = this.head
    while (cur) {
      if (cur.data.id === id) {
        if (cur.prev) cur.prev.next = cur.next; else this.head = cur.next
        if (cur.next) cur.next.prev = cur.prev; else this.tail = cur.prev
        this.size--; return true
      }
      cur = cur.next
    }
    return false
  }

  toArray(): Song[] {
    const arr: Song[] = []; let cur = this.head
    while (cur) { arr.push(cur.data); cur = cur.next }
    return arr
  }

  getNext(id: string): Song | null {
    let cur = this.head
    while (cur) { if (cur.data.id === id) return cur.next?.data || null; cur = cur.next }
    return null
  }

  getPrev(id: string): Song | null {
    let cur = this.head
    while (cur) { if (cur.data.id === id) return cur.prev?.data || null; cur = cur.next }
    return null
  }

  updateLike(id: string, liked: boolean) {
    let cur = this.head
    while (cur) { if (cur.data.id === id) { cur.data.liked = liked; return }; cur = cur.next }
  }

  getRandom(): Song | null {
    if (!this.size) return null
    const idx = Math.floor(Math.random() * this.size)
    let cur = this.head
    for (let i = 0; i < idx && cur; i++) cur = cur.next
    return cur?.data || null
  }
}

// ============================================================
// SVG PLACEHOLDER — fallback cuando no hay imagen
// ============================================================
function SvgPlaceholder({ color = "#1a1a2e", title = "" }: { color?: string; title?: string }) {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id={`g-${title}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor={color + "88"} />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill={`url(#g-${title})`} />
      <rect x="6" y="6" width="88" height="88" rx="12" fill="rgba(255,255,255,0.05)" />
      <circle cx="50" cy="48" r="22" fill="rgba(0,0,0,0.25)" />
      <circle cx="50" cy="48" r="14" fill="rgba(0,0,0,0.3)" />
      <circle cx="50" cy="48" r="5" fill="rgba(255,255,255,0.2)" />
      <path d="M44 42 L60 48 L44 54 Z" fill="rgba(255,80,80,0.8)" />
      <line x1="62" y1="30" x2="62" y2="58" stroke="rgba(255,255,255,0.15)" strokeWidth="2.5" />
      <circle cx="62" cy="58" r="5" fill="rgba(255,255,255,0.12)" />
    </svg>
  )
}

// Imagen con fallback SVG automático
function SafeImg({ src, alt, className, color }: { src: string; alt: string; className?: string; color?: string }) {
  const [failed, setFailed] = useState(false)
  useEffect(() => { setFailed(false) }, [src])
  if (!src || failed) {
    return (
      <div className={className}>
        <SvgPlaceholder color={color || "#1a1a2e"} title={alt} />
      </div>
    )
  }
  return <img src={src} alt={alt} className={className} onError={() => setFailed(true)} loading="lazy" />
}

// ============================================================
// COLORES DE ACENTO para cada item
// ============================================================
const ACCENT_COLORS = ["#8B1A1A", "#1A5C8B", "#5C1A8B", "#1A8B5C", "#8B5C1A", "#4A1A8B"]

// ============================================================
// CANCIONES INICIALES (videoIds verificados)
// ============================================================
const INITIAL_SONGS: Song[] = [
  { id: "kjarkas-saya", title: "Saya Morena", artist: "Los Kjarkas", duration: "4:12", durationSeconds: 252, coverUrl: "https://i.ytimg.com/vi/Z5UWFh5TzwQ/mqdefault.jpg", videoId: "Z5UWFh5TzwQ", liked: false },
  { id: "kalamarka-way", title: "Wayayay", artist: "Kalamarka", duration: "3:52", durationSeconds: 232, coverUrl: "https://i.ytimg.com/vi/q9vCPqKH3kY/mqdefault.jpg", videoId: "q9vCPqKH3kY", liked: false },
  { id: "kalamarka-jil", title: "Jilguero", artist: "Kala Marka", duration: "4:29", durationSeconds: 269, coverUrl: "https://i.ytimg.com/vi/S7Jw6QKGU4A/mqdefault.jpg", videoId: "S7Jw6QKGU4A", liked: false },
]

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
function LyricsDisplay({ artist, title }: { artist: string; title: string }) {
  const [lyrics, setLyrics] = useState<string>("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
  if (!artist || !title) return
  setLoading(true)
  setLyrics("")

  // Intenta extraer artista del título si tiene formato "Artista - Canción"
  let searchArtist = artist
  let searchTitle = title
  if (title.includes(" - ")) {
    const parts = title.split(" - ")
    searchArtist = parts[0].trim()
    searchTitle = parts[1].trim()
  }

  fetch(`https://api.lyrics.ovh/v1/${encodeURIComponent(searchArtist)}/${encodeURIComponent(searchTitle)}`)
    .then((r) => r.json())
    .then((data) => setLyrics(data.lyrics || "Letra no encontrada para esta canción"))
    .catch(() => setLyrics("Letra no encontrada para esta canción"))
    .finally(() => setLoading(false))
}, [artist, title])

  if (loading) return <div className="flex justify-center py-4"><Loader2 className="w-4 h-4 animate-spin text-[#FF0000]" /></div>

  return (
    <p className="text-xs text-white/40 leading-relaxed whitespace-pre-line">{lyrics}</p>
  )
}

export function MusicDashboard() {
  const dll = useRef(new DoublyLinkedList())

  const [playlist, setPlaylist] = useState<Song[]>([])
  const [currentSong, setCurrentSong] = useState<Song | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [volume, setVolume] = useState(70)
  const [isMuted, setIsMuted] = useState(false)
  const [positionIndex, setPositionIndex] = useState("")
  const [mobilePlayerOpen, setMobilePlayerOpen] = useState(false)
  const [shuffle, setShuffle] = useState(false)
  const [repeat, setRepeat] = useState(false)
  const [activeView, setActiveView] = useState<"inicio" | "descubrir" | "albumes" | "canciones" | "artistas">("inicio")
  const [showLyrics, setShowLyrics] = useState(false)
  const [showQueue, setShowQueue] = useState(false)
  const [isSpinning, setIsSpinning] = useState(false)
  const [recentlyPlayed, setRecentlyPlayed] = useState<Song[]>([])

  // Trending desde YouTube API
  const [trendingItems, setTrendingItems] = useState<TrendingItem[]>([])
  const [loadingTrending, setLoadingTrending] = useState(true)

  // Búsqueda
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Song[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [addingId, setAddingId] = useState<string | null>(null)

  // YouTube iFrame (audio oculto)
  const ytPlayerRef = useRef<any>(null)
  const ytContainerRef = useRef<HTMLDivElement>(null)
  const progressInterval = useRef<NodeJS.Timeout | null>(null)
  const skipNextRef = useRef(() => {})

  // ============================================================
  // TRENDING desde YouTube Data API v3
  // ============================================================
  useEffect(() => {
    const FALLBACK: TrendingItem[] = [
      { title: "Saya Morena", artist: "Los Kjarkas", videoId: "Z5UWFh5TzwQ", coverUrl: "https://i.ytimg.com/vi/Z5UWFh5TzwQ/mqdefault.jpg", color: "#8B1A1A" },
      { title: "Wayayay", artist: "Kalamarka", videoId: "q9vCPqKH3kY", coverUrl: "https://i.ytimg.com/vi/q9vCPqKH3kY/mqdefault.jpg", color: "#1A5C8B" },
      { title: "Jilguero", artist: "Kala Marka", videoId: "S7Jw6QKGU4A", coverUrl: "https://i.ytimg.com/vi/S7Jw6QKGU4A/mqdefault.jpg", color: "#5C1A8B" },
      { title: "Flor de Un Dia", artist: "Savia Andina", videoId: "T3lbMsNaUes", coverUrl: "https://i.ytimg.com/vi/T3lbMsNaUes/mqdefault.jpg", color: "#1A8B5C" },
      { title: "Tiempo al Tiempo", artist: "Gr. Femenino Bolivia", videoId: "UQzGQK6c5gE", coverUrl: "https://i.ytimg.com/vi/UQzGQK6c5gE/mqdefault.jpg", color: "#8B5C1A" },
      { title: "El Condor Pasa", artist: "Instrumental Andino", videoId: "QfmVc9c0RL0", coverUrl: "https://i.ytimg.com/vi/QfmVc9c0RL0/mqdefault.jpg", color: "#4A1A8B" },
    ]

    if (!YT_API_KEY) { setTrendingItems(FALLBACK); setLoadingTrending(false); return }

    fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&chart=mostPopular&regionCode=CO&maxResults=6&key=${YT_API_KEY}`)
      .then((r) => r.json())
      .then((data) => {
        if (!data.items?.length) { setTrendingItems(FALLBACK); return }
        setTrendingItems(data.items.map((item: any, i: number) => ({
          title: item.snippet.title.length > 28 ? item.snippet.title.substring(0, 28) + "…" : item.snippet.title,
          artist: item.snippet.channelTitle,
          videoId: item.id,
          coverUrl: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url || "",
          color: ACCENT_COLORS[i % ACCENT_COLORS.length],
        })))
      })
      .catch(() => setTrendingItems(FALLBACK))
      .finally(() => setLoadingTrending(false))
  }, [])

  // ============================================================
  // INICIALIZAR DLL
  // ============================================================
  useEffect(() => {
    INITIAL_SONGS.forEach((s) => dll.current.insertAtTail(s))
    setPlaylist(dll.current.toArray())
  }, [])

  // ============================================================
  // YOUTUBE IFRAME API (audio oculto para control de tiempo)
  // ============================================================
  useEffect(() => {
    if (typeof window === "undefined") return
    const init = () => {
      if (!ytContainerRef.current) return
      ytPlayerRef.current = new (window as any).YT.Player(ytContainerRef.current, {
        height: "1", width: "1",
        playerVars: { autoplay: 0, controls: 0, rel: 0 },
        events: {
          onStateChange: (e: any) => {
            if (e.data === 0) repeat ? (ytPlayerRef.current?.seekTo(0), ytPlayerRef.current?.playVideo()) : skipNextRef.current()
            if (e.data === 1) setIsPlaying(true)
            if (e.data === 2) setIsPlaying(false)
          },
        },
      })
    }
    if ((window as any).YT?.Player) { init(); return }
    const tag = document.createElement("script")
    tag.src = "https://www.youtube.com/iframe_api"
    document.head.appendChild(tag)
    ;(window as any).onYouTubeIframeAPIReady = init
  }, [])

  useEffect(() => {
    if (!ytPlayerRef.current || !currentSong?.videoId) return
    try { ytPlayerRef.current.loadVideoById(currentSong.videoId); ytPlayerRef.current.setVolume(isMuted ? 0 : volume) } catch {}
    setProgress(0)
  }, [currentSong?.id])

  useEffect(() => {
    try { isPlaying ? ytPlayerRef.current?.playVideo?.() : ytPlayerRef.current?.pauseVideo?.() } catch {}
  }, [isPlaying])

  useEffect(() => {
    try { ytPlayerRef.current?.setVolume?.(isMuted ? 0 : volume) } catch {}
  }, [volume, isMuted])

  useEffect(() => {
    if (progressInterval.current) clearInterval(progressInterval.current)
    if (isPlaying) {
      progressInterval.current = setInterval(() => {
        try {
          const cur = ytPlayerRef.current?.getCurrentTime?.() || 0
          const dur = ytPlayerRef.current?.getDuration?.() || 0
          if (dur > 0) setProgress((cur / dur) * 100)
        } catch {}
      }, 500)
    }
    return () => { if (progressInterval.current) clearInterval(progressInterval.current) }
  }, [isPlaying])

  // ============================================================
  // DLL OPERATIONS
  // ============================================================
  const syncPlaylist = useCallback(() => setPlaylist(dll.current.toArray()), [])

  const makeSong = (): Song => ({
    id: `song-${Date.now()}-${Math.random()}`,
    title: `Nueva Canción ${dll.current.size + 1}`,
    artist: "Artista Nuevo",
    duration: "3:30",
    durationSeconds: 210,
    coverUrl: "",
  })

  const addToStart = useCallback(() => { dll.current.insertAtHead(makeSong()); syncPlaylist() }, [syncPlaylist])
  const addToEnd = useCallback(() => { dll.current.insertAtTail(makeSong()); syncPlaylist() }, [syncPlaylist])
  const addAtPosition = useCallback(() => {
    const idx = parseInt(positionIndex)
    if (isNaN(idx) || idx < 0) return
    dll.current.insertAtPosition(makeSong(), idx); syncPlaylist(); setPositionIndex("")
  }, [positionIndex, syncPlaylist])

  const deleteSong = useCallback((song: Song) => {
    dll.current.removeById(song.id); syncPlaylist()
    if (currentSong?.id === song.id) { setCurrentSong(dll.current.head?.data || null); setIsPlaying(false) }
  }, [currentSong, syncPlaylist])

  const toggleLike = useCallback(() => {
    if (!currentSong) return
    const v = !currentSong.liked
    dll.current.updateLike(currentSong.id, v)
    setCurrentSong((p) => p ? { ...p, liked: v } : p); syncPlaylist()
  }, [currentSong, syncPlaylist])

  // ============================================================
  // BÚSQUEDA YOUTUBE
  // ============================================================
  const searchYouTube = useCallback(async () => {
    if (!searchQuery.trim()) return
    setIsSearching(true); setShowResults(true)
    try {
      const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=8&q=${encodeURIComponent(searchQuery)}&key=${YT_API_KEY}`
      )
      const data = await res.json()
      setSearchResults((data.items || []).map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        artist: item.snippet.channelTitle,
        duration: "—",
        durationSeconds: 0,
        coverUrl: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url || "",
        videoId: item.id.videoId,
      })))
    } catch { setSearchResults([]) }
    finally { setIsSearching(false) }
  }, [searchQuery])

  const addFromSearch = useCallback((song: Song, pos: "head" | "tail") => {
    setAddingId(song.id + "-" + pos)
    const s = { ...song, id: `yt-${song.videoId}-${Date.now()}` }
    pos === "head" ? dll.current.insertAtHead(s) : dll.current.insertAtTail(s)
    syncPlaylist(); setShowResults(false); setSearchQuery(""); setAddingId(null)
  }, [syncPlaylist])

  // ============================================================
  // RULETA
  // ============================================================
  const spinRoulette = useCallback(async () => {
    if (isSpinning) return
    setIsSpinning(true)
    try {
      const terms = ["musica andina popular", "cumbia colombiana 2024", "latin pop trending"]
      const q = terms[Math.floor(Math.random() * terms.length)]
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=10&q=${encodeURIComponent(q)}&key=${YT_API_KEY}`
      )
      const data = await res.json()
      const items = data.items || []
      if (items.length) {
        const item = items[Math.floor(Math.random() * items.length)]
        const song: Song = {
          id: `roulette-${Date.now()}`,
          title: item.snippet.title,
          artist: item.snippet.channelTitle,
          duration: "—",
          durationSeconds: 0,
          coverUrl: item.snippet.thumbnails?.medium?.url || "",
          videoId: item.id.videoId,
        }
        dll.current.insertAtHead(song); syncPlaylist(); playSong(song)
      }
    } catch { const r = dll.current.getRandom(); if (r) playSong(r) }
    finally { setTimeout(() => setIsSpinning(false), 1500) }
  }, [isSpinning, syncPlaylist])

  // ============================================================
  // REPRODUCTOR
  // ============================================================
  const playSong = useCallback((song: Song) => {
    setCurrentSong(song); setIsPlaying(true); setProgress(0)
    setRecentlyPlayed((prev) => [song, ...prev.filter((s) => s.id !== song.id)].slice(0, 15))
  }, [])

  const togglePlay = useCallback(() => setIsPlaying((p) => !p), [])

  const skipNext = useCallback(() => {
    if (!currentSong) return
    const next = shuffle ? dll.current.getRandom() : (dll.current.getNext(currentSong.id) || dll.current.head?.data || null)
    if (next) playSong(next)
  }, [currentSong, shuffle, playSong])

  skipNextRef.current = skipNext

  const skipPrev = useCallback(() => {
    if (!currentSong) return
    const prev = dll.current.getPrev(currentSong.id)
    if (prev) playSong(prev)
    else { try { ytPlayerRef.current?.seekTo?.(0) } catch {}; setProgress(0) }
  }, [currentSong, playSong])

  const seekTo = useCallback((pct: number) => {
    setProgress(pct)
    try { const dur = ytPlayerRef.current?.getDuration?.() || 0; ytPlayerRef.current?.seekTo?.((pct / 100) * dur, true) } catch {}
  }, [])

  const formatTime = (sec: number) => `${Math.floor(sec / 60)}:${Math.floor(sec % 60).toString().padStart(2, "0")}`
  const getCurrentTime = () => { try { return ytPlayerRef.current?.getCurrentTime?.() || 0 } catch { return 0 } }

  const playTrending = useCallback((trend: TrendingItem) => {
    const song: Song = {
      id: `trend-${trend.videoId}-${Date.now()}`,
      title: trend.title,
      artist: trend.artist,
      duration: "—",
      durationSeconds: 0,
      coverUrl: trend.coverUrl,
      videoId: trend.videoId,
    }
    dll.current.insertAtHead(song); syncPlaylist(); playSong(song)
  }, [syncPlaylist, playSong])

  // ============================================================
  // VISTAS DEL MENÚ
  // ============================================================
  const renderMainContent = () => {
    switch (activeView) {
      case "descubrir": return (
        <div className="px-4 md:px-8 py-6 space-y-6">
          <h2 className="text-2xl font-bold">Descubrir</h2>
          <p className="text-white/50 text-sm">Explora géneros musicales de Colombia y Latinoamérica.</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[{ label: "Andina", color: "#8B1A1A" }, { label: "Cumbia", color: "#1A5C8B" }, { label: "Salsa", color: "#5C1A8B" }, { label: "Rock Latino", color: "#1A8B5C" }, { label: "Pop", color: "#8B5C1A" }, { label: "Folclore", color: "#4A1A8B" }]
              .map((g) => (
                <div key={g.label} className="bg-[#121212] border border-white/5 rounded-xl p-6 cursor-pointer hover:bg-white/5 transition-colors text-center"
                  onClick={() => { setSearchQuery(g.label); setActiveView("inicio") }}>
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center" style={{ background: g.color + "33", border: `1px solid ${g.color}66` }}>
                    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" stroke={g.color} strokeWidth="1.5" />
                      <path d="M10 8l6 4-6 4V8z" fill={g.color} />
                    </svg>
                  </div>
                  <p className="font-semibold text-sm">{g.label}</p>
                </div>
              ))}
          </div>
        </div>
      )
      case "albumes": return (
        <div className="px-4 md:px-8 py-6 space-y-6">
          <h2 className="text-2xl font-bold">Álbumes</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {["El Árbol de la Vida", "Caminantes", "Llanto de Luna", "Viento del Sur", "Tierra Viva", "Raíces"].map((album, i) => (
              <div key={album} className="bg-[#121212] border border-white/5 rounded-xl p-4 cursor-pointer hover:bg-white/5 transition-colors">
                <div className="aspect-square rounded-lg mb-3 overflow-hidden"><SvgPlaceholder color={ACCENT_COLORS[i % ACCENT_COLORS.length]} title={album} /></div>
                <p className="text-sm font-semibold truncate">{album}</p>
                <p className="text-xs text-white/40 mt-0.5">Álbum</p>
              </div>
            ))}
          </div>
        </div>
      )
      case "canciones": return (
        <div className="px-4 md:px-8 py-6 space-y-6">
          <h2 className="text-2xl font-bold">Canciones</h2>
          <div className="bg-[#121212] rounded-xl border border-white/5 overflow-hidden">
            <table className="w-full">
              <thead><tr className="border-b border-white/5 text-left">
                <th className="px-4 py-3 text-[10px] text-white/40 uppercase tracking-widest">#</th>
                <th className="px-4 py-3 text-[10px] text-white/40 uppercase tracking-widest">Título</th>
                <th className="px-4 py-3 text-[10px] text-white/40 uppercase tracking-widest">Artista</th>
                <th className="px-4 py-3 text-[10px] text-white/40 uppercase tracking-widest text-right">Tiempo</th>
              </tr></thead>
              <tbody>
                {playlist.map((song, i) => (
                  <tr key={song.id} className={cn("border-b border-white/5 hover:bg-white/5 cursor-pointer", currentSong?.id === song.id && "bg-[#FF0000]/5")} onClick={() => playSong(song)}>
                    <td className="px-4 py-3 text-sm text-white/40">{i + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded overflow-hidden flex-shrink-0">
                          <SafeImg src={song.coverUrl} alt={song.title} className="w-full h-full object-cover" color={ACCENT_COLORS[i % ACCENT_COLORS.length]} />
                        </div>
                        <span className={cn("text-sm font-medium", currentSong?.id === song.id ? "text-[#FF0000]" : "text-white")}>{song.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-white/50">{song.artist}</td>
                    <td className="px-4 py-3 text-sm text-white/50 text-right">{song.duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )
      case "artistas": return (
        <div className="px-4 md:px-8 py-6 space-y-6">
          <h2 className="text-2xl font-bold">Artistas</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {["Los Kjarkas", "Kalamarka", "Savia Andina", "Gr. Femenino Bolivia", "Kala Marka", "Inti-Illimani"].map((artist, i) => (
              <div key={artist} className="bg-[#121212] border border-white/5 rounded-xl p-4 cursor-pointer hover:bg-white/5 transition-colors text-center">
                <div className="w-16 h-16 rounded-full mx-auto mb-3 overflow-hidden">
                  <SvgPlaceholder color={ACCENT_COLORS[i % ACCENT_COLORS.length]} title={artist} />
                </div>
                <p className="text-sm font-semibold">{artist}</p>
                <p className="text-xs text-white/40 mt-0.5">Artista</p>
              </div>
            ))}
          </div>
        </div>
      )
      default: return renderInicio()
    }
  }

  const renderInicio = () => (
    <div className="px-4 md:px-8 py-6 space-y-6 w-full max-w-full">

      {/* Tendencias en YouTube */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Tendencias en YouTube</h2>
        {loadingTrending ? (
          <div className="flex gap-4 overflow-x-auto pb-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex-shrink-0 w-28 md:w-32">
                <div className="w-28 h-28 md:w-32 md:h-32 rounded-xl bg-[#1a1a1a] animate-pulse mb-2" />
                <div className="h-3 bg-white/10 rounded animate-pulse mb-1 w-full" />
                <div className="h-2 bg-white/5 rounded animate-pulse w-2/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
            {trendingItems.map((trend, index) => (
              <div key={index} className="flex-shrink-0 w-28 md:w-32 group cursor-pointer" onClick={() => playTrending(trend)}>
                <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-xl overflow-hidden bg-[#121212] border border-white/5 mb-2">
                  <SafeImg src={trend.coverUrl} alt={trend.title} className="w-full h-full object-cover" color={trend.color} />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-[#FF0000] flex items-center justify-center transform scale-90 group-hover:scale-100 transition-transform">
                      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="white" xmlns="http://www.w3.org/2000/svg"><path d="M8 5v14l11-7z" /></svg>
                    </div>
                  </div>
                </div>
                <p className="text-sm font-medium truncate text-white">{trend.title}</p>
                <p className="text-xs text-white/50 truncate">{trend.artist}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Búsqueda YouTube */}
      <section>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <Input placeholder="Buscar en YouTube..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && searchYouTube()}
              className="pl-9 pr-4 h-10 bg-[#121212] border-white/10 text-white placeholder:text-white/30 focus:border-[#FF0000]/50" />
          </div>
          <Button onClick={searchYouTube} disabled={isSearching || !searchQuery.trim()} className="h-10 px-4 bg-[#FF0000] hover:bg-[#FF0000]/80 text-white">
            {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </Button>
        </div>

        {showResults && (
          <div className="mt-2 bg-[#121212] rounded-xl border border-white/5 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/5">
              <span className="text-xs text-white/40">{isSearching ? "Buscando..." : `${searchResults.length} resultados`}</span>
              <button onClick={() => { setShowResults(false); setSearchResults([]) }} className="text-white/30 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            {isSearching ? (
              <div className="flex items-center justify-center py-8"><Loader2 className="w-6 h-6 text-[#FF0000] animate-spin" /></div>
            ) : (
              <div className="max-h-72 overflow-y-auto">
                {searchResults.map((result) => (
                  <div key={result.id} className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0">
                    <div className="w-12 h-9 rounded overflow-hidden flex-shrink-0 bg-[#1a1a1a]">
                      <SafeImg src={result.coverUrl} alt={result.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate text-white">{result.title}</p>
                      <p className="text-xs text-white/50 truncate">{result.artist}</p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <Button variant="outline" size="sm" disabled={addingId === result.id + "-head"} onClick={() => addFromSearch(result, "head")}
                        className="h-7 px-2 text-[10px] border-[#FF0000]/40 text-[#FF0000] bg-transparent hover:bg-[#FF0000]/10">
                        {addingId === result.id + "-head" ? <Loader2 className="w-3 h-3 animate-spin" /> : "+ Inicio"}
                      </Button>
                      <Button variant="outline" size="sm" disabled={addingId === result.id + "-tail"} onClick={() => addFromSearch(result, "tail")}
                        className="h-7 px-2 text-[10px] border-[#FF0000]/40 text-[#FF0000] bg-transparent hover:bg-[#FF0000]/10">
                        {addingId === result.id + "-tail" ? <Loader2 className="w-3 h-3 animate-spin" /> : "+ Final"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Gestión DLL */}
      <section className="inline-flex flex-wrap items-center gap-2 p-3 bg-[#121212] rounded-xl border border-white/5">
        <span className="text-xs font-medium text-white/50 mr-1">Gestion DLL:</span>
        <Button variant="outline" size="sm" onClick={addToStart} className="h-8 px-3 border-[#FF0000]/40 text-[#FF0000] bg-transparent hover:bg-[#FF0000]/10 hover:border-[#FF0000]/60 transition-all hover:scale-105 active:scale-95">
          <Plus className="w-3.5 h-3.5 mr-1" />Inicio
        </Button>
        <Button variant="outline" size="sm" onClick={addToEnd} className="h-8 px-3 border-[#FF0000]/40 text-[#FF0000] bg-transparent hover:bg-[#FF0000]/10 hover:border-[#FF0000]/60 transition-all hover:scale-105 active:scale-95">
          <Plus className="w-3.5 h-3.5 mr-1" />Final
        </Button>
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="sm" onClick={addAtPosition} className="h-8 px-3 border-[#FF0000]/40 text-[#FF0000] bg-transparent hover:bg-[#FF0000]/10 hover:border-[#FF0000]/60 transition-all hover:scale-105 active:scale-95">
            <Plus className="w-3.5 h-3.5 mr-1" />Posicion
          </Button>
          <Input type="number" placeholder="#" value={positionIndex} onChange={(e) => setPositionIndex(e.target.value)}
            className="w-14 h-8 text-sm bg-[#050505] border-white/10 text-white placeholder:text-white/30 text-center" min="0" />
        </div>
      </section>

      {/* Playlist */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Playlist</h2>
          <span className="text-sm text-white/50">{playlist.length} canciones</span>
        </div>

        {/* Desktop */}
        <div className="hidden md:block bg-[#121212] rounded-xl border border-white/5 overflow-hidden">
          <table className="w-full">
            <thead><tr className="border-b border-white/5 text-left">
              <th className="px-4 py-3 text-[10px] font-semibold text-white/40 uppercase tracking-widest w-12">#</th>
              <th className="px-4 py-3 text-[10px] font-semibold text-white/40 uppercase tracking-widest">Titulo</th>
              <th className="px-4 py-3 text-[10px] font-semibold text-white/40 uppercase tracking-widest">Artista</th>
              <th className="px-4 py-3 text-[10px] font-semibold text-white/40 uppercase tracking-widest text-right">Tiempo</th>
              <th className="px-4 py-3 text-[10px] font-semibold text-white/40 uppercase tracking-widest text-center w-24">Acciones</th>
            </tr></thead>
            <tbody>
              {playlist.map((song, index) => (
                <tr key={song.id} className={cn("border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer group", currentSong?.id === song.id && "bg-[#FF0000]/5")} onClick={() => playSong(song)}>
                  <td className="px-4 py-3 text-sm text-white/40">{String(index + 1).padStart(2, "0")}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-[#1a1a1a] flex-shrink-0">
                        <SafeImg src={song.coverUrl} alt={song.title} className="w-full h-full object-cover" color={ACCENT_COLORS[index % ACCENT_COLORS.length]} />
                        {currentSong?.id === song.id && isPlaying && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <div className="flex gap-0.5 items-end h-4">
                              <span className="w-0.5 h-2 bg-[#FF0000] animate-pulse" style={{ animationDelay: "0ms" }} />
                              <span className="w-0.5 h-4 bg-[#FF0000] animate-pulse" style={{ animationDelay: "150ms" }} />
                              <span className="w-0.5 h-3 bg-[#FF0000] animate-pulse" style={{ animationDelay: "300ms" }} />
                            </div>
                          </div>
                        )}
                      </div>
                      <span className={cn("text-sm font-medium", currentSong?.id === song.id ? "text-[#FF0000]" : "text-white")}>{song.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-white/50">{song.artist}</td>
                  <td className="px-4 py-3 text-sm text-white/50 text-right">{song.duration}</td>
                  <td className="px-4 py-3 text-center">
                    <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); deleteSong(song) }}
                      className="text-[#FF0000] hover:text-[#FF0000] hover:bg-[#FF0000]/10 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Móvil */}
        <div className="md:hidden space-y-2">
          {playlist.map((song, index) => (
            <div key={song.id} className={cn("flex items-center gap-3 p-3 bg-[#121212] rounded-xl border border-white/5", currentSong?.id === song.id && "border-[#FF0000]/30 bg-[#FF0000]/5")}
              onClick={() => { playSong(song); setMobilePlayerOpen(true) }}>
              <span className="text-xs text-white/40 w-5 text-center">{String(index + 1).padStart(2, "0")}</span>
              <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-[#1a1a1a] flex-shrink-0">
                <SafeImg src={song.coverUrl} alt={song.title} className="w-full h-full object-cover" color={ACCENT_COLORS[index % ACCENT_COLORS.length]} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm font-medium truncate", currentSong?.id === song.id ? "text-[#FF0000]" : "text-white")}>{song.title}</p>
                <p className="text-xs text-white/50 truncate">{song.artist}</p>
              </div>
              <span className="text-xs text-white/40">{song.duration}</span>
              <Button variant="ghost" size="icon" className="flex-shrink-0 w-10 h-10 rounded-full bg-[#FF0000] text-white hover:bg-[#FF0000]/80"
                onClick={(e) => { e.stopPropagation(); playSong(song); setMobilePlayerOpen(true) }}>
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="white"><path d="M8 5v14l11-7z" /></svg>
              </Button>
            </div>
          ))}
        </div>
      </section>
    </div>
  )

  // ============================================================
  // RENDER PRINCIPAL
  // ============================================================
  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* YouTube hidden player para control de tiempo/eventos */}
      <div className="fixed -top-[9999px] -left-[9999px] w-1 h-1 pointer-events-none" aria-hidden>
        <div ref={ytContainerRef} id="yt-hidden-player" />
      </div>

      <div className="flex min-h-screen">

        {/* ---- SIDEBAR IZQUIERDO ---- */}
        <aside className="hidden md:flex flex-col w-[220px] lg:w-[260px] bg-[#121212]/80 backdrop-blur-xl border-r border-white/5 h-screen sticky top-0">
          <div className="flex flex-col h-full p-4 lg:p-6">

            {/* Logo — click lleva a Inicio */}
            <button className="flex items-center gap-3 mb-6 hover:opacity-80 transition-opacity text-left" onClick={() => setActiveView("inicio")}>
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Gemini_Generated_Image_nhymfbnhymfbnhym-removebg-preview-WS8m76nVgvPv6AM7C5JqfLz7EF9BkO.png"
                alt="Andes Sound Logo"
                className="w-10 h-10 lg:w-12 lg:h-12 object-contain flex-shrink-0"
              />
              <span className="text-base lg:text-lg font-semibold">Andes Sound</span>
            </button>

            <nav className="space-y-1">
              <p className="text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-3 px-3">Menu</p>
              {[
                { icon: Home, label: "Inicio", view: "inicio" as const },
                { icon: Compass, label: "Descubrir", view: "descubrir" as const },
              ].map((item) => (
                <button key={item.label} onClick={() => setActiveView(item.view)}
                  className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 hover:translate-x-1",
                    activeView === item.view ? "bg-[#FF0000]/10 text-[#FF0000]" : "text-white/60 hover:text-white hover:bg-white/5")}>
                  <item.icon className="w-5 h-5" /><span>{item.label}</span>
                </button>
              ))}
            </nav>

            <div className="mt-6">
              <p className="text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-3 px-3">Biblioteca</p>
              <nav className="space-y-1">
                {[
                  { icon: Disc3, label: "Albumes", view: "albumes" as const },
                  { icon: Music2, label: "Canciones", view: "canciones" as const },
                  { icon: Users, label: "Artistas", view: "artistas" as const },
                ].map((item) => (
                  <button key={item.label} onClick={() => setActiveView(item.view)}
                    className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 hover:translate-x-1",
                      activeView === item.view ? "bg-[#FF0000]/10 text-[#FF0000]" : "text-white/60 hover:text-white hover:bg-white/5")}>
                    <item.icon className="w-5 h-5" /><span>{item.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Recientes — canciones escuchadas */}
            {recentlyPlayed.length > 0 && (
              <div className="mt-6 flex-1 overflow-hidden flex flex-col">
                <p className="text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-2 px-3">Recientes</p>
                <div className="overflow-y-auto space-y-0.5 pr-1">
                  {recentlyPlayed.slice(0, 8).map((song) => (
                    <button key={song.id + "-r"} onClick={() => playSong(song)}
                      className={cn("w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-all hover:bg-white/5 text-left",
                        currentSong?.id === song.id ? "text-[#FF0000]" : "text-white/50 hover:text-white")}>
                      <div className="w-6 h-6 rounded overflow-hidden flex-shrink-0">
                        <SafeImg src={song.coverUrl} alt={song.title} className="w-full h-full object-cover" />
                      </div>
                      <span className="truncate">{song.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* ---- CONTENIDO PRINCIPAL ---- */}
        <main className="flex-1 pb-40 md:pb-28 overflow-x-hidden">{renderMainContent()}</main>

        {/* ---- SIDEBAR DERECHO ---- */}
        <aside className="hidden lg:flex flex-col w-[320px] xl:w-[350px] bg-[#121212]/80 backdrop-blur-xl border-l border-white/5 h-screen sticky top-0 overflow-hidden">
          {/* Ruleta */}
          <div className="p-4 xl:p-5 border-b border-white/5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-[#FF0000]/10 flex items-center justify-center border border-[#FF0000]/20">
                <Sparkles className="w-4 h-4 text-[#FF0000]" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Ruleta de Generos</h3>
                <p className="text-[10px] text-white/40">Descubre canciones al azar</p>
              </div>
            </div>
            <div className="bg-[#050505] rounded-xl border border-white/5 p-3">
              <div className="flex flex-col items-center">
                <div className={cn("w-14 h-14 rounded-full bg-gradient-to-br from-[#FF0000]/20 to-[#FF0000]/5 flex items-center justify-center border-2 border-[#FF0000]/30 mb-2 cursor-pointer transition-all",
                  isSpinning ? "animate-spin" : "hover:scale-110")}>
                  <Dices className="w-6 h-6 text-[#FF0000]" />
                </div>
                <p className="text-xs font-medium mb-2">Mezcla Inteligente</p>
                <Button size="sm" onClick={spinRoulette} disabled={isSpinning} className="w-full bg-[#FF0000] hover:bg-[#FF0000]/80 text-white rounded-lg text-xs">
                  {isSpinning ? <><Loader2 className="w-3 h-3 mr-1.5 animate-spin" />Buscando...</> : <><Shuffle className="w-3 h-3 mr-1.5" />Girar Ruleta</>}
                </Button>
              </div>
            </div>
          </div>

          {/* Reproductor */}
          <div className="flex-1 p-4 xl:p-5 flex flex-col overflow-hidden">
            <h3 className="text-sm font-semibold mb-3">Reproductor en Vivo</h3>
            {currentSong ? (
              <div className="flex-1 flex flex-col bg-[#050505] rounded-xl border border-white/5 overflow-hidden">
                <div className="relative aspect-video w-full bg-black overflow-hidden">
                  {currentSong.videoId ? (
                    <iframe
                      key={currentSong.videoId}
                      src={`https://www.youtube.com/embed/${currentSong.videoId}?autoplay=0&controls=0&rel=0&modestbranding=1`}
                      className="w-full h-full" allow="autoplay; encrypted-media" allowFullScreen title={currentSong.title}
                    />
                  ) : (
                    <SafeImg src={currentSong.coverUrl} alt={currentSong.title} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="px-3 pt-2 pb-1 text-center">
                  <h4 className="text-sm font-bold truncate">{currentSong.title}</h4>
                  <p className="text-[11px] text-white/50 truncate">{currentSong.artist}</p>
                </div>
                <div className="px-3 pb-1">
                  <Slider value={[progress]} onValueChange={(v) => seekTo(v[0])} max={100} step={0.1}
                    className="[&_[role=slider]]:bg-[#FF0000] [&_[role=slider]]:border-[#FF0000] [&_[role=slider]]:w-2 [&_[role=slider]]:h-2 [&_.relative]:bg-white/20" />
                  <div className="flex justify-between mt-0.5">
                    <span className="text-[8px] text-white/40">{formatTime(getCurrentTime())}</span>
                    <span className="text-[8px] text-white/40">{currentSong.duration}</span>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-1 px-3 pb-2">
                  <Button variant="ghost" size="icon" onClick={() => setShuffle(!shuffle)} className={cn("w-7 h-7 text-white/40 hover:text-white", shuffle && "text-[#FF0000]")}><Shuffle className="w-3 h-3" /></Button>
                  <Button variant="ghost" size="icon" onClick={skipPrev} className="w-8 h-8 text-white"><SkipBack className="w-4 h-4 fill-current" /></Button>
                  <Button size="icon" onClick={togglePlay} className="w-10 h-10 rounded-full bg-[#FF0000] text-white hover:bg-[#FF0000]/80">
                    {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={skipNext} className="w-8 h-8 text-white"><SkipForward className="w-4 h-4 fill-current" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => setRepeat(!repeat)} className={cn("w-7 h-7 text-white/40 hover:text-white", repeat && "text-[#FF0000]")}><Repeat className="w-3 h-3" /></Button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center bg-[#050505] rounded-xl border border-white/5 p-4">
                <SvgPlaceholder color="#0d0d0d" title="empty" />
                <p className="text-xs text-white/40 text-center mt-3">Selecciona una cancion</p>
              </div>
            )}

            {showQueue && (
              <div className="mt-3 bg-[#050505] rounded-xl border border-white/5 p-3 max-h-40 overflow-y-auto">
                <p className="text-xs font-semibold text-white/50 mb-2">Cola</p>
                {playlist.map((s, i) => (
                  <div key={s.id} className={cn("flex items-center gap-2 py-1.5 cursor-pointer hover:bg-white/5 rounded px-1 text-xs", s.id === currentSong?.id && "text-[#FF0000]")} onClick={() => playSong(s)}>
                    <span className="text-[10px] text-white/30 w-4">{i + 1}</span>
                    <span className="truncate flex-1">{s.title}</span>
                  </div>
                ))}
              </div>
            )}

            {showLyrics && (
              <div className="mt-3 bg-[#050505] rounded-xl border border-white/5 p-3 max-h-40 overflow-y-auto">
                <p className="text-xs font-semibold text-white/50 mb-2">Letra</p>
                <LyricsDisplay artist={currentSong?.artist || ""} title={currentSong?.title || ""} />
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* ---- FOOTER REPRODUCTOR DESKTOP ---- */}
      <footer className="fixed bottom-0 left-0 right-0 lg:right-[320px] xl:right-[350px] z-40 hidden md:block bg-[#121212]/95 backdrop-blur-xl border-t border-white/5">
        <div className="flex items-center gap-4 px-4 py-3">
          <div className="flex items-center gap-3 w-[200px] lg:w-[240px] min-w-0 flex-shrink-0">
            {currentSong ? (
              <>
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#1a1a1a] flex-shrink-0">
                  <SafeImg src={currentSong.coverUrl} alt={currentSong.title} className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{currentSong.title}</p>
                  <p className="text-xs text-white/50 truncate">{currentSong.artist}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={toggleLike}
                  className={cn("flex-shrink-0 w-8 h-8", currentSong.liked ? "text-[#FF0000]" : "text-white/50 hover:text-[#FF0000]")}>
                  <Heart className={cn("w-4 h-4", currentSong.liked && "fill-current")} />
                </Button>
              </>
            ) : <div className="text-sm text-white/30">Sin reproduccion</div>}
          </div>

          <div className="flex-1 flex flex-col items-center gap-1.5">
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={() => setShuffle(!shuffle)} className={cn("w-8 h-8 text-white/50 hover:text-white", shuffle && "text-[#FF0000]")}><Shuffle className="w-4 h-4" /></Button>
              <Button variant="ghost" size="icon" onClick={skipPrev} className="w-8 h-8 text-white/50 hover:text-white"><SkipBack className="w-5 h-5" /></Button>
              <Button size="icon" onClick={togglePlay} className="w-9 h-9 rounded-full bg-[#FF0000] text-white hover:bg-[#FF0000]/80">
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={skipNext} className="w-8 h-8 text-white/50 hover:text-white"><SkipForward className="w-5 h-5" /></Button>
              <Button variant="ghost" size="icon" onClick={() => setRepeat(!repeat)} className={cn("w-8 h-8 text-white/50 hover:text-white", repeat && "text-[#FF0000]")}><Repeat className="w-4 h-4" /></Button>
            </div>
            <div className="flex items-center gap-2 w-full max-w-md">
              <span className="text-[10px] text-white/50 w-8 text-right tabular-nums">{formatTime(getCurrentTime())}</span>
              <div className="flex-1">
                <Slider value={[progress]} onValueChange={(v) => seekTo(v[0])} max={100} step={0.1}
                  className="[&_[role=slider]]:bg-[#FF0000] [&_[role=slider]]:border-[#FF0000] [&_[role=slider]]:w-3 [&_[role=slider]]:h-3 [&_.relative]:bg-white/20" />
              </div>
              <span className="text-[10px] text-white/50 w-8 tabular-nums">{currentSong?.duration || "0:00"}</span>
            </div>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            <Button variant="ghost" size="icon" onClick={() => { setShowQueue(!showQueue); setShowLyrics(false) }}
              className={cn("w-8 h-8 text-white/50 hover:text-white", showQueue && "text-[#FF0000]")}><ListMusic className="w-4 h-4" /></Button>
            <Button variant="ghost" size="icon" onClick={() => { setShowLyrics(!showLyrics); setShowQueue(false) }}
              className={cn("w-8 h-8 text-white/50 hover:text-white", showLyrics && "text-[#FF0000]")}><Mic2 className="w-4 h-4" /></Button>
            <div className="w-px h-5 bg-white/10 mx-1" />
            <Button variant="ghost" size="icon" onClick={() => setIsMuted(!isMuted)} className="w-8 h-8 text-white/50 hover:text-white">
              {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
            <div className="w-20">
              <Slider value={[isMuted ? 0 : volume]} onValueChange={(v) => { setVolume(v[0]); setIsMuted(false) }} max={100} step={1}
                className="[&_[role=slider]]:bg-white [&_[role=slider]]:border-white [&_[role=slider]]:w-2.5 [&_[role=slider]]:h-2.5 [&_.relative]:bg-white/20" />
            </div>
          </div>
        </div>
      </footer>

      {/* ---- MINI REPRODUCTOR MÓVIL ---- */}
      {currentSong && !mobilePlayerOpen && (
        <div className="fixed bottom-14 left-0 right-0 z-40 md:hidden bg-[#121212]/95 backdrop-blur-xl border-t border-white/5 px-4 py-2" onClick={() => setMobilePlayerOpen(true)}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#1a1a1a] flex-shrink-0">
              <SafeImg src={currentSong.coverUrl} alt={currentSong.title} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{currentSong.title}</p>
              <p className="text-xs text-white/50 truncate">{currentSong.artist}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); togglePlay() }} className="flex-shrink-0 w-10 h-10 rounded-full bg-[#FF0000] text-white">
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
            </Button>
          </div>
          <div className="mt-2 h-0.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-[#FF0000] transition-all duration-200" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {/* ---- NAVEGACIÓN MÓVIL ---- */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[#121212]/95 backdrop-blur-xl border-t border-white/5">
        <div className="flex items-center justify-around py-2">
          {[
            { icon: Home, label: "Inicio", view: "inicio" as const },
            { icon: Compass, label: "Descubrir", view: "descubrir" as const },
            { icon: Search, label: "Buscar", view: "canciones" as const },
            { icon: Library, label: "Biblioteca", view: "albumes" as const },
          ].map((item) => (
            <button key={item.label} onClick={() => setActiveView(item.view)}
              className={cn("flex flex-col items-center gap-0.5 px-4 py-1.5", activeView === item.view ? "text-[#FF0000]" : "text-white/50 hover:text-white")}>
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* ---- MODAL REPRODUCTOR MÓVIL ---- */}
      {mobilePlayerOpen && currentSong && (
        <div className="fixed inset-0 z-[60] bg-[#050505] md:hidden overflow-hidden">
          <div className="relative flex flex-col h-full">
            <div className="flex items-center justify-between px-6 py-4">
              <Button variant="ghost" size="icon" onClick={() => setMobilePlayerOpen(false)} className="text-white/60 hover:text-white"><ChevronDown className="w-7 h-7" /></Button>
              <span className="text-xs font-medium text-white/50 uppercase tracking-widest">Reproduciendo</span>
              <div className="w-10" />
            </div>
            {currentSong.videoId ? (
              <div className="mx-8 rounded-2xl overflow-hidden aspect-video">
                <iframe key={currentSong.videoId} src={`https://www.youtube.com/embed/${currentSong.videoId}?autoplay=0&controls=0&rel=0`}
                  className="w-full h-full" allow="autoplay; encrypted-media" allowFullScreen title={currentSong.title} />
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center px-10 py-4">
                <div className="w-full max-w-[320px] aspect-square rounded-2xl overflow-hidden">
                  <SafeImg src={currentSong.coverUrl} alt={currentSong.title} className="w-full h-full object-cover" />
                </div>
              </div>
            )}
            <div className="px-8 py-4 mt-2">
              <h2 className="text-2xl font-bold text-center truncate">{currentSong.title}</h2>
              <p className="text-base text-white/50 text-center mt-1 truncate">{currentSong.artist}</p>
            </div>
            <div className="px-8 py-2">
              <Slider value={[progress]} onValueChange={(v) => seekTo(v[0])} max={100} step={0.1}
                className="[&_[role=slider]]:bg-[#FF0000] [&_[role=slider]]:border-[#FF0000] [&_[role=slider]]:w-4 [&_[role=slider]]:h-4 [&_.relative]:bg-white/20" />
              <div className="flex justify-between mt-2">
                <span className="text-[11px] text-white/50 tabular-nums">{formatTime(getCurrentTime())}</span>
                <span className="text-[11px] text-white/50 tabular-nums">{currentSong.duration}</span>
              </div>
            </div>
            <div className="flex items-center justify-center gap-5 py-4">
              <Button variant="ghost" size="icon" onClick={() => setShuffle(!shuffle)} className={cn("w-12 h-12 text-white/50", shuffle && "text-[#FF0000]")}><Shuffle className="w-5 h-5" /></Button>
              <Button variant="ghost" size="icon" onClick={skipPrev} className="w-14 h-14 text-white"><SkipBack className="w-8 h-8 fill-current" /></Button>
              <Button size="icon" onClick={togglePlay} className="w-16 h-16 rounded-full bg-[#FF0000] text-white hover:bg-[#FF0000]/80">
                {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={skipNext} className="w-14 h-14 text-white"><SkipForward className="w-8 h-8 fill-current" /></Button>
              <Button variant="ghost" size="icon" onClick={() => setRepeat(!repeat)} className={cn("w-12 h-12 text-white/50", repeat && "text-[#FF0000]")}><Repeat className="w-5 h-5" /></Button>
            </div>
            <div className="flex items-center justify-around px-12 pb-8">
              <Button variant="ghost" size="icon" onClick={toggleLike} className={cn("w-12 h-12", currentSong.liked ? "text-[#FF0000]" : "text-white/50")}>
                <Heart className={cn("w-6 h-6", currentSong.liked && "fill-current")} />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => { setShowLyrics(!showLyrics); setShowQueue(false) }} className={cn("w-12 h-12", showLyrics ? "text-[#FF0000]" : "text-white/50")}><Mic2 className="w-6 h-6" /></Button>
              <Button variant="ghost" size="icon" onClick={() => { setShowQueue(!showQueue); setShowLyrics(false) }} className={cn("w-12 h-12", showQueue ? "text-[#FF0000]" : "text-white/50")}><ListMusic className="w-6 h-6" /></Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}