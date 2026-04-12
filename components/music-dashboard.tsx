"use client"

import { useState, useCallback } from "react"
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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

// Interfaz para canciones
interface Song {
  id: string
  title: string
  artist: string
  duration: string
  durationSeconds: number
  coverUrl: string
}

// Datos iniciales - canciones andinas con imagenes reales
const initialPlaylist: Song[] = [
  {
    id: "1",
    title: "Suenos del Altiplano",
    artist: "Los Kjarkas",
    duration: "4:32",
    durationSeconds: 272,
    coverUrl: "https://i.scdn.co/image/ab67616d0000b273d4e0b9f8f0e3f6e7c8f5e4d3",
  },
  {
    id: "2",
    title: "El Condor Pasa",
    artist: "Simon & Garfunkel",
    duration: "3:09",
    durationSeconds: 189,
    coverUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-jSnmoXHcrIDl6Cv8wojbEfAtRWU7qJ.png",
  },
  {
    id: "3",
    title: "Llorando se Fue",
    artist: "Los Kjarkas",
    duration: "5:21",
    durationSeconds: 321,
    coverUrl: "https://i.scdn.co/image/ab67616d0000b273e8b0f7f0d2e1c3a4b5c6d7e8",
  },
  {
    id: "4",
    title: "Ojos Azules",
    artist: "Gilberto Rojas",
    duration: "3:45",
    durationSeconds: 225,
    coverUrl: "https://i.scdn.co/image/ab67616d0000b273f1a2b3c4d5e6f7a8b9c0d1e2",
  },
  {
    id: "5",
    title: "Valicha",
    artist: "Miguel Angel Hurtado",
    duration: "4:15",
    durationSeconds: 255,
    coverUrl: "https://i.scdn.co/image/ab67616d0000b273a1b2c3d4e5f6a7b8c9d0e1f2",
  },
]

// Tendencias con imagenes SVG placeholder
const trendingSongs = [
  { title: "Saya Morena", artist: "Los Kjarkas", color: "#8B1A1A" },
  { title: "Wayayay", artist: "Kalamarka", color: "#1A5C8B" },
  { title: "Jilguero", artist: "Kala Marka", color: "#5C1A8B" },
  { title: "Flor de Un Dia", artist: "Savia Andina", color: "#1A8B5C" },
  { title: "Tiempo al Tiempo", artist: "Grupo Femenino Bolivia", color: "#8B5C1A" },
]

// Componente SVG para thumbnails de tendencias
function TrendingThumbnail({ title, color }: { title: string; color: string }) {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" fill={color} />
      <rect x="5" y="5" width="90" height="90" rx="8" fill="rgba(0,0,0,0.2)" />
      <path d="M50 25 L70 55 L30 55 Z" fill="rgba(255,255,255,0.3)" />
      <path d="M50 20 L75 60 L25 60 Z" fill="rgba(255,255,255,0.15)" />
      <circle cx="50" cy="72" r="12" fill="rgba(255,255,255,0.2)" />
      <path d="M46 68 L58 72 L46 76 Z" fill="rgba(255,255,255,0.4)" />
      <text x="50" y="95" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="6" fontFamily="sans-serif">
        {title.substring(0, 10)}
      </text>
    </svg>
  )
}

// Items del menu - Solo Inicio y Descubrir
const menuItems = [
  { icon: Home, label: "Inicio", active: true },
  { icon: Compass, label: "Descubrir", active: false },
]

const libraryItems = [
  { icon: Disc3, label: "Albumes", count: 24 },
  { icon: Music2, label: "Canciones", count: 156 },
  { icon: Users, label: "Artistas", count: 18 },
]

