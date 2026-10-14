'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import QrScanner from '../../components/QrScanner'
import './carga.css'
import jwt_encode from "jwt-encode";


export default function CargaPuntos() {
  const router = useRouter()
  const [usuario, setUsuario] = useState(null)
  const [puntos, setPuntos] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [loading, setLoading] = useState(false)
  const [scannerActivo, setScannerActivo] = useState(true)
  const [scannerId, setScannerId] = useState(null)
  const JWT_SECRET = "thisisthesecretkey4737593604"
  const comercioToken = Cookies.get('fidelizaComercioToken')
  const [tokenUser, setTokenUser] = useState('')
  const [puntosActualizados, setPuntosActualizados] = useState(null)

  useEffect(() => {
    setScannerId('qr-reader-' + Math.random().toString(36).substring(2, 10))
  }, [])

  // Validar sesión de comercio
  useEffect(() => {
    if (!comercioToken) {
      router.push('/panel/login')
    }
  }, [router])

  // Cuando se escanea un QR válido
  const handleScan = async (decodedText) => {
    setMensaje('Procesando...')
    let token = decodedText
    try {
      const data = JSON.parse(decodedText)
      token = data.token || decodedText
    } catch {}
    // Consulta info del usuario
    const res = await fetch('/api/usuario/detalle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    })
    const info = await res.json()
    if (info.error) {
      setMensaje('QR inválido o usuario no encontrado')
      setTimeout(() => setMensaje(''), 1500)
    } else {
      setTokenUser(token)
      setUsuario(info)
      setMensaje('')
      setScannerActivo(false)
    }
  }

  const handleError = (err) => {}

  const cargarPuntos = async () => {
    setLoading(true)
    setMensaje('')
    // Empaqueta los datos a enviar
    const payload = {
      puntos: parseInt(puntos),
      timestamp: Date.now()
    }

    const token = jwt_encode(payload, JWT_SECRET);

    try {
      const res = await fetch('/api/panel/cargar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          tokenUser
        })
      })
      const data = await res.json()
      if (data.success) {
        await fetch('/api/push/carga', {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tokenUser,  // JWT con { usuarioId, comercioId }
            puntos
          })
        })
        setMensaje('¡Puntos cargados exitosamente!')
        setPuntosActualizados(data.puntos) // <-- Guarda los puntos totales nuevos        
      } else {
        setMensaje(data.error || 'Error al cargar puntos')
      }
    } catch (err){
      console.log(err)
      setMensaje('Error de red')
    }
    setLoading(false)
  }

  const volverAEscanear = () => {
    setUsuario(null)
    setPuntos('')
    setMensaje('')
    setPuntosActualizados(null)
    setScannerId(generateScannerId())
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
    <main className="carga-main">
      <img src="/logo-fideliza.png" alt="Fideliza" className="logo-fideliza" />
      <h2 className="titulo-carga">Carga de puntos</h2>
      
      {!usuario && scannerActivo && scannerId && (
        <>
          <QrScanner onScan={handleScan} onError={handleError} scannerId={scannerId} />
          <div className="carga-info">
            <div className="botones-carga">
              <button onClick={btnsalir} className="boton-salir">
                Salir
              </button>
            </div>
          </div>
        </>
      )}

      {usuario && (
        <div className="carga-info">
          <p><strong>Nombre:</strong> {usuario.usuario.nombre}</p>
          <p><strong>Comercio:</strong> {usuario.comercio.nombre}</p>
          {puntosActualizados !== null ? (
            // --- ÉXITO: solo muestra mensaje, puntos totales y salir ---
            <>
              <p className="mensaje-exito">{mensaje}</p>
              <p><strong>Puntos actuales:</strong> {puntosActualizados}</p>
              <div className="botones-carga">
                <button onClick={btnsalir} className="boton-salir">
                  Salir
                </button>
              </div>
            </>
          ) : (
            // --- FLUJO NORMAL ---
            <>
              <p><strong>Puntos actuales:</strong> {usuario.puntos}</p>
              <input
                type="number"
                placeholder="Cantidad de puntos a cargar"
                value={puntos}
                onChange={e => setPuntos(e.target.value)}
                className="input-puntos"
              />
              <div className="botones-carga">
                <button onClick={cargarPuntos} disabled={loading || !puntos} className="boton-cargar">
                  {loading ? 'Cargando...' : 'Confirmar carga'}
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

      <p className="mensaje-carga">{mensaje && puntosActualizados === null ? mensaje : ''}</p>
      <footer className="footer-fideliza">
        Fideliza · Gana puntos, redime experiencias
      </footer>
    </main>
  )
}
