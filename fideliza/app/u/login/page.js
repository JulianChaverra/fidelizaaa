// /app/u/login/page.js
"use client"

import { useState } from 'react'
import './login.css'
import Cookies from 'js-cookie'
import { useRouter } from 'next/navigation'

export default function UsuarioLogin() {
  const router = useRouter()
  const [correo, setCorreo] = useState('')
  const [codigo, setCodigo] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!enviado) {
      // Enviar código
      const res = await fetch('/api/usuario/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo })
      })
      const data = await res.json()
      if (data.success) {
        setEnviado(true)
      } else {
        setError(data.error || 'Error enviando código')
      }
    } else {
      // Validar código
      const res = await fetch('/api/usuario/validar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, codigo })
      })
      const data = await res.json()
      if (data.success) {
        Cookies.set('fidelizaUsuarioId', data.usuarioId,{ expires: 3650 })
        Cookies.set('fidelizaNombre', data.nombre,{ expires: 3650 })
        router.push('/tarjetas')
      } else {
        setError(data.error || 'Código incorrecto')
      }
    }

    setLoading(false)
  }

  return (
    <main className="usuario-login">
      <img src="/logo-fideliza.png" alt="Fideliza" className="logo-login" />
      <h1 className="titulo-login">Accede a tus tarjetas</h1>
      <form onSubmit={handleSubmit} className="login-form">
        {!enviado ? (
          <input
            type="email"
            name="correo"
            placeholder="Correo electrónico"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
            className="login-input"
          />
        ) : (
            <>
            <h1 className="titulo-login">Hemos enviado el código de ingreso a tu correo</h1>
            <input
                type="text"
                name="codigo"
                placeholder="Código de acceso"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                required
                className="login-input"
            />
          </>
        )}
        <button type="submit" className="login-boton" disabled={loading}>
          {loading ? 'Procesando...' : enviado ? 'Ingresar' : 'Enviar código'}
        </button>
      </form>
      {error && <p className="login-error">{error}</p>}
      <footer className="footer-fideliza">
        Fideliza · Gana puntos, redime experiencias
      </footer>
    </main>
  )
}
