'use client'

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import "./validando.css"

export default function ValidandoPagoComercio() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const reference = searchParams.get("reference")
  const [estado, setEstado] = useState("validando")
  const [mensaje, setMensaje] = useState("Validando tu pago, por favor espera...")

  useEffect(() => {
    if (!reference) {
      setEstado("error")
      setMensaje("Referencia de pago no encontrada.")
      return
    }

    fetch("/api/pagos/validar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reference }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.estado === "APPROVED") {
          setEstado("aprobado")
          setMensaje("¡Pago exitoso! Tu comercio está activo. Ahora puedes iniciar sesión en tu panel.")
        } else if (data.success && data.estado === "PENDING") {
          setEstado("pendiente")
          setMensaje("Tu pago está pendiente de confirmación. Cuando se apruebe, te notificaremos por correo.")
        } else if (data.success && data.estado === "DECLINED") {
          setEstado("rechazado")
          setMensaje("El pago fue rechazado. Por favor intenta nuevamente o contacta soporte.")
        } else {
          setEstado("error")
          setMensaje(data.error || "No se pudo validar el pago. Intenta más tarde.")
        }
      })
      .catch(() => {
        setEstado("error")
        setMensaje("No se pudo conectar al servidor. Intenta más tarde.")
      })
  }, [reference])

  return (
    <main className="registro-main validando-main">
      <img src="/logo-fideliza.png" alt="Fideliza" className="registro-logo" />
      <h1>Validando pago...</h1>

      <div className="validando-status-box">
        {estado === "validando" && (
          <>
            <div className="loader"></div>
            <p>{mensaje}</p>
          </>
        )}
        {estado === "aprobado" && (
          <>
            <div className="success-check">&#10004;</div>
            <p className="success-msg">{mensaje}</p>
            <button className="registro-login-boton" onClick={() => router.push("/panel/login")}>Iniciar sesión</button>
          </>
        )}
        {estado === "pendiente" && (
          <>
            <div className="loader"></div>
            <p className="pending-msg">{mensaje}</p>
            <button className="registro-login-boton" onClick={() => router.push("/")}>Ir al inicio</button>
          </>
        )}
        {estado === "rechazado" && (
          <>
            <div className="fail-cross">&#10008;</div>
            <p className="fail-msg">{mensaje}</p>
            <button className="registro-login-boton" onClick={() => router.push("/")}>Ir al inicio</button>
          </>
        )}
        {estado === "error" && (
          <>
            <div className="fail-cross">&#9888;</div>
            <p className="fail-msg">{mensaje}</p>
            <button className="registro-login-boton" onClick={() => router.push("/")}>Ir al inicio</button>
          </>
        )}
      </div>

      <footer className="registro-footer">
        Fideliza · Gana puntos, redime experiencias
      </footer>
    </main>
  )
}
