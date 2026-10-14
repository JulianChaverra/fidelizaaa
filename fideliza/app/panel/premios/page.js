'use client'
import { useEffect, useState } from "react"
import Cookies from "js-cookie"
import './premios.css'
import { useRouter } from "next/navigation"

export default function PremiosPanel() {
    const router = useRouter()
    const [premios, setPremios] = useState([])
    const [editando, setEditando] = useState(null)
    const [nuevo, setNuevo] = useState({ nombre: '', imagenUrl: '', valorpuntos: '' })
    const [mensaje, setMensaje] = useState('')
    const comercioToken = Cookies.get('fidelizaComercioToken')
    const [comercioId, setComercioId] = useState('')

  // Obtener el comercioId del token (ajusta según tu lógica)
  useEffect(() => {
    if (!comercioToken) return
    try {
      const data = JSON.parse(atob(comercioToken.split('.')[1]))
      setComercioId(data.comercioId)
    } catch { }
  }, [comercioToken])

  useEffect(() => {
    if (comercioId) cargarPremios()
  }, [comercioId])

  const cargarPremios = async () => {
    const res = await fetch('/api/panel/premios/listar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ comercioId })
    })
    const data = await res.json()
    setPremios(
      (data.premios || []).map(p => ({
        ...p,
        valorpuntos: p.valorpuntos ?? p.valorPuntos ?? ''
      }))
    )
  }

  const guardarPremio = async () => {
    if (!nuevo.nombre || !nuevo.valorpuntos) {
      setMensaje('Todos los campos son obligatorios')
      return
    }
    const res = await fetch('/api/panel/premios/crear', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        comercioId,
        nombre: nuevo.nombre,
        imagenUrl: nuevo.imagenUrl,
        valorPuntos: parseInt(nuevo.valorpuntos)
      })
    })
    if (res.ok) {
      setNuevo({ nombre: '', imagenUrl: '', valorpuntos: '' })
      setMensaje('Premio creado')
      cargarPremios()
    } else {
      setMensaje('Error al crear premio')
    }
  }

  const actualizarPremio = async (id) => {
    const premio = premios.find(p => p.id === id)
    if (!premio.nombre || !premio.valorpuntos) {
      setMensaje('Todos los campos son obligatorios')
      return
    }
    const res = await fetch('/api/panel/premios/editar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id,
        nombre: premio.nombre,
        imagenUrl: premio.imagenUrl,
        valorPuntos: parseInt(premio.valorpuntos),
        activo: premio.activo
      })
    })
    if (res.ok) {
      setEditando(null)
      setMensaje('Premio actualizado')
      cargarPremios()
    } else {
      setMensaje('Error al actualizar premio')
    }
  }

  const eliminarPremio = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este premio?')) return
    const res = await fetch('/api/panel/premios/eliminar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    })
    if (res.ok) {
      setMensaje('Premio eliminado')
      cargarPremios()
    } else {
      setMensaje('Error al eliminar premio')
    }
  }

  const handleEdit = (id, field, value) => {
    setPremios(prev =>
      prev.map(p =>
        p.id === id
          ? { ...p, [field]: value }
          : p
      )
    )
  }

  return (
    <main className="premios-main">
        
      <img src="/logo-fideliza.png" alt="Fideliza" className="logo-fideliza" />
      <button className="premios-volver" onClick={() => router.push('/panel')}>
        ← Volver al panel
      </button>
      <h2 className="premios-titulo">Configuración de premios</h2>      
      <section className="premios-lista">
        {premios.length === 0 && <div className="premios-vacio">Aún no tienes premios configurados.</div>}
        <div className="premios-cards-center">
          {premios.map(premio => (
            <div className="premio-card" key={premio.id}>
              {premio.imagenUrl && premio.imagenUrl.trim() !== "" && (
                <img
                  src={premio.imagenUrl}
                  alt={premio.nombre}
                  className="premio-img"
                  style={{ marginBottom: "1rem" }}
                />
              )}
              {editando === premio.id ? (
                <>
                  <input
                    value={premio.nombre ?? ''}
                    onChange={e => handleEdit(premio.id, "nombre", e.target.value)}
                    className="premio-input"
                  />
                  <input
                    value={premio.imagenUrl ?? ''}
                    onChange={e => handleEdit(premio.id, "imagenUrl", e.target.value)}
                    className="premio-input"
                    placeholder="URL imagen"
                  />
                  <input
                    value={premio.valorpuntos ?? ''}
                    type="number"
                    min="1"
                    onChange={e => handleEdit(premio.id, "valorpuntos", e.target.value)}
                    className="premio-input"
                    placeholder="Valor puntos"
                  />
                  <div className="premio-actions">
                    <button onClick={() => actualizarPremio(premio.id)} className="premio-btn guardar">Guardar</button>
                    <button onClick={() => setEditando(null)} className="premio-btn cancelar">Cancelar</button>
                    <button onClick={() => eliminarPremio(premio.id)} className="premio-btn eliminar">Eliminar</button>
                  </div>
                </>
              ) : (
                <>
                  <h3 >{premio.nombre}</h3>
                  <div className="premio-puntos">{premio.valorpuntos} puntos</div>
                  <div className="premio-actions">
                    <button onClick={() => setEditando(premio.id)} className="premio-btn editar">Editar</button>
                    <button onClick={() => eliminarPremio(premio.id)} className="premio-btn eliminar">Eliminar</button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="premios-nuevo">
        <h3>Agregar nuevo premio</h3>
        <input
          value={nuevo.nombre ?? ''}
          onChange={e => setNuevo(n => ({ ...n, nombre: e.target.value }))}
          placeholder="Nombre"
          className="premio-input"
        />
        <input
          value={nuevo.imagenUrl ?? ''}
          onChange={e => setNuevo(n => ({ ...n, imagenUrl: e.target.value }))}
          placeholder="URL imagen"
          className="premio-input"
        />
        <input
          value={nuevo.valorpuntos ?? ''}
          type="number"
          min="1"
          onChange={e => setNuevo(n => ({ ...n, valorpuntos: e.target.value }))}
          placeholder="Valor puntos"
          className="premio-input"
        />
        <button onClick={guardarPremio} className="premio-btn crear">Agregar un nuevo premio</button>
      </section>
      <div className="premios-mensaje">{mensaje}</div>
      <footer className="footer-fideliza">Fideliza · Gana puntos, redime experiencias</footer>
    </main>
  )
}
