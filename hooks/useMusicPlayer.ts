import { useState } from 'react'

export const useMusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentSong, setCurrentSong] = useState(null)

  const togglePlay = () => setIsPlaying(!isPlaying)

  return {
    isPlaying,
    currentSong,
    setCurrentSong,
    togglePlay
  }
}