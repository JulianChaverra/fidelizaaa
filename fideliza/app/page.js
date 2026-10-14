"use client" 

import "./landing.css"
import { useRouter } from "next/navigation"

export default function LandingFideliza() {
  const router = useRouter()
  
  return (
    <main className="landing-main">
      {/* Hero */} 
      <header className="landing-hero">
        <img src="/logo-fideliza.png" alt="Fideliza" className="landing-logo" />
        <h1 className="landing-titulo">Fideliza: Más que puntos, clientes recurrentes</h1>
        <p className="landing-subtitulo">
          La plataforma de fidelización 100% digital para tu negocio.<br />
          Sin tarjetas físicas, sin plásticos y activa en solo 2 minutos.
        </p>
        <button
          className="landing-btn-principal"
          onClick={() => router.push("/panel/registro")}
        >
          Registra tu comercio ahora
        </button>
      </header>

      {/* Precio Único e Instantáneo (Zero-Touch) */}
      <section className="landing-precioqr">
        <p className="precio-nota">
          Olvídate de pagar comisiones adicionales por cada cliente o cambiar de plan cuando tu negocio crezca.<br />
          Tarifa única y transparente para todo tipo de comercio.
        </p>
        
        <div className="precio-card">
          <h2 className="precio-mensual">
            Plan Único Fidelizaaa: $9.000 <span>COP / mes</span>
          </h2>
          <p className="precio-nota">
            Sin contratos de permanencia, cancela cuando quieras. Todo incluido desde el primer día.
          </p>

          <table className="tabla-planes">
            <thead>
              <tr>
                <th>Plan</th>
                <th>Clientes afiliados</th>
                <th>Precio mensual</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Fidelizaaa</strong></td>
                <td><strong>Ilimitados</strong></td>
                <td><strong>$9.000 COP</strong></td>
              </tr>
            </tbody>
          </table>

          <ul>
            <li>✓ Generador de Código QR Digital instantáneo</li>
            <li>✓ Aplicación movil para clientes(App Store / Play Store)</li>
            <li>✓ Carga y redención de puntos ilimitada</li>
            <li>✓ Notificaciones y campañas para reactivar clientes</li>
            <li>✓ Panel de control y analíticas de tu comercio</li>
            <li>✓ Cero espera: Listo para usar inmediatamente tras registrarte</li>
          </ul>

          <div className="qr-demo-imgs">
            <img src="/demo-fideliza2.png" alt="QR Digital de Fideliza" className="qr-demo-img" />
            <img src="/demo-fideliza3.png" alt="App Fideliza en uso" className="qr-demo-img" />
          </div>
        </div>
      </section>

      {/* Problema - Solución */}
      <section className="landing-problema">
        <h2>¿Tus clientes compran y no vuelven?</h2>
        <p>
          La mayoría de los comercios pierden hasta el 70% de sus compradores ocasionales por no tener un programa de retención activo.<br /><br />
          <strong>Fideliza</strong> te permite crear tu propio club de puntos digital en minutos, motivando a tus clientes a regresar una y otra vez sin invertir en costosa publicidad o equipos.
        </p>
      </section>

      {/* Beneficios */}
      <section className="landing-beneficios">
        <h2>¿Por qué elegir Fideliza?</h2>
        <div className="beneficios-lista">
          <div className="beneficio-card">
            <span className="emoji">⚡</span>
            <p>Onboarding Instantáneo<br />Paga y empieza hoy</p>
          </div>
          <div className="beneficio-card">
            <span className="emoji">📱</span>
            <p>100% Digital en la nube<br />Tus clientes no instalan apps</p>
          </div>
          <div className="beneficio-card">
            <span className="emoji">🎁</span>
            <p>Reglas de puntos<br />y premios a tu medida</p>
          </div>
          <div className="beneficio-card">
            <span className="emoji">📊</span>
            <p>Panel de estadísticas<br />y métricas en vivo</p>
          </div>
          <div className="beneficio-card">
            <span className="emoji">💸</span>
            <p>Tarifa plana $9.000<br />Sin cobros ocultos</p>
          </div>
        </div>
      </section>

      {/* Cómo funciona (Zero-Touch) */}
      <section className="landing-comofunciona">
        <h2>¿Cómo funciona?</h2>
        <ol>
          <li>1- Registra tu comercio y activa tu plan por solo $9.000 COP al mes.</li>
          <li>2- Genera y descarga tu código QR oficial directamente desde tu panel.</li>
          <li>3- Pon tu QR en el mostrador (impreso o en pantalla) para que tus clientes lo escaneen desde su celular.</li>
          <li>4- Otorga puntos por compras, redime premios y fideliza a tus clientes al instante.</li>
        </ol>
      </section>

      {/* Demo visual */}
      <section className="landing-demo">
        <img src="/demo-fideliza.png" alt="Cliente usando Fideliza" className="landing-demo-img" />
        <p className="landing-demo-desc">
          Tus clientes solo necesitan la cámara de su celular. Así de rápido y fácil es sumar lealtad a tu negocio.
        </p>
      </section>

      {/* CTA Final */}
      <section className="landing-cta">
        <button
          className="landing-btn-principal"
          onClick={() => router.push("/panel/registro")}
        >
          Registra tu comercio por $9.000/mes
        </button>
        <span className="landing-cta-nota">Puesta en marcha en 2 minutos. ¡Potencia tu negocio hoy mismo!</span>
      </section>

      <footer className="landing-footer">
        Fideliza &copy; {new Date().getFullYear()} &middot; Crece, premia y fideliza sin límites.
      </footer>
    </main>
  )
}