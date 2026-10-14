'use client'

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import BotonPagoWompi from "../../components/BotonPagoWompi"
import "./registro.css"

const VALOR_BASE = 9900

export default function RegistroComercio() {
  const router = useRouter()
  const [form, setForm] = useState({
    nombre: "",
    slug: "",
    tipoDocumento: "NIT",
    numeroDocumento: "",
    celular: "",
    correo: "",
    nombreContacto: "",
    correoContacto: "",
    celularContacto: "",
    logoUrl: "",
    color: "#5f4b32",
    codigoReferido: ""
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [yaRegistrado, setYaRegistrado] = useState(false)
  const [slugDuplicado, setSlugDuplicado] = useState(false)
  const [wompiConfig, setWompiConfig] = useState(null)
  const [codigoReferidoError, setCodigoReferidoError] = useState("")
  const [valorAPagar, setValorAPagar] = useState(VALOR_BASE)
  const [registroExitoso, setRegistroExitoso] = useState(false)
  const [qrUrl, setQrUrl] = useState(null)
  const errorRef = useRef(null)

  // Validar código de referido en backend y actualizar monto
  const validarCodigoReferido = async (codigo) => {
    setCodigoReferidoError("")
    setValorAPagar(VALOR_BASE)

    if (!codigo) {
      setCodigoReferidoError("")
      setValorAPagar(VALOR_BASE)
      return
    }

    try {
      const res = await fetch("/api/comercio/validar-codigo-referido", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codigo })
      })
      const data = await res.json()
      if (data.success) {
        setCodigoReferidoError("")
        setValorAPagar(data.valorAPagar ?? VALOR_BASE)
      } else {
        setCodigoReferidoError(data.error || "Código no válido")
        setValorAPagar(VALOR_BASE)
      }
    } catch (err) {
      setCodigoReferidoError("Error validando el código")
      setValorAPagar(VALOR_BASE)
    }
  }

  const handleChange = async (e) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
    if (name === "slug") setSlugDuplicado(false)

    if (name === "codigoReferido") {
      setForm({ ...form, codigoReferido: value.trim() })
      if (value.trim()) {
        await validarCodigoReferido(value.trim())
      } else {
        setCodigoReferidoError("")
        setValorAPagar(VALOR_BASE)
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (codigoReferidoError) {
      setLoading(false)
      return
    }

    try {
      // 1. Registrar comercio
      const res = await fetch("/api/comercio/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      })
      const data = await res.json()

      if (data.success && data.comercioId) {
        // Si es exento de pago (requierePago: false), mostramos éxito, QR y botón login
        if (data.requierePago === false) {
          setRegistroExitoso(true)
          setQrUrl(data.qrUrl || null)
          setWompiConfig(null)
        } else {
          // 2. Crear pago pendiente y obtener config
          const pagoRes = await fetch("/api/pagos/crear", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ comercioId: data.comercioId, valorAPagar: valorAPagar })
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
          } else {
            setError("Error generando el pago.")
          }
        }
      } else {
        if (data.error === "slug-duplicado") {
          setSlugDuplicado(true)
          setError("Este nombre corto ya está en uso. Prueba con otro (ej. hojarasca-cafe).")
        } else if (data.error?.includes("ya está registrado")) {
          setYaRegistrado(true)
          setError(data.error)
        } else if (data.error?.includes("Código no válido")) {
          setCodigoReferidoError("Código no válido")
        } else {
          setError(data.error || "Error desconocido")
        }
        setTimeout(() => {
          if (errorRef.current) errorRef.current.scrollIntoView({ behavior: 'smooth' })
        }, 100)
      }
    } catch (err) {
      setError("Error de red")
      setTimeout(() => {
        if (errorRef.current) errorRef.current.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="registro-main">
      <img src="/logo-fideliza.png" alt="Fideliza" className="registro-logo" />
      <h1>Registra tu comercio</h1>

      {error && (
        <>
          <p className="registro-error" ref={errorRef}>{error}</p>
          {yaRegistrado && (
            <button className="registro-login-boton" onClick={() => router.push("/panel/login")}>Iniciar sesión</button>
          )}
        </>
      )}

      {!yaRegistrado && !wompiConfig && !registroExitoso && (
        <form onSubmit={handleSubmit} className="registro-form">
          <input name="nombre" placeholder="Nombre del comercio" value={form.nombre} onChange={handleChange} required />
          <input
            name="slug"
            placeholder="Nombre corto (ej. hojarasca)"
            value={form.slug}
            onChange={handleChange}
            required
            style={slugDuplicado ? { border: '1px solid red' } : {}}
          />

          <label htmlFor="color">Color de tu marca</label>
          <div className="registro-color">
            <input name="color" type="color" id="color" value={form.color} onChange={handleChange} />
            <input name="color" type="text" value={form.color} onChange={handleChange} placeholder="#5f4b32" />
            <span className="color-preview" style={{ backgroundColor: form.color }}></span>
          </div>

          <input
            name="codigoReferido"
            placeholder="Código de referido (opcional)"
            value={form.codigoReferido || ""}
            onChange={handleChange}
            className={codigoReferidoError ? "campo-error" : ""}
            autoComplete="off"
          />
          {codigoReferidoError && (
            <p className="registro-error">{codigoReferidoError}</p>
          )}

          <select name="tipoDocumento" value={form.tipoDocumento} onChange={handleChange} required>
            <option value="NIT">NIT</option>
            <option value="CC">CC</option>
            <option value="CE">CE</option>
          </select>

          <input name="numeroDocumento" placeholder="Número de documento" value={form.numeroDocumento} onChange={handleChange} required />
          <input name="celular" placeholder="Celular del comercio" value={form.celular} onChange={handleChange} required />
          <input name="correo" placeholder="Correo del comercio" value={form.correo} onChange={handleChange} required />
          <input name="nombreContacto" placeholder="Nombre del contacto" value={form.nombreContacto} onChange={handleChange} required />
          <input name="correoContacto" placeholder="Correo del contacto" value={form.correoContacto} onChange={handleChange} required />
          <input name="celularContacto" placeholder="Celular del contacto" value={form.celularContacto} onChange={handleChange} required />
          <input name="logoUrl" placeholder="URL del logo (opcional)" value={form.logoUrl} onChange={handleChange} />

          <div className="registro-valor-pagar">
            Valor a pagar: <b>{valorAPagar === 0 ? "GRATIS" : `$${valorAPagar.toLocaleString('es-CO')}`}</b>
          </div>

          <p className="afiliar-politica-link">
            Al hacer clic en <b>Registrar mi comercio</b> aceptas nuestras&nbsp;
            <a href="/politicas" target="_blank" rel="noopener noreferrer">
              políticas de datos
            </a> y&nbsp;
            <a href="/terminos" target="_blank" rel="noopener noreferrer">
              términos y condiciones
            </a>.
          </p>
          <button
            type="submit"
            disabled={loading || !!codigoReferidoError}
          >
            {loading ? "Registrando..." : "Registrar mi comercio y realizar pago"}
          </button>
        </form>
      )}

      {/* REGISTRO EXITOSO SIN PAGO */}
      {registroExitoso && !wompiConfig && (
        <section className="registro-exito">
          <h2>¡Registro exitoso!</h2>
          <p>
            Tu comercio ha sido registrado y activado de inmediato gracias al código de gratuidad.<br />
            Ya puedes iniciar sesión en tu panel para empezar a afiliar clientes y gestionar tu programa de fidelización.
          </p>
          {qrUrl && (
            <img src={qrUrl} alt="QR afiliación" className="registro-qr" />
          )}
          <button
            className="registro-login-boton"
            onClick={() => router.push("/panel/login")}
            style={{ marginTop: "1em" }}
          >
            Iniciar sesión
          </button>
        </section>
      )}

      {/* FLUJO DE PAGO NORMAL */}
      {wompiConfig && (
        <BotonPagoWompi config={wompiConfig} />
      )}

      <footer className="registro-footer">
        Fideliza · Gana puntos, redime experiencias
      </footer>
    </main>
  )
}
