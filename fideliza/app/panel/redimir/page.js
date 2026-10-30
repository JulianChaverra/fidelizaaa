'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import QrScanner from '../../components/QrScanner'
import './redimir.css'
import jwt_encode from "jwt-encode"

export default function RedimirPuntos() {
  const router = useRouter()
  const [usuario, setUsuario] = useState(null)
  const [puntos, setPuntos] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [loading, setLoading] = useState(false)
  const [scannerActivo, setScannerActivo] = useState(true)
  const [scannerId, setScannerId] = useState('')
  const [permisoCamaraDenegado, setPermisoCamaraDenegado] = useState(false)

  const JWT_SECRET = "thisisthesecretkey4737593604"
  const comercioToken = Cookies.get('fidelizaComercioToken')
  const [tokenUser, setTokenUser] = useState('')
  const [puntosActualizados, setPuntosActualizados] = useState(null)

  useEffect(() => {
    setScannerId('qr-reader-comercio-container')
  }, [])

  useEffect(() => {
    if (!comercioToken) {
      router.push('/panel/login')
    }
  }, [comercioToken, router])

  const handleError = (err) => {
    console.warn('Error en escáner QR / WebView:', err)
    if (typeof err === 'string' && (err.includes('Permission') || err.includes('NotAllowedError'))) {
      setPermisoCamaraDenegado(true)
      setMensaje('Debes permitir el acceso a la cámara en tu dispositivo para escanear.')
    }
  }

  const handleScan = async (decodedText) => {
    setMensaje('Procesando...')
    let token = decodedText
    try {
      const data = JSON.parse(decodedText)
      token = data.token || decodedText
    } catch {}

    try {
      const res = await fetch('/api/usuario/detalle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      })
      const info = await res.json()
      if (info.error) {
        setMensaje('QR inválido o usuario no encontrado')
        setTimeout(() => setMensaje(''), 1800)
      } else {
        setTokenUser(token)
        setUsuario(info)
        setMensaje('')
        setScannerActivo(false)
      }
    } catch (err) {
      console.error(err)
      setMensaje('Error al consultar usuario')
    }
  }

  const procesarRedencion = async () => {
    setMensaje('')
    const cantidadARedimir = parseInt(puntos)

    // Validación rápida en el frontend antes de golpear el backend
    if (cantidadARedimir > usuario.puntos) {
      setMensaje('El usuario no tiene suficientes puntos para esta redención.')
      return
    }

    setLoading(true)

    const payload = {
      puntos: cantidadARedimir,
      timestamp: Date.now()
    }

    const token = jwt_encode(payload, JWT_SECRET)

    try {
      // Consumo del endpoint correcto para redimir
      const res = await fetch('/api/panel/redimir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          tokenUser
        })
      })
      
      const data = await res.json()
      
      if (data.success) {
        // Si tienes un endpoint de push para redenciones, puedes llamarlo aquí
        // await fetch('/api/push/redencion', { ... })
        setMensaje('¡Puntos redimidos exitosamente!')
        setPuntosActualizados(data.puntos)
      } else {
        setMensaje(data.error || 'Error al redimir puntos')
      }
    } catch (err) {
      console.error(err)
      setMensaje('Error de red')
    }
    setLoading(false)
  }

  const volverAEscanear = () => {
    setUsuario(null)
    setPuntos('')
    setMensaje('')
    setPuntosActualizados(null)
    setPermisoCamaraDenegado(false)
    setScannerActivo(true)
  }

  const btnsalir = () => {
    setUsuario(null)
    setScannerActivo(false)
    setMensaje('')
    setPuntosActualizados(null)
    router.push('/panel')
  }

  return (
    <main className="redimir-main">
      <img src="/logo-fideliza.png" alt="Fideliza" className="logo-fideliza" />
      <h2 className="titulo-redimir">Redimir Puntos</h2>

      {!usuario && scannerActivo && scannerId && (
        <>
          <div className="contenedor-qr-wrapper">
            <QrScanner
              onScan={handleScan}
              onError={handleError}
              scannerId={scannerId}
            />
          </div>

          {permisoCamaraDenegado && (
            <p className="mensaje-error-permiso" style={{ color: '#cb2227', fontSize: '0.85rem', margin: '10px 0' }}>
              ⚠️ Permiso de cámara requerido. Si estás usando la aplicación, otorga los permisos en la configuración de tu celular.
            </p>
          )}

          <div className="redimir-info">
            <div className="botones-redimir">
              <button onClick={btnsalir} className="boton-salir">
                Salir
              </button>
            </div>
          </div>
        </>
      )}

      {usuario && (
        <div className="redimir-info">
          <p><strong>Nombre:</strong> {usuario.usuario.nombre}</p>
          <p><strong>Comercio:</strong> {usuario.comercio.nombre}</p>
          {puntosActualizados !== null ? (
            <>
              <p className="mensaje-exito">{mensaje}</p>
              <p><strong>Puntos restantes:</strong> {puntosActualizados}</p>
              <div className="botones-redimir">
                <button onClick={btnsalir} className="boton-salir">
                  Salir
                </button>
              </div>
            </>
          ) : (
            <>
              <p><strong>Puntos disponibles:</strong> {usuario.puntos}</p>
              <input
                type="number"
                placeholder="Cantidad de puntos a redimir"
                value={puntos}
                onChange={e => setPuntos(e.target.value)}
                className="input-puntos"
              />
              <div className="botones-redimir">
                <button onClick={procesarRedencion} disabled={loading || !puntos} className="boton-redimir">
                  {loading ? 'Procesando...' : 'Confirmar redención'}
                </button>
                <button onClick={volverAEscanear} className="boton-volver">
                  Volver a escanear
                </button>
                <button onClick={btnsalir} className="boton-salir">
                  Salir
                </button>
              </div>
            </>
          )}
        </div>
      )}

      <p className="mensaje-redimir">{mensaje && puntosActualizados === null ? mensaje : ''}</p>
      <footer className="footer-fideliza">
        Fideliza · Gana puntos, redime experiencias
      </footer>
    </main>
  )
}