export function MusicDashboard() {
  // Estados
  const [playlist, setPlaylist] = useState<Song[]>(initialPlaylist)
  const [currentSong, setCurrentSong] = useState<Song | null>(initialPlaylist[0])
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [volume, setVolume] = useState(70)
  const [isMuted, setIsMuted] = useState(false)
  const [positionIndex, setPositionIndex] = useState("")
  const [mobilePlayerOpen, setMobilePlayerOpen] = useState(false)
  const [shuffle, setShuffle] = useState(false)
  const [repeat, setRepeat] = useState(false)

  // Funciones DLL
  const addToStart = useCallback(() => {
    const newSong: Song = {
      id: `new-${Date.now()}`,
      title: "Nueva Cancion",
      artist: "Artista Nuevo",
      duration: "3:30",
      durationSeconds: 210,
      coverUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-jSnmoXHcrIDl6Cv8wojbEfAtRWU7qJ.png",
    }
    setPlaylist((prev) => [newSong, ...prev])
  }, [])

  const addToEnd = useCallback(() => {
    const newSong: Song = {
      id: `new-${Date.now()}`,
      title: "Nueva Cancion",
      artist: "Artista Nuevo",
      duration: "3:30",
      durationSeconds: 210,
      coverUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-jSnmoXHcrIDl6Cv8wojbEfAtRWU7qJ.png",
    }
    setPlaylist((prev) => [...prev, newSong])
  }, [])

  const addAtPosition = useCallback(() => {
    const index = parseInt(positionIndex)
    if (isNaN(index) || index < 0) return
    const newSong: Song = {
      id: `new-${Date.now()}`,
      title: "Nueva Cancion",
      artist: "Artista Nuevo",
      duration: "3:30",
      durationSeconds: 210,
      coverUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-jSnmoXHcrIDl6Cv8wojbEfAtRWU7qJ.png",
    }
    setPlaylist((prev) => {
      const newList = [...prev]
      const insertIndex = Math.min(index, newList.length)
      newList.splice(insertIndex, 0, newSong)
      return newList
    })
    setPositionIndex("")
  }, [positionIndex])

  const deleteSong = useCallback((id: string) => {
    setPlaylist((prev) => prev.filter((song) => song.id !== id))
    if (currentSong?.id === id) {
      setCurrentSong(playlist.find((s) => s.id !== id) || null)
    }
  }, [currentSong, playlist])

  const playSong = useCallback((song: Song) => {
    setCurrentSong(song)
    setIsPlaying(true)
    setProgress(0)
  }, [])

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev)
  }, [])

  const skipNext = useCallback(() => {
    if (!currentSong) return
    const currentIndex = playlist.findIndex((s) => s.id === currentSong.id)
    const nextIndex = (currentIndex + 1) % playlist.length
    setCurrentSong(playlist[nextIndex])
    setProgress(0)
  }, [currentSong, playlist])

  const skipPrev = useCallback(() => {
    if (!currentSong) return
    const currentIndex = playlist.findIndex((s) => s.id === currentSong.id)
    const prevIndex = currentIndex === 0 ? playlist.length - 1 : currentIndex - 1
    setCurrentSong(playlist[prevIndex])
    setProgress(0)
  }, [currentSong, playlist])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const currentTime = currentSong ? (progress / 100) * currentSong.durationSeconds : 0

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Layout principal */}
      <div className="flex min-h-screen">
        {/* Left Sidebar - Visible en pantallas md+ */}
        <aside className="hidden md:flex flex-col w-[220px] lg:w-[260px] bg-[#121212]/80 backdrop-blur-xl border-r border-white/5 h-screen sticky top-0">
          <div className="flex flex-col h-full p-4 lg:p-6">
            {/* Header con logo */}
            <div className="flex items-center gap-3 mb-6">
              <img 
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Gemini_Generated_Image_nhymfbnhymfbnhym-removebg-preview-WS8m76nVgvPv6AM7C5JqfLz7EF9BkO.png" 
                alt="Andes Sound Logo" 
                className="w-10 h-10 lg:w-12 lg:h-12 object-contain"
              />
              <span className="text-base lg:text-lg font-semibold">Andes Sound</span>
            </div>

            {/* Menu */}
            <nav className="space-y-1">
              <p className="text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-3 px-3">
                Menu
              </p>
              {menuItems.map((item) => (
                <button
                  key={item.label}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 hover:translate-x-1",
                    item.active
                      ? "bg-[#FF0000]/10 text-[#FF0000]"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>

            {/* Biblioteca */}
            <div className="mt-6">
              <p className="text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-3 px-3">
                Biblioteca
              </p>
              <nav className="space-y-1">
                {libraryItems.map((item) => (
                  <button
                    key={item.label}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/5 transition-all duration-200 hover:translate-x-1"
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                    <span className="ml-auto text-xs text-white/30">{item.count}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </aside>

        {/* Contenido principal */}
        <main className="flex-1 pb-40 md:pb-28 overflow-x-hidden">
          <div className="px-4 md:px-8 py-6 space-y-6 w-full max-w-full">
            {/* Tendencias en YouTube */}
            <section className="w-full overflow-hidden">
              <h2 className="text-lg font-semibold mb-4">Tendencias en YouTube</h2>
              <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                {trendingSongs.map((trend, index) => (
                  <div
                    key={index}
                    className="flex-shrink-0 w-24 sm:w-28 md:w-32 group cursor-pointer"
                  >
                    <div className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-xl overflow-hidden bg-[#121212] border border-white/5 mb-2">
                      <TrendingThumbnail title={trend.title} color={trend.color} />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-[#FF0000] flex items-center justify-center transform scale-90 group-hover:scale-100 transition-transform duration-200">
                          <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                        </div>
                      </div>
                    </div>
                    <p className="text-sm font-medium truncate text-white">{trend.title}</p>
                    <p className="text-xs text-white/50 truncate">{trend.artist}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Barra de gestion DLL */}
            <section className="inline-flex flex-wrap items-center justify-center gap-2 p-3 bg-[#121212] rounded-xl border border-white/5">
              <span className="text-xs font-medium text-white/50 mr-1">
                Gestion DLL:
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={addToStart}
                className="h-8 px-3 border-[#FF0000]/40 text-[#FF0000] bg-transparent hover:bg-[#FF0000]/10 hover:text-[#FF0000] hover:border-[#FF0000]/60 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Inicio
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={addToEnd}
                className="h-8 px-3 border-[#FF0000]/40 text-[#FF0000] bg-transparent hover:bg-[#FF0000]/10 hover:text-[#FF0000] hover:border-[#FF0000]/60 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Final
              </Button>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addAtPosition}
                  className="h-8 px-3 border-[#FF0000]/40 text-[#FF0000] bg-transparent hover:bg-[#FF0000]/10 hover:text-[#FF0000] hover:border-[#FF0000]/60 transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Posicion
                </Button>
                <Input
                  type="number"
                  placeholder="#"
                  value={positionIndex}
                  onChange={(e) => setPositionIndex(e.target.value)}
                  className="w-14 h-8 text-sm bg-[#050505] border-white/10 text-white placeholder:text-white/30 text-center"
                  min="0"
                />
              </div>
            </section>

            {/* Playlist */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Playlist</h2>
                <span className="text-sm text-white/50">
                  {playlist.length} canciones
                </span>
              </div>

              {/* Tabla Desktop */}
              <div className="hidden md:block bg-[#121212] rounded-xl border border-white/5 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5 text-left">
                      <th className="px-4 py-3 text-[10px] font-semibold text-white/40 uppercase tracking-widest w-12">
                        #
                      </th>
                      <th className="px-4 py-3 text-[10px] font-semibold text-white/40 uppercase tracking-widest">
                        Titulo
                      </th>
                      <th className="px-4 py-3 text-[10px] font-semibold text-white/40 uppercase tracking-widest">
                        Artista
                      </th>
                      <th className="px-4 py-3 text-[10px] font-semibold text-white/40 uppercase tracking-widest text-right">
                        Tiempo
                      </th>
                      <th className="px-4 py-3 text-[10px] font-semibold text-white/40 uppercase tracking-widest text-center w-24">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {playlist.map((song, index) => (
                      <tr
                        key={song.id}
                        className={cn(
                          "border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer group",
                          currentSong?.id === song.id && "bg-[#FF0000]/5"
                        )}
                        onClick={() => playSong(song)}
                      >
                        <td className="px-4 py-3 text-sm text-white/40">
                          {String(index + 1).padStart(2, "0")}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                              <img
                                src={song.coverUrl}
                                alt={song.title}
                                className="w-full h-full object-cover"
                              />
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
                            <span
                              className={cn(
                                "text-sm font-medium",
                                currentSong?.id === song.id ? "text-[#FF0000]" : "text-white"
                              )}
                            >
                              {song.title}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-white/50">
                          {song.artist}
                        </td>
                        <td className="px-4 py-3 text-sm text-white/50 text-right">
                          {song.duration}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteSong(song.id)
                            }}
                            className="text-[#FF0000] hover:text-[#FF0000] hover:bg-[#FF0000]/10 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Tarjetas Movil */}
              <div className="md:hidden space-y-2">
                {playlist.map((song, index) => (
                  <div
                    key={song.id}
                    className={cn(
                      "flex items-center gap-3 p-3 bg-[#121212] rounded-xl border border-white/5",
                      currentSong?.id === song.id && "border-[#FF0000]/30 bg-[#FF0000]/5"
                    )}
                    onClick={() => {
                      playSong(song)
                      setMobilePlayerOpen(true)
                    }}
                  >
                    <span className="text-xs text-white/40 w-5 text-center">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                      <img
                        src={song.coverUrl}
                        alt={song.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          "text-sm font-medium truncate",
                          currentSong?.id === song.id ? "text-[#FF0000]" : "text-white"
                        )}
                      >
                        {song.title}
                      </p>
                      <p className="text-xs text-white/50 truncate">{song.artist}</p>
                    </div>
                    <span className="text-xs text-white/40">{song.duration}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="flex-shrink-0 w-10 h-10 rounded-full bg-[#FF0000] text-white hover:bg-[#FF0000]/80"
                      onClick={(e) => {
                        e.stopPropagation()
                        playSong(song)
                        setMobilePlayerOpen(true)
                      }}
                    >
                      <Play className="w-4 h-4 fill-current" />
                    </Button>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </main>

        {/* Right Sidebar - Solo Desktop lg+ - Sin scroll */}
        <aside className="hidden lg:flex flex-col w-[320px] xl:w-[350px] bg-[#121212]/80 backdrop-blur-xl border-l border-white/5 h-screen sticky top-0 overflow-hidden">
          {/* Seccion 1: Ruleta Inteligente */}
          <div className="p-4 xl:p-5 border-b border-white/5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-[#FF0000]/10 flex items-center justify-center border border-[#FF0000]/20">
                <Sparkles className="w-4 h-4 text-[#FF0000]" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Ruleta de Generos</h3>
                <p className="text-[10px] text-white/40">Descubre canciones basadas en tu historial</p>
              </div>
            </div>

            {/* Widget de Ruleta - Compacto */}
            <div className="relative bg-[#050505] rounded-xl border border-white/5 p-3 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#FF0000]/5 via-transparent to-transparent" />
              
              <div className="relative flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#FF0000]/20 to-[#FF0000]/5 flex items-center justify-center border-2 border-[#FF0000]/30 mb-2 transition-all duration-300 hover:scale-110 hover:rotate-180 cursor-pointer active:scale-95">
                  <Dices className="w-6 h-6 text-[#FF0000]" />
                </div>
                <p className="text-xs font-medium mb-2">Mezcla Inteligente</p>
                <Button
                  size="sm"
                  className="w-full bg-[#FF0000] hover:bg-[#FF0000]/80 text-white rounded-lg py-2 text-xs font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Shuffle className="w-3 h-3 mr-1.5" />
                  Girar Ruleta
                </Button>
              </div>
            </div>
          </div>

          {/* Seccion 2: Reproductor en Vivo */}
          <div className="flex-1 p-4 xl:p-5 flex flex-col">
            <h3 className="text-sm font-semibold mb-3">Reproductor en Vivo</h3>

            {currentSong ? (
              <div className="flex-1 flex flex-col bg-[#050505] rounded-xl border border-white/5 overflow-hidden">
                {/* Caratula - Area para video de YouTube */}
                <div className="relative aspect-video w-full bg-black">
                  <img
                    src={currentSong.coverUrl}
                    alt={currentSong.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-60" />
                  {/* Overlay de Play para video */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                    <div className="w-12 h-12 rounded-full bg-[#FF0000]/90 flex items-center justify-center transition-transform hover:scale-110">
                      <Play className="w-6 h-6 text-white fill-white ml-0.5" />
                    </div>
                  </div>
                </div>

                {/* Info Cancion */}
                <div className="px-3 pt-2 pb-1 text-center">
                  <h4 className="text-sm font-bold truncate">{currentSong.title}</h4>
                  <p className="text-[11px] text-white/50 truncate">{currentSong.artist}</p>
                </div>

                {/* Barra de Progreso */}
                <div className="px-3 pb-1">
                  <Slider
                    value={[progress]}
                    onValueChange={(value) => setProgress(value[0])}
                    max={100}
                    step={0.1}
                    className="[&_[role=slider]]:bg-[#FF0000] [&_[role=slider]]:border-[#FF0000] [&_[role=slider]]:w-2 [&_[role=slider]]:h-2 [&_[data-orientation=horizontal]>.bg-primary]:bg-[#FF0000] [&_.relative]:bg-white/20"
                  />
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-[8px] text-white/40 tabular-nums">
                      {formatTime(currentTime)}
                    </span>
                    <span className="text-[8px] text-white/40 tabular-nums">
                      {currentSong.duration}
                    </span>
                  </div>
                </div>

                {/* Controles */}
                <div className="flex items-center justify-center gap-1 px-3 pb-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShuffle(!shuffle)}
                    className={cn(
                      "w-7 h-7 text-white/40 hover:text-white transition-all duration-200 hover:scale-110 active:scale-95",
                      shuffle && "text-[#FF0000]"
                    )}
                  >
                    <Shuffle className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={skipPrev}
                    className="w-8 h-8 text-white hover:text-white/80 transition-all duration-200 hover:scale-110 active:scale-95"
                  >
                    <SkipBack className="w-4 h-4 fill-current" />
                  </Button>
                  <Button
                    size="icon"
                    onClick={togglePlay}
                    className="w-10 h-10 rounded-full bg-[#FF0000] text-white hover:bg-[#FF0000]/80 transition-all duration-200 hover:scale-105 active:scale-95"
                  >
                    {isPlaying ? (
                      <Pause className="w-4 h-4 fill-current" />
                    ) : (
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={skipNext}
                    className="w-8 h-8 text-white hover:text-white/80 transition-all duration-200 hover:scale-110 active:scale-95"
                  >
                    <SkipForward className="w-4 h-4 fill-current" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setRepeat(!repeat)}
                    className={cn(
                      "w-7 h-7 text-white/40 hover:text-white transition-all duration-200 hover:scale-110 active:scale-95",
                      repeat && "text-[#FF0000]"
                    )}
                  >
                    <Repeat className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center bg-[#050505] rounded-xl border border-white/5 p-4">
                <Disc3 className="w-10 h-10 text-white/10 mb-2" />
                <p className="text-xs text-white/40 text-center">
                  Selecciona una cancion
                </p>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Reproductor Desktop */}
      <footer className="fixed bottom-0 left-0 right-0 lg:right-[320px] xl:right-[350px] z-40 hidden md:block bg-[#121212]/95 backdrop-blur-xl border-t border-white/5">
        <div className="flex items-center gap-4 px-4 py-3">
          {/* Info cancion */}
          <div className="flex items-center gap-3 w-[200px] lg:w-[240px] min-w-0 flex-shrink-0">
            {currentSong ? (
              <>
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                  <img
                    src={currentSong.coverUrl}
                    alt={currentSong.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{currentSong.title}</p>
                  <p className="text-xs text-white/50 truncate">{currentSong.artist}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="flex-shrink-0 w-8 h-8 text-white/50 hover:text-[#FF0000]"
                >
                  <Heart className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <div className="text-sm text-white/30">Sin reproduccion</div>
            )}
          </div>

          {/* Controles centrales */}
          <div className="flex-1 flex flex-col items-center gap-1.5">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShuffle(!shuffle)}
                className={cn(
                  "w-8 h-8 text-white/50 hover:text-white transition-all duration-200 hover:scale-110 active:scale-95",
                  shuffle && "text-[#FF0000]"
                )}
              >
                <Shuffle className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={skipPrev}
                className="w-8 h-8 text-white/50 hover:text-white transition-all duration-200 hover:scale-110 active:scale-95"
              >
                <SkipBack className="w-5 h-5" />
              </Button>
              <Button
                size="icon"
                onClick={togglePlay}
                className="w-9 h-9 rounded-full bg-[#FF0000] text-white hover:bg-[#FF0000]/80 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={skipNext}
                className="w-8 h-8 text-white/50 hover:text-white transition-all duration-200 hover:scale-110 active:scale-95"
              >
                <SkipForward className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setRepeat(!repeat)}
                className={cn(
                  "w-8 h-8 text-white/50 hover:text-white transition-all duration-200 hover:scale-110 active:scale-95",
                  repeat && "text-[#FF0000]"
                )}
              >
                <Repeat className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2 w-full max-w-md">
              <span className="text-[10px] text-white/50 w-8 text-right tabular-nums">
                {formatTime(currentTime)}
              </span>
              <div className="flex-1 group">
                <Slider
                  value={[progress]}
                  onValueChange={(value) => setProgress(value[0])}
                  max={100}
                  step={0.1}
                  className="[&_[role=slider]]:bg-[#FF0000] [&_[role=slider]]:border-[#FF0000] [&_[role=slider]]:w-3 [&_[role=slider]]:h-3 [&_[data-orientation=horizontal]>.bg-primary]:bg-[#FF0000] [&_.relative]:bg-white/20"
                />
              </div>
              <span className="text-[10px] text-white/50 w-8 tabular-nums">
                {currentSong?.duration || "0:00"}
              </span>
            </div>
          </div>

          {/* Panel de control */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button variant="ghost" size="icon" className="w-8 h-8 text-white/50 hover:text-white">
              <ListMusic className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="w-8 h-8 text-white/50 hover:text-white">
              <Mic2 className="w-4 h-4" />
            </Button>
            <div className="w-px h-5 bg-white/10 mx-1" />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMuted(!isMuted)}
              className="w-8 h-8 text-white/50 hover:text-white"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </Button>
            <div className="w-20">
              <Slider
                value={[isMuted ? 0 : volume]}
                onValueChange={(value) => {
                  setVolume(value[0])
                  setIsMuted(false)
                }}
                max={100}
                step={1}
                className="[&_[role=slider]]:bg-white [&_[role=slider]]:border-white [&_[role=slider]]:w-2.5 [&_[role=slider]]:h-2.5 [&_[data-orientation=horizontal]>.bg-primary]:bg-white [&_.relative]:bg-white/20"
              />
            </div>
          </div>
        </div>
      </footer>

      {/* Mini reproductor movil */}
      {currentSong && !mobilePlayerOpen && (
        <div
          className="fixed bottom-14 left-0 right-0 z-40 md:hidden bg-[#121212]/95 backdrop-blur-xl border-t border-white/5 px-4 py-2"
          onClick={() => setMobilePlayerOpen(true)}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
              <img
                src={currentSong.coverUrl}
                alt={currentSong.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{currentSong.title}</p>
              <p className="text-xs text-white/50 truncate">{currentSong.artist}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation()
                togglePlay()
              }}
              className="flex-shrink-0 w-10 h-10 rounded-full bg-[#FF0000] text-white"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </Button>
          </div>
          <div className="mt-2 h-0.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#FF0000] transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Navegacion inferior movil - Con botones de menu */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[#121212]/95 backdrop-blur-xl border-t border-white/5">
        <div className="flex items-center justify-around py-2">
          <button className="flex flex-col items-center gap-0.5 px-4 py-1.5 text-[#FF0000] transition-all duration-200 active:scale-90">
            <Home className="w-5 h-5" />
            <span className="text-[10px] font-medium">Inicio</span>
          </button>
          <button className="flex flex-col items-center gap-0.5 px-4 py-1.5 text-white/50 transition-all duration-200 hover:text-white active:scale-90">
            <Compass className="w-5 h-5" />
            <span className="text-[10px] font-medium">Descubrir</span>
          </button>
          <button className="flex flex-col items-center gap-0.5 px-4 py-1.5 text-white/50 transition-all duration-200 hover:text-white active:scale-90">
            <Search className="w-5 h-5" />
            <span className="text-[10px] font-medium">Buscar</span>
          </button>
          <button className="flex flex-col items-center gap-0.5 px-4 py-1.5 text-white/50 transition-all duration-200 hover:text-white active:scale-90">
            <Library className="w-5 h-5" />
            <span className="text-[10px] font-medium">Biblioteca</span>
          </button>
        </div>
      </nav>

      {/* Modal reproductor pantalla completa - Movil */}
      {mobilePlayerOpen && currentSong && (
        <div className="fixed inset-0 z-[60] bg-[#050505] md:hidden overflow-hidden">
          {/* Fondo con degradado sutil */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background: `radial-gradient(ellipse at center top, rgba(255,0,0,0.15) 0%, transparent 60%)`,
            }}
          />

          <div className="relative flex flex-col h-full safe-area-inset">
            {/* Header con chevron minimizar */}
            <div className="flex items-center justify-between px-6 py-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobilePlayerOpen(false)}
                className="text-white/60 hover:text-white"
              >
                <ChevronDown className="w-7 h-7" />
              </Button>
              <span className="text-xs font-medium text-white/50 uppercase tracking-widest">
                Reproduciendo
              </span>
              <div className="w-10" />
            </div>

            {/* Caratula grande */}
            <div className="flex-1 flex items-center justify-center px-10 py-4">
              <div className="w-full max-w-[320px] aspect-square rounded-2xl overflow-hidden shadow-2xl shadow-black/50">
                <img
                  src={currentSong.coverUrl}
                  alt={currentSong.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Info cancion */}
            <div className="px-8 py-4">
              <h2 className="text-2xl font-bold text-center truncate">
                {currentSong.title}
              </h2>
              <p className="text-base text-white/50 text-center mt-1 truncate">
                {currentSong.artist}
              </p>
            </div>

            {/* Barra de progreso roja */}
            <div className="px-8 py-2">
              <Slider
                value={[progress]}
                onValueChange={(value) => setProgress(value[0])}
                max={100}
                step={0.1}
                className="[&_[role=slider]]:bg-[#FF0000] [&_[role=slider]]:border-[#FF0000] [&_[role=slider]]:w-4 [&_[role=slider]]:h-4 [&_[data-orientation=horizontal]>.bg-primary]:bg-[#FF0000] [&_.relative]:bg-white/20"
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-[11px] text-white/50 tabular-nums">
                  {formatTime(currentTime)}
                </span>
                <span className="text-[11px] text-white/50 tabular-nums">
                  {currentSong.duration}
                </span>
              </div>
            </div>

            {/* Controles grandes */}
            <div className="flex items-center justify-center gap-5 py-6">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShuffle(!shuffle)}
                className={cn(
                  "w-12 h-12 text-white/50",
                  shuffle && "text-[#FF0000]"
                )}
              >
                <Shuffle className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={skipPrev}
                className="w-14 h-14 text-white"
              >
                <SkipBack className="w-8 h-8 fill-current" />
              </Button>
              <Button
                size="icon"
                onClick={togglePlay}
                className="w-18 h-18 rounded-full bg-[#FF0000] text-white hover:bg-[#FF0000]/80 p-5"
              >
                {isPlaying ? (
                  <Pause className="w-10 h-10 fill-current" />
                ) : (
                  <Play className="w-10 h-10 fill-current ml-1" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={skipNext}
                className="w-14 h-14 text-white"
              >
                <SkipForward className="w-8 h-8 fill-current" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setRepeat(!repeat)}
                className={cn(
                  "w-12 h-12 text-white/50",
                  repeat && "text-[#FF0000]"
                )}
              >
                <Repeat className="w-5 h-5" />
              </Button>
            </div>

            {/* Iconos cola/letras */}
            <div className="flex items-center justify-around px-12 py-6 pb-10">
              <Button
                variant="ghost"
                size="icon"
                className="w-12 h-12 text-white/50 hover:text-white"
              >
                <Mic2 className="w-6 h-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="w-12 h-12 text-white/50 hover:text-white"
              >
                <ListMusic className="w-6 h-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMuted(!isMuted)}
                className="w-12 h-12 text-white/50 hover:text-white"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-6 h-6" />
                ) : (
                  <Volume2 className="w-6 h-6" />
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
