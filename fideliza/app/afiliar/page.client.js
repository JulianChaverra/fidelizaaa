// /app/afiliar/page.js
'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { jwtDecode }  from 'jwt-decode'
import './afiliar.css'
import Cookies from 'js-cookie'

function esColorOscuro(hex) {
  if (!hex) return false
  const color = hex.replace('#', '')
  const r = parseInt(color.substr(0, 2), 16)
  const g = parseInt(color.substr(2, 2), 16)
  const b = parseInt(color.substr(4, 2), 16)
  const brillo = (r * 299 + g * 587 + b * 114) / 1000
  return brillo < 128
}

export default function AfiliarPage() {
  const router = useRouter()
  const searchParams = useSearchParams({ suspense: false })  

  const [comercio, setComercio] = useState(null)
  const [form, setForm] = useState({ nombre: '', telefono: '', correo: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [token, setTokenUrl] = useState(null)

  useEffect(() => {
    const raw = searchParams.get('token')
    if (raw) setTokenUrl(raw)
  }, [searchParams])

  useEffect(() => {
    
    if (!token) return

    try {
      console.log("llega1 ",token)
      const decoded = jwtDecode(token) 
      console.log("llega2",decoded)
      if (decoded?.comercioId) {        
        fetch('/api/comercio/detalle', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: token})
        })
          .then((res) => res.json())
          .then((data) => {
            setComercio(data.comercio)
          })
      } else {
        router.push("/")
      }
    } catch {
      router.push("/")
    }
  }, [token])

  useEffect(() => {
    if (!comercio) return;
  
    const usuarioId = Cookies.get('fidelizaUsuarioId');
  
    if (usuarioId) {
      fetch('/api/usuario/comercios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuarioId }),
      })
        .then(res => res.json())
        .then(async (data) => {
          if (data.error) {
            console.log('Error usuario/comercios:', data.error);
            router.push('/');
            return;
          }
          // data.comercios: array de slugs o IDs de comercios a los que está afiliado
          if (data.comercios?.includes(comercio.slug)) {
            router.push('/tarjetas');
          } else {
            // No está afiliado, lo afilias automáticamente
            try {
              const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  usuarioId,
                  comercioToken: token,
                  autoAfiliacion: true,
                })
              });
              const resp = await res.json();
              if (resp.success) {
                router.push('/tarjetas');
              } else {
                console.log('Error auto-afiliando:', resp.error || resp);
                router.push('/');
              }
            } catch (err) {
              console.log('Error fetch autoafiliación:', err);
              router.push('/');
            }
          }
        })
        .catch((err) => {
          console.log('Error fetch comercios:', err);
          router.push('/');
        });
    }
  }, [comercio, router, token]);
  
  

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault()
      window.fidelizaPrompt = e
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, comercioToken: token,autoAfiliacion: false })
      })

      const data = await res.json()

      if (data.success) {
        const decoded = jwtDecode(data.token) 
        if (decoded?.usuarioId) {
          Cookies.set('fidelizaUsuarioId', decoded.usuarioId,{ expires: 3650 })
          Cookies.set('fidelizaNombre', form.nombre,{ expires: 3650 })
        }

        if (window.fidelizaPrompt) {
          window.fidelizaPrompt.prompt()
          window.fidelizaPrompt.userChoice.then(() => {
            window.fidelizaPrompt = null
          })
        }

        router.push('/tarjetas')
      } else {
        setError(data.error || 'Error desconocido')
      }
    } catch (err) {
      console.log(err)
      setError('Error de red')
    } finally {
      setLoading(false)
    }
  }

  const claseTitulo = comercio?.color && esColorOscuro(comercio.color)
    ? 'afiliar-titulo text-white'
    : 'afiliar-titulo text-black'

  if (!comercio && !error) {    
    return (
      <main className="afiliar-main" style={{ backgroundColor: '#ffffff' }}>
        <p className="afiliar-titulo">Validando comercio...</p>
      </main>
    )
  }

  // Solo muestra el formulario si NO hay cookie de usuario
  if (Cookies.get('fidelizaUsuarioId')) {
    // Opcional: loader UX mientras se afilia automáticamente
    return (
      <main className="afiliar-main" style={{ backgroundColor: comercio?.color || '#fff' }}>
        <p className={claseTitulo}>Procesando afiliación...</p>
      </main>
    );
  }


  return (
    
    <main
      className="afiliar-main"
      style={{ backgroundColor: comercio?.color || '#ffffff' }}
    >
      
    {comercio?.logoUrl ? (
      <img src={comercio.logoUrl} alt={comercio.nombre} className="afiliar-logo" />
    ) : (
      <h1 className={`afiliar-logo-text ${claseTitulo}`}>
        {comercio?.nombre || ""}
      </h1>
    )}


      {error && <p className="afiliar-error">{error}</p>}

      <h1 className={claseTitulo}>
        {comercio ? `Bienvenido a ${comercio.nombre}` : 'Afíliate'}
      </h1>

      <form onSubmit={handleSubmit} className="afiliar-form">
        <input
          name="nombre"
          placeholder="Nombre"
          value={form.nombre}
          onChange={handleChange}
          required
          className="afiliar-input"
        />
        <input
          name="telefono"
          placeholder="Teléfono"
          value={form.telefono}
          onChange={handleChange}
          required
          className="afiliar-input"
        />
        <input
          name="correo"
          type="email"
          placeholder="Correo electrónico"
          value={form.correo}
          onChange={handleChange}
          required
          className="afiliar-input"
        />
        
        <p className="afiliar-politica-link">
          Al hacer clic en <b>Afiliarme</b> aceptas nuestras&nbsp;
          <a href="/politicas" target="_blank" rel="noopener noreferrer">
            políticas de datos
          </a> y&nbsp;
          <a href="/terminos" target="_blank" rel="noopener noreferrer">
            términos y condiciones
          </a>.
        </p>

        <button
          type="submit"
          disabled={loading}
          className="afiliar-boton"
        >
          {loading ? 'Registrando...' : 'Afiliarme'}
        </button>
      </form>
    </main>
  )
}
