"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import jwt from 'jsonwebtoken'
import './footer.css'
import InstalarPWA from '../components/InstalarPWA'
import Cookies from 'js-cookie'

export const metadata = {
  title: "Mis Tarjetas - Fidelizaaa",
  manifest: "../../public/manifest-tarjetas.json",
}

export default function TarjetasPage() {
  const router = useRouter()
  const [usuarioId, setUsuarioId] = useState(null)
  const [tarjetas, setTarjetas] = useState([])
  const [loading, setLoading] = useState(true)
  const [nombre, setNombre] = useState(null)

  function esColorOscuro(hex) {
    if (!hex) return false
    const color = hex.replace('#', '')
    const r = parseInt(color.substr(0, 2), 16)
    const g = parseInt(color.substr(2, 2), 16)
    const b = parseInt(color.substr(4, 2), 16)
    const brillo = (r * 299 + g * 587 + b * 114) / 1000
    return brillo < 160
  }

  useEffect(() => {
    const id = Cookies.get('fidelizaUsuarioId')    
    const nombre = Cookies.get('fidelizaNombre')

    if (!id || !nombre) {
      router.push('/u/login')
      return
    }

    setUsuarioId(id)
    setNombre(nombre)

    fetch('/api/usuario/tarjetas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuarioId: id })
    })
      .then(res => res.json())
      .then(data => {
        if (data?.tarjetas) setTarjetas(data.tarjetas)
      })
      .finally(() => setLoading(false))
  }, [])

  const irATarjeta = async (comercioId) => {
    const token = await generarToken(usuarioId, comercioId)
    router.push(`/u?token=${token}`)
  }

  const generarToken = async (usuarioId, comercioId) => {
    const res = await fetch('/api/usuario/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuarioId, comercioId })
    })
  
    const data = await res.json()
    return data.token
  }

  if (loading) {
    return <main className="p-6 text-center">Cargando tus tarjetas...</main>
  }

  if (tarjetas.length === 0) {
    return <main className="p-6 text-center">No tienes tarjetas aún.</main>
  }

  return (
    <main className="pagina-tarjetas">
      <img
        src="/logo-fideliza.png"
        alt="Fideliza"
        className="logo-fideliza"
      />
      <InstalarPWA 
        titulo="Mis Tarjetas Fidelizaaa"
        descripcion="Accede al instante a todas tus tarjetas de puntos y beneficios guardados en tu pantalla principal."
        icono="💳"
      />
      <p className="saludo-fideliza">
        👋 Hola {nombre}, aquí están tus comercios afiliados.
      </p>
      <div className="grid-tarjetas">
        {tarjetas.map((t, i) => {
          const textoClase = esColorOscuro(t.color) ? 'text-white' : 'text-black'

          return (
            <button
              key={i}
              onClick={() => irATarjeta(t.comercioId)}
              style={{ backgroundColor: t.color || '#f5f5f5' }}
              className="tarjeta-boton"
            >
              {t.logoUrl ? (
                <img src={t.logoUrl} alt={t.nombre} className="tarjeta-logo" />
              ) : (
                <p className={`tarjeta-nombre ${textoClase}`}>{t.slug}</p>
              )}
              <p className={`tarjeta-nombre ${textoClase}`}>{t.nombre}</p>
              <p className={`tarjeta-puntos ${textoClase}`}>{t.puntos} puntos</p>
            </button>
          )
        })}
      </div>

      <footer className="footer-fideliza">
        Fideliza · Gana puntos, redime experiencias
      </footer>
    </main>
  )
}
