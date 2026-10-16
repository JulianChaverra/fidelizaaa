'use client'

import { useState } from 'react'

export default function LogoUploader({ 
  value, 
  onChange, 
  comercioSlug = '', 
  label = "Logo del comercio (opcional)" 
}) {
  const [subiendo, setSubiendo] = useState(false)
  const [preview, setPreview] = useState(value || '')

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido (PNG, JPG, WEBP).')
      return
    }

    setSubiendo(true)

    try {
      // Determinar la extensión del archivo
      const extension = file.name.split('.').pop() || 'png'
      
      // Si recibimos comercioSlug/nombre, generamos la convención "slug-logo.ext"
      const targetFilename = comercioSlug 
        ? `${comercioSlug}-logo.${extension}`
        : file.name

      const res = await fetch(`/api/comercio/upload?filename=${encodeURIComponent(targetFilename)}`, {
        method: 'POST',
        body: file,
      })

      const data = await res.json()

      if (data.url) {
        setPreview(data.url)
        onChange(data.url)
      } else {
        alert('Error al subir la imagen')
      }
    } catch (err) {
      console.error(err)
      alert('Error de red al subir la imagen')
    } finally {
      setSubiendo(false)
    }
  }

  return (
    <div className="logo-uploader-container">
      <label className="logo-uploader-label">{label}</label>

      <div className="logo-uploader-box">
        {/* Preview / Visualizador */}
        <div className="logo-uploader-preview">
          {preview ? (
            <img src={preview} alt="Logo comercio" className="logo-uploader-img" />
          ) : (
            <div className="logo-uploader-placeholder">
              <span className="logo-uploader-icon">🏢</span>
              <span className="logo-uploader-text">Sin logo</span>
            </div>
          )}
        </div>

        {/* Botón personalizado verde */}
        <label className="logo-uploader-btn">
          <input
            type="file"
            accept="image/*"
            disabled={subiendo}
            onChange={handleFileChange}
            className="logo-uploader-input-file"
          />
          <span className="logo-uploader-btn-content">
            📷 {subiendo ? 'Subiendo imagen...' : 'Seleccionar Imagen'}
          </span>
        </label>
      </div>
    </div>
  )
}