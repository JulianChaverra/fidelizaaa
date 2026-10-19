'use client'

import { useState } from 'react'

export default function PremioUploader({ 
  value, 
  onChange, 
  comercioId = '', 
  nombrePremio = '', 
  label = "Imagen del premio" 
}) {
  const [subiendo, setSubiendo] = useState(false)
  const [preview, setPreview] = useState(value || '')

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona una imagen válida (PNG, JPG, WEBP).')
      return
    }

    setSubiendo(true)

    try {
      const extension = file.name.split('.').pop() || 'png'

      // Limpiar nombre del premio para evitar espacios o caracteres especiales
      const cleanPremio = (nombrePremio || 'premio')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')

      const cleanComercioId = (comercioId || 'comercio')
        .trim()
        .toLowerCase()

      // Generar número aleatorio de 4 dígitos entre 1000 y 9999
      const random4 = Math.floor(1000 + Math.random() * 9000)

      // Nombrado exacto: comercioid-nombrepremio-numerorandomde4digitos.ext
      const targetFilename = `${cleanComercioId}-${cleanPremio}-${random4}.${extension}`

      const res = await fetch(`/api/comercio/upload?filename=${encodeURIComponent(targetFilename)}`, {
        method: 'POST',
        body: file,
      })

      const data = await res.json()

      if (data.url) {
        setPreview(data.url)
        onChange(data.url)
      } else {
        alert('Error al subir la imagen del premio')
      }
    } catch (err) {
      console.error('Error al subir premio:', err)
      alert('Error de red al subir la imagen')
    } finally {
      setSubiendo(false)
    }
  }

  return (
    <div className="logo-uploader-container" style={{ margin: '0.8rem 0' }}>
      <label className="logo-uploader-label">{label}</label>

      <div className="logo-uploader-box">
        <div className="logo-uploader-preview">
          {preview ? (
            <img src={preview} alt="Vista previa premio" className="logo-uploader-img" />
          ) : (
            <div className="logo-uploader-placeholder">
              <span className="logo-uploader-icon">🎁</span>
              <span className="logo-uploader-text">Sin foto</span>
            </div>
          )}
        </div>

        <label className="logo-uploader-btn">
          <input
            type="file"
            accept="image/*"
            disabled={subiendo}
            onChange={handleFileChange}
            className="logo-uploader-input-file"
          />
          <span className="logo-uploader-btn-content">
            📷 {subiendo ? 'Subiendo...' : 'Seleccionar Imagen'}
          </span>
        </label>
      </div>
    </div>
  )
}