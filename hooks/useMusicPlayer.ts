import { useState, useEffect } from 'react'

export const useMusicPlayer = () => {
  const [playlist, setPlaylist] = useState([])
  const [isPlaying, setIsPlaying] = useState(false)

  // 1. Traer la lista desde el Backend (DLL)
  const fetchPlaylist = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/playlist')
      const data = await response.json()
      setPlaylist(data)
    } catch (error) {
      console.error("Error al cargar la playlist:", error)
    }
  }

  // 2. Definir la función togglePlay (¡Esto es lo que te faltaba!)
  const togglePlay = () => {
    setIsPlaying(!isPlaying)
  }

  // 3. Función para insertar al inicio (Punteros en el Back)
  const addSongAtHead = async () => {
    const newSong = {
      title: "Nueva Canción " + (playlist.length + 1),
      artist: "Artista UCC",
      duration: "3:30",
      coverUrl: "https://via.placeholder.com/150"
    }

    try {
      await fetch('http://localhost:5000/api/playlist/head', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSong)
      })
      fetchPlaylist() // Recargamos la lista para ver el cambio
    } catch (error) {
      console.error("Error al insertar al inicio:", error)
    }
  }

  // 4. Cargar datos al iniciar el componente
  useEffect(() => {
    fetchPlaylist()
  }, [])

  // 5. Retornamos todo para que el Dashboard lo use
  return {
    playlist,
    isPlaying,
    addSongAtHead,
    togglePlay // Ahora sí tiene un valor definido arriba
  }
}