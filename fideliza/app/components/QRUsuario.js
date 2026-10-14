// /components/QRUsuario.js
"use client"

import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

export default function QRUsuario({ token }) {
  const [qrUrl, setQrUrl] = useState(null)

  useEffect(() => {
    if (!token) return

    QRCode.toDataURL(token, { width: 250 }, (err, url) => {
      if (err) {
        console.error('Error generando QR:', err)
        return
      }
      setQrUrl(url)
    })
  }, [token])

  if (!qrUrl) return <p>Generando código QR...</p>

  return (
    <div className="flex flex-col items-center mt-6 px-4">
      <img
        src={qrUrl}
        alt="Código QR"
        className="w-[100%] max-w-sm h-auto"
      />
      <p className="text-sm mt-2 text-center">
        Muestra este código en el comercio<br />para sumar o redimir puntos
      </p>
    </div>
  )
  
}
