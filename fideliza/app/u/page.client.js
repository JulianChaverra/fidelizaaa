"use client"

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import jwt from 'jsonwebtoken'
import QRUsuario from '../components/QRUsuario'
import OneSignalSetup from '../components/OneSignalSetup'
import './usuario.css'

function esColorOscuro(hex) {
  if (!hex) return false
  const color = hex.replace('#', '')
  const r = parseInt(color.substr(0, 2), 16)
  const g = parseInt(color.substr(2, 2), 16)
  const b = parseInt(color.substr(4, 2), 16)
  const brillo = (r * 299 + g * 587 + b * 114) / 1000
  return brillo < 160
}

export default function UsuarioPage() {
  const router = useRouter()
  const searchParams = useSearchParams({ suspense: false })

  const [datos, setDatos] = useState(null)
  const [tokenQR, setTokenQR] = useState(null)
  const [loading, setLoading] = useState(true)
  const tokenUrl = searchParams.get('token')

  useEffect(() => {    
    if (!tokenUrl) {
      router.push('/u/login')
      return
    }

    try {
      const decoded = jwt.decode(tokenUrl)
      if (!decoded?.usuarioId || !decoded?.comercioId) {
        router.push('/u/login')
        return
      }

      fetch('/api/usuario/detalle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tokenUrl })
      })
        .then(res => res.json())
        .then(data => {
          if (data.error) {
            router.push('/u/login')
          } else {
            setDatos(data)
            setTokenQR(data.tokenQR)
          }
        })
        .catch(() => router.push('/u/login'))
        .finally(() => setLoading(false))
    } catch {
      router.push('/u/login')
    }
  }, [searchParams, router])

  useEffect(() => {
    if (datos?.comercio?.nombre) {
      document.title = `Mi tarjeta - ${datos.comercio.nombre}`
    }
  }, [datos])

  if (loading || !datos) {
    return <main className="usuario-main" style={{ backgroundColor: '#fff' }}>Cargando tu tarjeta...</main>
  }

  const claseTexto = datos?.comercio?.color && esColorOscuro(datos.comercio.color)
    ? 'usuario-contenido text-white'
    : 'usuario-contenido text-black'

  return (
    <main className="usuario-main" style={{ backgroundColor: datos.comercio.color || '#ffffff' }}>
      <OneSignalSetup />
      <button className="resumen-volver" onClick={() => router.push('/tarjetas')}>
        ← Volver a mis tarjetas
      </button>
      <div className="usuario-wrapper">
        {datos.comercio.logoUrl ? (
          <img
            src={datos.comercio.logoUrl}
            alt={datos.comercio.nombre}
            className="usuario-logo"
          />
        ) : (
          <h2 className={`usuario-logo-text ${claseTexto}`}>{datos.comercio.nombre}</h2>
        )}

        <div className="usuario-card">
          <div className="usuario-contenido">
            <h1 className="usuario-nombre">Hola {datos.usuario.nombre}</h1>
            <p className="usuario-puntos">
              Tienes <span className="puntos">{datos.puntos}</span> puntos
            </p>
            <p className="usuario-mensaje">Gracias por ser parte de {datos.comercio.nombre}</p>
          </div>

          {tokenQR && <QRUsuario token={tokenQR} />}
          <button
            className="usuario-ver-premios"
            onClick={() => router.push(`/premios?token=${tokenUrl}`)}
          >
            🎁 Ver catálogo del comercio
          </button>
        </div>
      </div>

      <footer className={`usuario-footer ${claseTexto}`}>
        <p>Fideliza · Gana puntos, redime experiencias</p>
      </footer>
    </main>
  )
}
