import { useState, useEffect } from 'react'

export const useMusicPlayer = () => {
  const [playlist, setPlaylist] = useState([])
  const [isPlaying, setIsPlaying] = useState(false)

  // 1. Función para traer las canciones del Backend (Lista Doble)
  const fetchPlaylist = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/playlist')
      const data = await response.json()
      setPlaylist(data)
    } catch (error) {
      console.error("Error conectando con el backend:", error)
    }
  }

  // 2. Cargar la lista apenas abra la página
  useEffect(() => {
    fetchPlaylist()
  }, [])

  const togglePlay = () => setIsPlaying(!isPlaying)

  return {
    playlist,
    isPlaying,
    togglePlay,
    fetchPlaylist // Para refrescar cuando agreguemos canciones
  }
}