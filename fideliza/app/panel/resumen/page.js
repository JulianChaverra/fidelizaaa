'use client'
import { useEffect, useState } from "react"
import Cookies from "js-cookie"
import { useRouter } from "next/navigation"
import "./resumen.css"

export default function ResumenPanel() {
  const router = useRouter()
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [openIndex, setOpenIndex] = useState(null)

  useEffect(() => {
    const token = Cookies.get("fidelizaComercioToken")
    if (!token) {
      router.push("/panel/login")
      return
    }
    fetch("/api/panel/resumen", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token })
    })
      .then(res => res.json())
      .then(data => {
        setClientes(data.resumen || [])
      })
      .finally(() => setLoading(false))
  }, [router])

  const handleToggle = idx => setOpenIndex(idx === openIndex ? null : idx)

  return (
    <main className="resumen-main">
      
      <img src="/logo-fideliza.png" alt="Fideliza" className="resumen-logo" />
      <button className="resumen-volver" onClick={() => router.push('/panel')}>
        ← Volver al panel
      </button>
      <h2 className="resumen-titulo">Resumen de Clientes</h2>

      {loading ? (
        <div className="resumen-loading">Cargando resumen...</div>
      ) : clientes.length === 0 ? (
        <div className="resumen-vacio">No hay usuarios registrados aún.</div>
      ) : (
        <div className="resumen-acordeon-lista">
          {clientes.map((cli, idx) => (
            <div
              className={`resumen-acordeon-item${openIndex === idx ? " abierto" : ""}`}
              key={cli.usuarioId}
            >
              <div
                className="resumen-acordeon-cabecera"
                onClick={() => handleToggle(idx)}
              >
                <div>
                  <strong>{cli.nombre}</strong>
                </div>
                <div className="resumen-puntos">
                  <span className="resumen-puntos-valor">{cli.puntosActuales}</span> puntos
                </div>
                <div className={`resumen-arrow ${openIndex === idx ? 'arriba' : ''}`}>▼</div>
              </div>
              {openIndex === idx && (
                <div className="resumen-acordeon-detalle">
                  <div>
                    <strong>Compras totales:</strong> {cli.comprasTotales}
                  </div>
                  <div>
                    <strong>Veces que redimió:</strong> {cli.vecesRedimio}
                  </div>
                  <div>
                    <strong>Total redimido:</strong> {cli.totalRedimido}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <footer className="footer-fideliza">
        Fideliza · Resumen de clientes
      </footer>
    </main>
  )
}
