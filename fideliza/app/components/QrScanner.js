'use client'

import { useEffect, useRef } from 'react'
import { Html5Qrcode } from 'html5-qrcode'

export default function QrScanner({ onScan, onError, scannerId }) {
  const html5QrCodeRef = useRef(null)

  useEffect(() => {
    if (!scannerId) return

    let isMounted = true
    const qrCodeInstance = new Html5Qrcode(scannerId)
    html5QrCodeRef.current = qrCodeInstance

    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
      videoConstraints: {
        facingMode: { exact: "environment" }, // Prioriza cámara trasera
      }
    }

    // Iniciar la cámara con soporte de reproducción inline para iOS WebView
    qrCodeInstance
      .start(
        { facingMode: "environment" },
        config,
        (decodedText, decodedResult) => {
          if (isMounted && onScan) {
            onScan(decodedText, decodedResult)
          }
        },
        (errorMessage) => {
          if (isMounted && onError) {
            onError(errorMessage)
          }
        }
      )
      .catch((err) => {
        if (isMounted && onError) {
          onError(err)
        }
      })

    // Limpieza estricta al desmontar el componente
    return () => {
      isMounted = false
      if (html5QrCodeRef.current) {
        if (html5QrCodeRef.current.isScanning) {
          html5QrCodeRef.current
            .stop()
            .then(() => {
              html5QrCodeRef.current.clear()
            })
            .catch((e) => console.warn("Error al detener cámara en cleanup:", e))
        } else {
          try {
            html5QrCodeRef.current.clear()
          } catch (e) {
            // Contenedor ya limpiado
          }
        }
      }
    }
  }, [scannerId])

  return (
    <div
      id={scannerId}
      className="qrscanner-container"
      style={{ width: '100%', maxWidth: '350px', margin: '0 auto', overflow: 'hidden' }}
    />
  )
}