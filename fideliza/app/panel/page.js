"use client"

import { useEffect, useState } from "react"
import Cookies from "js-cookie"
import { useRouter } from "next/navigation"
import { jwtDecode } from "jwt-decode"
import "./panel.css"
import InstalarPWA from '../components/InstalarPWA'
import BotonPagoWompi from '../components/BotonPagoWompi'

function esColorOscuro(hex) {
  if (!hex) return false
  const color = hex.replace("#", "")
  const r = parseInt(color.substr(0, 2), 16)
  const g = parseInt(color.substr(2, 2), 16)
  const b = parseInt(color.substr(4, 2), 16)
  const brillo = (r * 299 + g * 587 + b * 114) / 1000
  return brillo < 128
}

export default function PanelInicio() {
  const router = useRouter()
  const [comercio, setComercio] = useState(null)
  const [statusCobro, setStatusCobro] = useState(null)
  const [loading, setLoading] = useState(true)
  const [wompiConfig, setWompiConfig] = useState(null)
  const [loadingPago, setLoadingPago] = useState(false)

  function getComercioIdFromToken() {
    try {
      const token = Cookies.get("fidelizaComercioToken")
      if (!token) return null
      const payload = jwtDecode(token)
      return payload.comercioId || null
    } catch {
      return null
    }
  }

  useEffect(() => {
    const token = Cookies.get("fidelizaComercioToken")
    if (!token) {
      router.push("/panel/login")
      return
    }
    fetch("/api/comercio/status-cobro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token })
    })
      .then(res => res.json())
      .then(data => {
        if (data?.success) setStatusCobro(data)
        else router.push("/panel/login")
      })
      .catch(() => router.push("/panel/login"))
      .finally(() => setLoading(false))
  }, [router])

  useEffect(() => {
    const token = Cookies.get("fidelizaComercioToken")
    if (!token) return
    fetch("/api/comercio/detalle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token })
    })
      .then(res => res.json())
      .then(data => {
        if (data?.comercio) setComercio(data.comercio)
      })
  }, [])

  const iniciarPago = async () => {
    setLoadingPago(true)
    setWompiConfig(null)
    try {
      const comercioId = getComercioIdFromToken()
      const pagoRes = await fetch("/api/pagos/crear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comercioId })
      })
      const pagoData = await pagoRes.json()
      if (pagoData.reference && pagoData.signature && pagoData.amountInCents !== undefined) {
        setWompiConfig({
          currency: pagoData.currency,
          amountInCents: pagoData.amountInCents,
          reference: pagoData.reference,
          publicKey: process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY,
          redirectUrl: `https://fidelizaaa.com/comercio/validando?reference=${pagoData.reference}`,
          signature: pagoData.signature
        })
      }
    } finally {
      setLoadingPago(false)
    }
  }

  if (loading) {
    return <main className="panel-main">Cargando panel...</main>
  }

  const colorFondo = comercio?.color || "#ffffff"
  const claseTexto = esColorOscuro(colorFondo) ? "text-white" : "text-black"

  // --- BANNER LOGIC ---
  const { vencido, mostrarAlertaRenovacion, mostrarBannerGratis, planActual, esExentoDeCobro, usuariosActuales, maxUsuariosGratis } = statusCobro || {}
  const mostrarBanner = vencido || mostrarAlertaRenovacion || mostrarBannerGratis

  // Si es fideliza gratis pero NO ha llegado a los 100 usuarios, NO mostrar botón de pago aunque haya banner gratis
  const mostrarBotonPago =
    (vencido || mostrarAlertaRenovacion) ||
    (mostrarBannerGratis && usuariosActuales >= maxUsuariosGratis);

  // --- MESSAGES ---
  let bannerClass = "panel-banner"
  let bannerText = ""
  if (vencido) {
    bannerClass += " bloqueado"
    bannerText = esExentoDeCobro
      ? "¡Has alcanzado 100 usuarios! Para continuar usando Fideliza, activa tu suscripción."
      : "Tu suscripción ha vencido. Si deseas seguir utilizando Fideliza, por favor activa tu suscripción."
  } else if (mostrarBannerGratis) {
    bannerClass += " gratis"
    bannerText = (
      <>
      
        <span>Tu comercio está en <b>plan gratuito</b> hasta llegar a 100 usuarios.</span>
        <br />
        <span>
          Usuarios: <b>{usuariosActuales}/{maxUsuariosGratis}</b>
        </span>
        {usuariosActuales >= maxUsuariosGratis && (
          <>
            <br /><b>¡Ya puedes activar tu suscripción y acceder a más beneficios!</b>
          </>
        )}
      </>
    )
  } else if (mostrarAlertaRenovacion) {
    bannerClass += " alerta"
    bannerText = (
      <>
        <span>Tu suscripción está próxima a vencer (<b>{statusCobro.diasRestantes}</b> días restantes).</span>
        <br />
        <span>Renueva ahora para seguir usando Fideliza sin interrupciones.</span>
      </>
    )
  }

  // --- PANEL RENDER ---
  return (
    <main className="panel-main">
      <InstalarPWA />
      <div className="panel-encabezado">
        <img src="/logo-fideliza.png" alt="Fideliza" className="panel-logo" />
      </div>
      <div className={`panel-destacado ${claseTexto}`} style={{ backgroundColor: colorFondo }}>
        <h1 className="panel-titulo">
          Bienvenido al panel administrativo de:
        </h1>
        {comercio?.logoUrl ? (
          <img
            src={comercio.logoUrl}
            alt={comercio.nombre}
            className="panel-logo-comercio grande"
          />
        ) : (
          <h2 className="panel-nombre-comercio">{comercio?.nombre}</h2>
        )}
      </div>

      {/* BANNER & BOTÓN PAGO */}
      {mostrarBanner && (
        <div className={bannerClass} style={{ marginBottom: "1.3rem", fontSize: "0.92em" }}>
          {bannerText}
          {/* Solo mostrar botón SI corresponde según la lógica */}
          {mostrarBotonPago && (
            <div style={{ marginTop: "1.15em" }}>
              {planActual && (
                <div className="panel-info-plan">
                  <div className="panel-plan-titulo">Plan actual:</div>
                  <div className="panel-plan-nombre">{planActual.nombreTarifa}</div>
                  <div className="panel-plan-detalle">
                    Usuarios permitidos: <b>{planActual.minUsuariosTarifa} - {planActual.maxUsuariosTarifa}</b><br />
                    Valor mensual: <b>${planActual.monto.toLocaleString('es-CO')}</b>
                  </div>
                  <div className="panel-plan-usuarios">
                    Tu comercio tiene <b>{planActual.usuariosActuales}</b> usuarios afiliados
                  </div>
                </div>
              )}
              {wompiConfig ? (
                <BotonPagoWompi config={wompiConfig} />
              ) : (
                <button className="panel-pagar-btn" onClick={iniciarPago} disabled={loadingPago}>
                  {loadingPago ? "Generando pago..." : (vencido ? "Activar suscripción" : "Renovar suscripción")}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* BOTONES de ACCIONES SOLO si NO está vencido */}
      {!vencido && (
        <div className="panel-botones">
          <button className="panel-boton" onClick={() => router.push('/panel/referido')}>Comercios referidos</button>
          <button className="panel-boton" onClick={() => router.push('/panel/qrcomercio')}>Descargar QR del comercio</button>
          <button className="panel-boton" onClick={() => router.push('/panel/premios')}>Configuración de premios</button>
          <button className="panel-boton" onClick={() => router.push('/panel/resumen')}>Resumen de clientes</button>
          <button className="panel-boton" onClick={() => router.push('/panel/carga')}>Cargar puntos</button>
          <button className="panel-boton" onClick={() => router.push('/panel/redimir')}>Redimir puntos</button>
        </div>
      )}

      <footer className="panel-footer">
        Fideliza · Gana puntos, redime experiencias
      </footer>
    </main>
  )
}
