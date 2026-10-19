'use client'

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import BotonPagoWompi from "../../components/BotonPagoWompi"
import LogoUploader from "../../components/LogoUploader"
import "./registro.css"

const VALOR_BASE = 9900
const CUPON_DEFAULT = "FIDELIZA20" // Código que otorga los 20 clientes gratis ($0 COP)

export default function RegistroComercio() {
  const router = useRouter()
  
  // 1. Inicializamos el estado del formulario con el código de descuento predefinido
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
    color: "#3b6e52",
    codigoReferido: CUPON_DEFAULT
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [yaRegistrado, setYaRegistrado] = useState(false)
  const [slugDuplicado, setSlugDuplicado] = useState(false)
  const [wompiConfig, setWompiConfig] = useState(null)
  const [codigoReferidoError, setCodigoReferidoError] = useState("")
  
  // 2. Inicializamos el valor a pagar en 0 de forma predeterminada
  const [valorAPagar, setValorAPagar] = useState(0)
  const [registroExitoso, setRegistroExitoso] = useState(false)
  const [qrUrl, setQrUrl] = useState(null)
  const errorRef = useRef(null)

  // Validar código de referido en backend y actualizar monto
  const validarCodigoReferido = async (codigo) => {
    setCodigoReferidoError("")

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
        setValorAPagar(data.valorAPagar ?? 0)
      } else {
        setCodigoReferidoError(data.error || "Código no válido")
        setValorAPagar(VALOR_BASE)
      }
    } catch (err) {
      console.error("Error al validar cupón:", err)
      setCodigoReferidoError("Error validando el código")
      setValorAPagar(VALOR_BASE)
    }
  }

  // 3. EFECTO DE CARGA INICIAL: ejecuta la validación del cupón automáticamente al cargar la vista
  useEffect(() => {
    if (CUPON_DEFAULT) {
      validarCodigoReferido(CUPON_DEFAULT)
    }
  }, [])

  const handleChange = async (e) => {
    const { name, value } = e.target

    setForm((prev) => {
      const updated = { ...prev, [name]: value }

      // Generación automática del slug si el usuario escribe el nombre
      if (name === "nombre" && !form.slug) {
        updated.slug = value
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9-]/g, "-")
          .replace(/-+/g, "-")
      }

      return updated
    })

    if (name === "slug") setSlugDuplicado(false)

    // Si el usuario edita o borra el código de referido manualmente
    if (name === "codigoReferido") {
      const codigoLimpio = value.trim()
      setForm((prev) => ({ ...prev, codigoReferido: codigoLimpio }))

      if (codigoLimpio) {
        await validarCodigoReferido(codigoLimpio)
      } else {
        setCodigoReferidoError("")
        setValorAPagar(VALOR_BASE)
      }
    }
  }

  // Callback para la carga directa de imagen a Vercel Blob Storage
  const handleLogoChange = (url) => {
    setForm((prev) => ({ ...prev, logoUrl: url }))
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
        // Si el monto a pagar es $0 o el backend marca exención (requierePago: false)
        if (data.requierePago === false || valorAPagar === 0) {
          setRegistroExitoso(true)
          setQrUrl(data.qrUrl || null)
          setWompiConfig(null)
        } else {
          // 2. Si el valor a pagar fuera mayor a 0, se genera el pago en Wompi
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
      console.error(err)
      setError("Error de red al procesar el registro")
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
      <h1>Registra tu comercio gratis</h1>

      {error && (
        <>
          <p className="registro-error" ref={errorRef}>{error}</p>
          {yaRegistrado && (
            <button className="registro-login-boton" onClick={() => router.push("/panel/login")}>
              Iniciar sesión
            </button>
          )}
        </>
      )}

      {!yaRegistrado && !wompiConfig && !registroExitoso && (
        <form onSubmit={handleSubmit} className="registro-form">
          <input 
            name="nombre" 
            placeholder="Nombre del comercio" 
            value={form.nombre} 
            onChange={handleChange} 
            required 
          />

          <input
            name="slug"
            placeholder="Nombre corto (ej. hojarasca)"
            value={form.slug}
            onChange={handleChange}
            required
            style={slugDuplicado ? { border: '1px solid red' } : {}}
          />

          <label htmlFor="color">Color distintivo de tu marca</label>
          <div className="registro-color">
            <input name="color" type="color" id="color" value={form.color} onChange={handleChange} />
            <input name="color" type="text" value={form.color} onChange={handleChange} placeholder="#3b6e52" />
            <span className="color-preview" style={{ backgroundColor: form.color }}></span>
          </div>

          <input
            name="codigoReferido"
            placeholder="Código de referido o cupón"
            value={form.codigoReferido}
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
          <input name="correo" type="email" placeholder="Correo del comercio" value={form.correo} onChange={handleChange} required />
          <input name="nombreContacto" placeholder="Nombre del contacto" value={form.nombreContacto} onChange={handleChange} required />
          <input name="correoContacto" type="email" placeholder="Correo del contacto" value={form.correoContacto} onChange={handleChange} required />
          <input name="celularContacto" placeholder="Celular del contacto" value={form.celularContacto} onChange={handleChange} required />
          
          {/* Componente LogoUploader */}
          <LogoUploader 
            value={form.logoUrl} 
            onChange={handleLogoChange} 
            comercioSlug={form.slug || form.nombre}
            label="Logo del comercio (opcional)"
          />

          {/* Indicador de Valor a Pagar con Cupón Preaplicado */}
          <div className="registro-valor-pagar">
            Valor a pagar: <b>{valorAPagar === 0 ? "GRATIS ($0 COP)" : `$${valorAPagar.toLocaleString('es-CO')} COP`}</b>
            {valorAPagar === 0 && (
              <span style={{ display: 'block', fontSize: '0.8rem', color: '#3b6e52', marginTop: '0.2rem', fontWeight: 600 }}>
                ✓ Cupón activado: Incluye hasta 20 clientes afiliados para siempre.
              </span>
            )}
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
            {loading ? "Registrando..." : (valorAPagar === 0 ? "🚀 Registrar mi comercio gratis" : "Registrar mi comercio y realizar pago")}
          </button>
        </form>
      )}

      {/* VISTA DE REGISTRO EXITOSO SIN PAGO */}
      {registroExitoso && !wompiConfig && (
        <section className="registro-exito">
          <h2>¡Registro exitoso! 🎉</h2>
          <p>
            Tu comercio ha sido registrado y activado de inmediato con capacidad gratuita para tus primeros 20 clientes afiliados.<br />
            Ya puedes iniciar sesión en tu panel para comenzar.
          </p>
          {qrUrl && (
            <img src={qrUrl} alt="QR afiliación" className="registro-qr" />
          )}
          <button
            className="registro-login-boton"
            onClick={() => router.push("/panel/login")}
            style={{ marginTop: "1em" }}
          >
            Iniciar sesión en mi panel
          </button>
        </section>
      )}

      {/* FLUJO DE PAGO WOMPI (Si el valor a pagar es > 0) */}
      {wompiConfig && (
        <BotonPagoWompi config={wompiConfig} />
      )}

      <footer className="registro-footer">
        Fideliza · Gana puntos, redime experiencias
      </footer>
    </main>
  )
}