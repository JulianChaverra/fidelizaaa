'use client'

import { useEffect, useState } from 'react'

export default function InstalarPWA({ 
  titulo = "Instala Fidelizaaa", 
  descripcion = "Instala la aplicación directamente en tu pantalla de inicio para acceder en un solo toque sin consumir memoria.",
  icono = "📱"
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

    // 2. Detectar si es un dispositivo iOS (iPhone/iPad)
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

  // Ejecutar el prompt nativo si está disponible, o abrir modal con instrucciones
  const handleInstalarClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setDeferredPrompt(null)
        setMostrarModal(false)
      }
    } else {
      setMostrarModal(true)
    }
  }

  // Si la aplicación ya está instalada y ejecutándose como PWA, no renderizar nada
  if (yaInstalado) return null

  return (
    <>
      {/* BOTÓN FLOTANTE ESTILIZADO (Estilo Widget Nativo con Glassmorphism) */}
      <div className="pwa-btn-flotante-wrapper">
        <button
          onClick={handleInstalarClick}
          className="pwa-btn-flotante"
          type="button"
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
        <div className="pwa-modal-overlay" onClick={() => setMostrarModal(false)}>
          <div className="pwa-modal-card" onClick={(e) => e.stopPropagation()}>
            
            {/* Botón para cerrar */}
            <button
              onClick={() => setMostrarModal(false)}
              className="pwa-btn-cerrar"
              type="button"
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
                type="button"
              >
                Instalar en mi pantalla
              </button>
            )}

            {/* CASO 2: Navegadores Android / Desktop sin evento directo */}
            {!esIOS && !deferredPrompt && (
              <div className="pwa-instrucciones">
                <p className="pwa-instruccion-titulo">Pasos para instalar:</p>

                <ol className="list-decimal list-inside space-y-1 text-left">
                  <li>Toca el menú de tu navegador <b>(⋮ / Opciones)</b>.</li>
                  <li>Selecciona <b>"Instalar aplicación"</b> o <b>"Agregar a pantalla principal"</b>.</li>
                </ol>
              </div>
            )}

            {/* CASO 3: Safari en iPhone / iPad */}
            {esIOS && (
              <div className="pwa-instrucciones">
                <p className="pwa-instruccion-titulo">Instrucciones para iPhone / Safari:</p>

                <ol className="list-decimal list-inside space-y-1 text-left">
                  <li>Presiona el botón <b>Compartir</b> ⎘ en la barra inferior de Safari.</li>
                  <li>Selecciona la opción <b>"Agregar al inicio"</b> ➕.</li>
                </ol>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}