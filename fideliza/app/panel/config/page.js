'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import LogoUploader from '../../components/LogoUploader'
import './config.css'

// Función helper para calcular el contraste de color
function esColorOscuro(hex) {
  if (!hex) return false
  const color = hex.replace("#", "")
  const r = parseInt(color.substr(0, 2), 16)
  const g = parseInt(color.substr(2, 2), 16)
  const b = parseInt(color.substr(4, 2), 16)
  const brillo = (r * 299 + g * 587 + b * 114) / 1000
  return brillo < 128
}

export default function ConfigComercio() {
  const router = useRouter()
  const [comercio, setComercio] = useState(null)
  const [logoUrl, setLogoUrl] = useState('')
  const [color, setColor] = useState('#3b6e52')
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState('')

  const comercioToken = Cookies.get('fidelizaComercioToken')

  useEffect(() => {
    if (!comercioToken) {
      router.push('/panel/login')
      return
    }

    fetch('/api/comercio/detalle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: comercioToken }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.comercio) {
          setComercio(data.comercio)
          setLogoUrl(data.comercio.logoUrl || '')
          setColor(data.comercio.color || '#3b6e52')
        }
      })
  }, [comercioToken, router])

  const handleGuardar = async (e) => {
    e.preventDefault()
    setGuardando(true)
    setMensaje('')

    try {
      const res = await fetch('/api/comercio/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: comercioToken,
          logoUrl,
          color,
        }),
      })

      const data = await res.json()
      if (data.success) {
        setMensaje('¡Configuración guardada correctamente!')
        setTimeout(() => setMensaje(''), 3000)
      } else {
        setMensaje(data.error || 'Error al guardar los cambios')
      }
    } catch (err) {
      console.error(err)
      setMensaje('Error de conexión con el servidor')
    } finally {
      setGuardando(false)
    }
  }

  // Determinamos dinámicamente si el texto debe ser blanco o negro
  const claseTextoPreview = esColorOscuro(color) ? "text-white" : "text-black"

  return (
    <main className="config-main">
      {/* Header Unificado */}
      <div className="config-encabezado">
        <img src="/logo-fideliza.png" alt="Fideliza" className="config-logo-fideliza" />
      </div>

      {/* Botón Volver al Panel */}
      <div className="config-nav-back">
        <button
          type="button"
          onClick={() => router.push('/panel')}
          className="config-boton-volver"
        >
          ← Volver al panel
        </button>
      </div>

      <h1 className="config-titulo-seccion">Personalizar marca y logo</h1>

      {/* Formulario de Configuración */}
      <form onSubmit={handleGuardar} className="config-card-form">
        <LogoUploader
          value={logoUrl}
          onChange={(newUrl) => setLogoUrl(newUrl)}
          comercioSlug={comercio?.slug || comercio?.nombre}
          label="Logo oficial del comercio"
        />

        <div className="config-grupo-campo">
          <label className="config-label-field">Color distintivo de tu tarjeta</label>
          <div className="config-color-picker-box">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="config-color-input"
            />
            <span className="config-color-hex">{color}</span>
            <span className="config-color-muestra" style={{ backgroundColor: color }}></span>
          </div>
        </div>

        {/* Vista previa limpia con contraste dinámico de texto */}
        <div 
          className={`config-preview-tarjeta ${claseTextoPreview}`} 
          style={{ backgroundColor: color }}
        >
          <p className="config-preview-sub">Vista previa tarjeta cliente</p>
          <img src={logoUrl} alt={comercio?.nombre} className="tarjeta-logo" />
          <p className="config-preview-nombre">{comercio?.nombre || "Tu Comercio"}</p>
        </div>

        {mensaje && (
          <p className="config-mensaje-exito">{mensaje}</p>
        )}

        <button
          type="submit"
          disabled={guardando}
          className="config-btn-guardar"
        >
          {guardando ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>

      {/* Footer Unificado */}
      <footer className="config-footer">
        Fideliza · Gana puntos, redime experiencias
      </footer>
    </main>
  )
}