'use client'
import { useEffect, useState } from 'react'
import Cookies from 'js-cookie'
import { jwtDecode } from 'jwt-decode'  // OJO aquí el cambio
import jwt_encode from 'jwt-encode'
import { QRCodeCanvas } from 'qrcode.react'
import './qrcomercio.css'
import { useRouter } from 'next/navigation'

export default function QRComercioPage() {
  const [comercioId, setComercioId] = useState(null)
  const [loading, setLoading] = useState(true)
  const JWT_SECRET = "thisisthesecretkey4737593604"
  const router = useRouter()

  useEffect(() => {
    const token = Cookies.get('fidelizaComercioToken')
    if (!token) {
      window.location.href = '/panel/login'
      return
    }
    try {
      const decoded = jwtDecode(token) // <- Aquí con D mayúscula
      if (!decoded?.comercioId) throw new Error('Token inválido')
      setComercioId(decoded.comercioId)
    } catch {
      window.location.href = '/panel/login'
      return
    }
    setLoading(false)
  }, [])

  if (loading || !comercioId) return <div style={{ textAlign: "center", marginTop: "3rem" }}>Cargando QR...</div>

  // Genera el token JWT SOLO con el id del comercio
  const payload = { comercioId }
  const qrToken = jwt_encode(payload, JWT_SECRET)
  const qrUrl = `https://fidelizaaa.com/afiliar?token=${qrToken}`

  const downloadQR = () => {
    const canvas = document.getElementById('comercio-qr-canvas')
    const pngUrl = canvas
      .toDataURL('image/png')
      .replace('image/png', 'image/octet-stream')
    let downloadLink = document.createElement('a')
    downloadLink.href = pngUrl
    downloadLink.download = 'QR_Comercio_Fideliza.png'
    document.body.appendChild(downloadLink)
    downloadLink.click()
    document.body.removeChild(downloadLink)
  }

  return (
    <main className="qrcomercio-main">
      <img src="/logo-fideliza.png" alt="Fideliza" className="qrcomercio-logo" />

      <button className="qrcomercio-volver" onClick={() => router.push('/panel')}>
        ← Volver al panel
      </button>

      <h2 className="qrcomercio-titulo">QR para afiliar clientes</h2>

      <div className="qrcomercio-card">
        <p className="qrcomercio-info">
          Muestra a tu cliente, imprime este código y ponlo visible en tu local para que tus clientes se afilien fácilmente a tu programa de fidelización.
        </p>
        <QRCodeCanvas
          id="comercio-qr-canvas"
          value={qrUrl}
          size={320}
          includeMargin={true}
          bgColor="#fff"
        />
        <p className="qrcomercio-url">{qrUrl}</p>
        <button onClick={downloadQR} className="qrcomercio-boton">
          Descargar QR
        </button>
      </div>

      <footer className="qrcomercio-footer">
        Fideliza · Gana puntos, redime experiencias
      </footer>
    </main>
  )
}
