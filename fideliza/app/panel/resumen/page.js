'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import './resumen.css'

export default function ResumenClientes() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [kpis, setKpis] = useState({ totalClientes: 0, totalPuntosEmitidos: 0, totalRedenciones: 0 })
  const [clientes, setClientes] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [filtroSegmento, setFiltroSegmento] = useState('Todos')
  const [clienteExpandido, setClienteExpandido] = useState(null)

  const comercioToken = Cookies.get('fidelizaComercioToken')

  useEffect(() => {
    if (!comercioToken) {
      router.push('/panel/login')
      return
    }

    fetch('/api/comercio/resumen', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: comercioToken }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setKpis(data.kpis)
          setClientes(data.clientes)
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }, [comercioToken, router])

  // Filtrado dinámico
  const clientesFiltrados = clientes.filter((c) => {
    const coincideTexto =
      c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.correo.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.telefono.includes(busqueda)

    const coincideFiltro =
      filtroSegmento === 'Todos' || c.segmento === filtroSegmento

    return coincideTexto && coincideFiltro
  })

  // Función para exportar la BD a archivo CSV
  const exportarCSV = () => {
    if (clientes.length === 0) return

    const encabezados = ['ID,Nombre,Correo,Telefono,Puntos,Total_Compras,Total_Redenciones,Segmento,Ultima_Visita\n']
    const filas = clientes.map((c) => {
      const fecha = c.ultimaVisita ? new Date(c.ultimaVisita).toLocaleDateString('es-CO') : 'N/A'
      return `"${c.id}","${c.nombre}","${c.correo}","${c.telefono}",${c.puntos},${c.totalCompras},${c.totalRedenciones},"${c.segmento}","${fecha}"\n`
    })

    const blob = new Blob([encabezados.concat(filas).join('')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `base_clientes_fideliza_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <main className="resumen-main">
      {/* 1. Header Unificado */}
      <div className="resumen-encabezado">
        <img src="/logo-fideliza.png" alt="Fideliza" className="resumen-logo-fideliza" />
      </div>

      {/* 2. Botón Volver al Panel */}
      <div className="resumen-nav-back">
        <button
          type="button"
          onClick={() => router.push('/panel')}
          className="resumen-boton-volver"
        >
          ← Volver al panel
        </button>
      </div>

      <h1 className="resumen-titulo-seccion">Resumen & Analítica de Clientes</h1>

      {loading ? (
        <div className="resumen-cargando">Cargando métricas y clientes...</div>
      ) : (
        <>
          {/* 3. Tarjetas de KPIs */}
          <section className="resumen-kpi-grid">
            <div className="resumen-kpi-card">
              <span className="resumen-kpi-icono">👥</span>
              <div>
                <p className="resumen-kpi-num">{kpis.totalClientes}</p>
                <p className="resumen-kpi-label">Clientes Afiliados</p>
              </div>
            </div>

            <div className="resumen-kpi-card">
              <span className="resumen-kpi-icono">🪙</span>
              <div>
                <p className="resumen-kpi-num">{kpis.totalPuntosEmitidos}</p>
                <p className="resumen-kpi-label">Puntos Acumulados</p>
              </div>
            </div>

            <div className="resumen-kpi-card">
              <span className="resumen-kpi-icono">🎁</span>
              <div>
                <p className="resumen-kpi-num">{kpis.totalRedenciones}</p>
                <p className="resumen-kpi-label">Premios Redimidos</p>
              </div>
            </div>
          </section>

          {/* 4. Barra de Acciones, Búsqueda y Exportación */}
          <div className="resumen-acciones-box">
            <input
              type="text"
              placeholder="🔍 Buscar por nombre, correo o celular..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="resumen-input-busqueda"
            />

            <div className="resumen-controles-secundarios">
              <select
                value={filtroSegmento}
                onChange={(e) => setFiltroSegmento(e.target.value)}
                className="resumen-select-filtro"
              >
                <option value="Todos">Todos los segmentos</option>
                <option value="VIP">⭐ Clientes VIP</option>
                <option value="Frecuente">🔄 Frecuentes</option>
                <option value="Nuevo">🌱 Nuevos</option>
                <option value="En Riesgo">⚠️ En Riesgo</option>
              </select>

              <button onClick={exportarCSV} className="resumen-btn-exportar">
                📥 Descargar BD (.CSV)
              </button>
            </div>
          </div>

          {/* 5. Lista Enriquecida de Clientes */}
          <div className="resumen-lista-contenedor">
            {clientesFiltrados.length === 0 ? (
              <p className="resumen-sin-resultados">No se encontraron clientes para la búsqueda.</p>
            ) : (
              clientesFiltrados.map((c) => {
                const estaExpandido = clienteExpandido === c.id

                return (
                  <div key={c.id} className="resumen-card-cliente">
                    <div
                      className="resumen-cliente-header"
                      onClick={() => setClienteExpandido(estaExpandido ? null : c.id)}
                    >
                      <div className="resumen-cliente-info-principal">
                        <span className="resumen-cliente-nombre">{c.nombre}</span>
                        <span className={`resumen-badge-segmento badge-${c.segmento.toLowerCase().replace(' ', '-')}`}>
                          {c.segmento}
                        </span>
                      </div>

                      <div className="resumen-cliente-puntos-box">
                        <span className="resumen-puntos-valor">{c.puntos}</span>
                        <span className="resumen-puntos-texto">puntos</span>
                        <span className="resumen-flecha">{estaExpandido ? '▲' : '▼'}</span>
                      </div>
                    </div>

                    {/* Contenido Expandible */}
                    {estaExpandido && (
                      <div className="resumen-cliente-detalle">
                        <div className="resumen-detalle-grid">
                          <div>
                            <p className="resumen-detalle-label">📧 Correo:</p>
                            <p className="resumen-detalle-val">{c.correo}</p>
                          </div>
                          <div>
                            <p className="resumen-detalle-label">📱 WhatsApp:</p>
                            <a
                              href={`https://wa.me/57${c.telefono.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="resumen-link-whatsapp"
                            >
                              {c.telefono} 💬
                            </a>
                          </div>
                          <div>
                            <p className="resumen-detalle-label">🛒 Visitas/Compras:</p>
                            <p className="resumen-detalle-val">{c.totalCompras}</p>
                          </div>
                          <div>
                            <p className="resumen-detalle-label">🎁 Premios Redimidos:</p>
                            <p className="resumen-detalle-val">{c.totalRedenciones}</p>
                          </div>
                        </div>

                        <p className="resumen-ultima-visita">
                          📅 Última actividad: {c.ultimaVisita ? new Date(c.ultimaVisita).toLocaleDateString('es-CO') : 'Sin registro'} ({c.diasSinVisita} días)
                        </p>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </>
      )}

      {/* 6. Footer Unificado */}
      <footer className="resumen-footer">
        Fideliza · Resumen de clientes
      </footer>
    </main>
  )
}