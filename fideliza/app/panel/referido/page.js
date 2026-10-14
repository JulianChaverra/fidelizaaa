'use client'

import { useEffect, useState } from 'react'
import Cookies from 'js-cookie'
import { useRouter } from 'next/navigation'
import './referidos.css'

export default function ReferidosPage() {
  const [codigo, setCodigo] = useState('')
  const [copiado, setCopiado] = useState(false)
  const [loading, setLoading] = useState(true)
  const [referidos, setReferidos] = useState([])
  const [loadingReferidos, setLoadingReferidos] = useState(true)
  const router = useRouter()

  // Obtener código de referido
  useEffect(() => {
    const token = Cookies.get('fidelizaComercioToken')
    if (!token) {
      window.location.href = '/panel/login'
      return
    }
    fetch('/api/comercio/codigo-referido', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) setCodigo(data.codigo)
      })
      .finally(() => setLoading(false))
  }, [])

  // Obtener lista de referidos
  useEffect(() => {
    const token = Cookies.get('fidelizaComercioToken')
    if (!token) return
    fetch('/api/comercio/mis-referidos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) setReferidos(data.referidos)
      })
      .finally(() => setLoadingReferidos(false))
  }, [])

  const handleVolver = () => router.push('/panel')

  const handleCopy = () => {
    if (!codigo) return
    navigator.clipboard.writeText(codigo)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 1600)
  }

  return (
    <main className="referidos-main">
      <img src="/logo-fideliza.png" alt="Fideliza" className="referidos-logo" />

      <button className="referidos-volver" onClick={handleVolver}>
        ← Volver al panel
      </button>

      <h2 className="referidos-titulo">Referidos y descuentos</h2>

      <div className="referidos-card">
        <p className="referidos-info">
          Comparte tu código con otros comercios.<br />
          <b>Gana 10% de descuento</b> por cada comercio que se registre y pague usando tu código.
        </p>
        {loading ? (
          <div className="referidos-loader">Cargando...</div>
        ) : (
          <>
            <div className="referidos-codigo-wrap">
              <span className="referidos-codigo">{codigo || "No disponible"}</span>
              <button className="referidos-copy" onClick={handleCopy} title="Copiar código">
                {copiado ? "¡Copiado!" : "📋"}
              </button>
            </div>
            <div className="referidos-instructivo">
              Cada vez que un comercio se registre con tu código y pague su suscripción, tu descuento se aplicará automáticamente en tu próxima factura mensual.<br /><br />
              <b>¡Máximo 10 referidos por mes, lleva tu mes gratis!</b>
            </div>
          </>
        )}
      </div>

     <div className="referidos-lista-card">
        <h3>Comercios que has referido</h3>
        {loadingReferidos ? (
          <div className="referidos-loader">Cargando referidos...</div>
        ) : (
          referidos.length === 0 ? (
            <div className="referidos-lista-vacio">
              Aún no has referido comercios.
            </div>
          ) : (
            <table className="referidos-lista-tabla">
              <thead>
                <tr>
                  <th>Comercio</th>
                  <th>Registrado</th>
                </tr>
              </thead>
              <tbody>
                {referidos.map((r, i) => (
                  <tr key={r.slug + i}>
                    <td>{r.nombre}</td>
                    <td>{new Date(r.fechaRegistro).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}
      </div>


      <footer className="referidos-footer">
        Fideliza · Gana puntos, redime experiencias
      </footer>
    </main>
  )
}
