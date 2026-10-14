"use client"

import { useState } from "react"
import Cookies from "js-cookie"
import "./login.css"

export default function PanelLogin() {
  const [correo, setCorreo] = useState("")
  const [codigo, setCodigo] = useState("")
  const [paso, setPaso] = useState(1)
  const [mensaje, setMensaje] = useState("")
  const [loading, setLoading] = useState(false)

  const solicitarCodigo = async () => {
    setLoading(true)
    setMensaje("")
    try {
      const res = await fetch("/api/comercio/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo })
      })
      const data = await res.json()
      if (data.success) {
        setPaso(2)
        setMensaje("Te enviamos un código de acceso a tu correo")
      } else {
        setMensaje(data.error || "Correo no encontrado")
      }
    } catch (err) {
      setMensaje("Error de red")
    } finally {
      setLoading(false)
    }
  }

  const verificarCodigo = async () => {
    setLoading(true)
    setMensaje("")
    try {
      const res = await fetch("/api/comercio/verificar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, codigo })
      })
      const data = await res.json()
      if (data.success) {
        Cookies.set("fidelizaComercioToken", data.token,{ expires: 3650 })
        window.location.href = "/panel"
      } else {
        setMensaje(data.error || "Código incorrecto")
      }
    } catch (err) {
      setMensaje("Error de red")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="login-main">
      <img src="/logo-fideliza.png" alt="Fideliza" className="login-logo" />
      <h1>Ingreso de Comercio</h1>
      {mensaje && <p className="login-msg">{mensaje}</p>}

      {paso === 1 && (
        <div className="login-form">
          <input
            type="email"
            placeholder="Correo del comercio"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
          />
          <button onClick={solicitarCodigo} disabled={loading || !correo}>
            {loading ? "Enviando..." : "Solicitar código"}
          </button>
        </div>
      )}

      {paso === 2 && (
        <div className="login-form">
          <input
            type="text"
            placeholder="Código recibido"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
          />
          <button onClick={verificarCodigo} disabled={loading || !codigo}>
            {loading ? "Verificando..." : "Ingresar al panel"}
          </button>
        </div>
      )}

      <footer className="login-footer">
        Fideliza · Gana puntos, redime experiencias
      </footer>
    </main>
  )
}
