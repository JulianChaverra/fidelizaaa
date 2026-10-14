'use client'

import { useEffect, useState } from 'react'

export default function InstalarPWA() {
  const [promptEvent, setPromptEvent] = useState(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Detectar móvil
    const checkMobile = () => {
      const ua = navigator.userAgent
      const mobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(ua)
      setIsMobile(mobile)
    }

    checkMobile()

    const handler = (e) => {
      e.preventDefault()
      setPromptEvent(e)
      console.log('✅ Evento beforeinstallprompt capturado en móvil')
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const instalar = () => {
    if (promptEvent) {
      promptEvent.prompt()
      promptEvent.userChoice.then(() => setPromptEvent(null))
    }
  }

  if (!isMobile || !promptEvent) return null

  return (
    <div className="instalar-pwa-contenedor">
      <button onClick={instalar} className="instalar-pwa-boton">
        📲 Agregar a pantalla de inicio
      </button>
    </div>
  )
}
