'use client'
import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import jwt from 'jsonwebtoken'
import './premios-publicos.css'

export default function PremiosPublicos() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [premios, setPremios] = useState([])
  const [loading, setLoading] = useState(true)
  const [comercioNombre, setComercioNombre] = useState('')
  const [tokenUrl, setTokenUrl] = useState('')

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) {
      router.push('/u/login')
      return
    }
    setTokenUrl(token)
    let comercioId = ''
    try {
      const decoded = jwt.decode(token)
      comercioId = decoded?.comercioId
      setComercioNombre(decoded?.comercioNombre || '') // solo si lo tienes en el token
    } catch {
      router.push('/u/login')
      return
    }
    if (!comercioId) {
      router.push('/u/login')
      return
    }
    fetch('/api/panel/premios/listar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ comercioId })
    })
      .then(res => res.json())
      .then(data => {
        setPremios(data.premios || [])
        if (!comercioNombre && data.premios?.[0]?.comercio?.nombre) {
          setComercioNombre(data.premios[0].comercio.nombre)
        }
      })
      .finally(() => setLoading(false))
  }, [searchParams, router])

  return (
    <main className="premios-publicos-main">
      {/* Logo Fideliza arriba */}
      <img
        src="/logo-fideliza.png"
        alt="Fideliza"
        className="premios-publicos-logo"
        style={{
          display: "block",
          margin: "2.3rem auto 1rem auto",
          maxWidth: 170,
          width: "60%",
          height: "auto"
        }}
      />

      <button className="premios-publicos-volver" onClick={() => router.push(`/u?token=${tokenUrl}`)}>
        ← Volver a mi tarjeta
      </button>
      <h2 className="premios-publicos-titulo">
        Catálogo de premios para redimir {comercioNombre ? `de ${comercioNombre}` : ''}
      </h2>
      {loading ? (
        <div className="premios-publicos-loading">Cargando premios...</div>
      ) : premios.length === 0 ? (
        <div className="premios-publicos-vacio">Este comercio aún no ha configurado premios.</div>
      ) : (
        <section className="premios-publicos-lista">
          {premios.map(premio => (
            <div className="premios-publicos-card" key={premio.id}>
              {premio.imagenUrl && premio.imagenUrl.trim() !== "" && (
                <img src={premio.imagenUrl} alt={premio.nombre} className="premios-publicos-img" />
              )}
              <div className="premios-publicos-info">
                <h4 className="premios-publicos-nombre">{premio.nombre}</h4>
                <div className="premios-publicos-puntos">{premio.valorpuntos ?? premio.valorPuntos} puntos</div>
              </div>
            </div>
          ))}
        </section>
      )}
      <footer className="premios-publicos-footer">
        Fideliza · Consulta tus premios y gana experiencias
      </footer>
    </main>
  )
}
