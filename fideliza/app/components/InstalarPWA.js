'use client'

import { useEffect, useState } from 'react'

export default function InstalarPWA({ 
  titulo = "Instala Fidelizaaa", 
  descripcion = "Instala la aplicación directamente en tu pantalla de inicio para acceder en un solo toque sin consumir memoria."
}) {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [mostrarModal, setMostrarModal] = useState(false)
  const [esIOS, setEsIOS] = useState(false)
  const [yaInstalado, setYaInstalado] = useState(false)

  useEffect(() => {
    // 1. Detectar si la WebApp ya está ejecutándose como PWA (standalone)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone
    if (isStandalone) {
      setYaInstalado(true)
      return
    }

    // 2. Detectar si es iOS (Safari)
    const userAgent = window.navigator.userAgent.toLowerCase()
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent)
    setEsIOS(isIosDevice)

    // 3. Capturar el evento nativo de instalación en Android / Chrome / Edge
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  // Disparar el prompt nativo
  const handleInstalarClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setDeferredPrompt(null)
        setMostrarModal(false)
      }
    }
  }

  if (yaInstalado) return null

  return (
    <>
      {/* BOTÓN FLOTANTE ESTILIZADO (Estilo Widget Nativo con Glassmorphism) */}
      <div className="pwa-btn-flotante-wrapper">
        <button
          onClick={() => setMostrarModal(true)}
          className="pwa-btn-flotante"
        >
          <div className="pwa-badge-logo">
            <img 
              src="/iconografia.png" 
              alt="Fidelizaaa Icono" 
              className="pwa-logo-img"
            />
          </div>
          <div className="pwa-texto-contenedor">
            <span className="pwa-titulo-btn">Instalar App</span>
            <span className="pwa-subtitulo-btn">Acceso rápido</span>
          </div>
        </button>
      </div>

      {/* MODAL POP-UP PERSONALIZADO DE INSTALACIÓN */}
      {mostrarModal && (
        <div className="pwa-modal-overlay">
          <div className="pwa-modal-card">
            
            {/* Botón para cerrar */}
            <button
              onClick={() => setMostrarModal(false)}
              className="pwa-btn-cerrar"
            >
              ✕
            </button>

            {/* Iconografía oficial destacada con brillo verde */}
            <div className="pwa-logo-destacado-container">
              <img 
                src="/iconografia.png" 
                alt="Fidelizaaa" 
                className="pwa-logo-destacado"
              />
            </div>

            <h3 className="pwa-modal-titulo">{titulo}</h3>
            <p className="pwa-modal-desc">{descripcion}</p>

            {/* CASO 1: Android / Chrome (Disparador Automático) */}
            {!esIOS && deferredPrompt && (
              <button
                onClick={handleInstalarClick}
                className="pwa-btn-confirmar"
              >
                Instalar en mi pantalla
              </button>
            )}

            {/* CASO 2: Navegadores generales */}
            {!esIOS && !deferredPrompt && (
              <div className="pwa-instrucciones">
                <p className="pwa-instruccion-titulo">Pasos para instalar:</p>
                <p>1. Toca el menú de tu navegador <strong>(⋮ / Opciones)</strong>.</p>
                <p>2. Selecciona <strong>"Instalar aplicación"</strong> o <strong>"Agregar a pantalla principal"</strong>.</p>
              </div>
            )}

            {/* CASO 3: Safari en iPhone / iPad */}
            {esIOS && (
              <div className="pwa-instrucciones">
                <p className="pwa-instruccion-titulo">Instrucciones para iPhone / Safari:</p>
                <p>1. Presiona el botón <strong>Compartir</strong> ⎘ en la barra inferior de Safari.</p>
                <p>2. Selecciona la opción <strong>"Agregar al inicio"</strong> ➕.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}