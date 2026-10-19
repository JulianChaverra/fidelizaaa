"use client" 

import "./landing.css"
import { useRouter } from "next/navigation"

export default function LandingFideliza() {
  const router = useRouter()
  
  return (
    <main className="landing-main">
      {/* Hero Principal */} 
      <header className="landing-hero">
        <img src="/logo-fideliza.png" alt="Fideliza" className="landing-logo" />
        
        {/* Badge del Modelo de Negocio */}
        <div className="landing-badge-promo">
          🎉 Gratis para siempre hasta 20 usuarios afiliados
        </div>

        <h1 className="landing-titulo">Fideliza: Más que puntos, clientes que siempre vuelven</h1>
        <p className="landing-subtitulo">
          La plataforma de fidelización 100% digital para tu negocio.<br />
          Sin tarjetas físicas, sin plásticos y activa en solo 2 minutos.
        </p>

        <div className="landing-cta-hero-group">
          <button
            className="landing-btn-principal"
            onClick={() => router.push("/panel/registro")}
          >
            🚀 Registra tu comercio gratis
          </button>
          <span className="landing-hero-subnota">Empieza sin pagar nada · Sin tarjetas de crédito</span>
        </div>
      </header>

      {/* Explicación Transparente del Modelo Gratis -> $9.900 */}
      <section className="landing-precioqr">
        <p className="precio-nota">
          Empieza a fidelizar clientes sin gastar un solo peso. <br />
          Tus primeros 20 clientes afiliados son totalmente gratis, para siempre.
        </p>
        
        <div className="precio-card">
          <span className="precio-tag-oferta">PLAN TRANSPARENTE</span>
          
          <h2 className="precio-mensual">
            $0 COP <span>(Primeros 20 clientes gratis)</span>
          </h2>
          <p className="precio-nota">
            Al superar los 20 clientes afiliados, continúas con interacciones ilimitadas por solo <strong>$9.900 COP / mes</strong>. Sin permanencia.
          </p>

          <table className="tabla-planes">
            <thead>
              <tr>
                <th>Capacidad</th>
                <th>Clientes afiliados</th>
                <th>Precio mensual</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Plan Inicial</strong></td>
                <td>Hasta 20 clientes</td>
                <td><strong style={{ color: '#3b6e52' }}>$0 COP (Gratis)</strong></td>
              </tr>
              <tr>
                <td><strong>Plan Crecimiento</strong></td>
                <td><strong>Ilimitados</strong></td>
                <td><strong>$9.900 COP / mes</strong></td>
              </tr>
            </tbody>
          </table>

          <ul>
            <li>✓ <b>Código QR Digital instantáneo</b> para tu mostrador</li>
            <li>✓ Aplicación PWA para ti y tus clientes (sin descargas de App Store)</li>
            <li>✓ Carga y redención de puntos en tiempo real</li>
            <li>✓ Módulo de analíticas y exportación de base de datos a CSV</li>
            <li>✓ Panel administrativo fácil e intuitivo</li>
            <li>✓ Activación inmediata tras completar el registro</li>
          </ul>

          <div className="qr-demo-imgs">
            <img src="/demo-fideliza2.png" alt="QR Digital de Fideliza" className="qr-demo-img" />
            <img src="/demo-fideliza3.png" alt="App Fideliza en uso" className="qr-demo-img" />
          </div>
        </div>
      </section>

      {/* Problema - Solución */}
      <section className="landing-problema">
        <h2>¿Tus clientes compran una vez y no regresan?</h2>
        <p>
          La mayoría de los comercios pierden hasta el 70% de sus compradores ocasionales por no contar con un programa de retención activo.<br /><br />
          Con <strong>Fideliza</strong> creas tu club de puntos digital en minutos, motivando a tus clientes a regresar sin invertir en costosos equipos ni publicidad.
        </p>
      </section>

      {/* Beneficios Clave */}
      <section className="landing-beneficios">
        <h2>¿Por qué elegir Fideliza?</h2>
        <div className="beneficios-lista">
          <div className="beneficio-card">
            <span className="emoji">🎁</span>
            <p><strong>Gratis Inicial</strong><br />Tus primeros 20 clientes no te cuestan nada</p>
          </div>
          <div className="beneficio-card">
            <span className="emoji">⚡</span>
            <p><strong>Puesta en Marcha</strong><br />Crea tu cuenta y empieza a usarlo en 2 minutos</p>
          </div>
          <div className="beneficio-card">
            <span className="emoji">📱</span>
            <p><strong>100% Digital</strong><br />Tus clientes acumulan puntos usando solo su cámara</p>
          </div>
          <div className="beneficio-card">
            <span className="emoji">📊</span>
            <p><strong>CRM & Estadísticas</strong><br />Identifica clientes VIP e inactivos al instante</p>
          </div>
          <div className="beneficio-card">
            <span className="emoji">💸</span>
            <p><strong>Tarifa Plana $9.900</strong><br />Sin cobros sorpresa al escalar tu negocio</p>
          </div>
        </div>
      </section>

      {/* Paso a Paso */}
      <section className="landing-comofunciona">
        <h2>¿Cómo funciona?</h2>
        <ol>
          <li>1- Registra tu comercio gratis (incluye hasta 20 clientes).</li>
          <li>2- Descarga e imprime tu código QR desde el panel.</li>
          <li>3- Pon tu QR en el mostrador para que tus clientes lo escaneen.</li>
          <li>4- Otorga puntos, redime premios y fideliza a tu comunidad.</li>
        </ol>
      </section>

      {/* Demo visual */}
      <section className="landing-demo">
        <img src="/demo-fideliza.png" alt="Cliente usando Fideliza" className="landing-demo-img" />
        <p className="landing-demo-desc">
          Tus clientes no necesitan instalar aplicaciones pesadas. Solo abren la cámara de su celular, escanean y acumulan.
        </p>
      </section>

      {/* CTA Final */}
      <section className="landing-cta">
        <h2>¿Listo para hacer crecer tu negocio?</h2>
        <button
          className="landing-btn-principal"
          onClick={() => router.push("/panel/registro")}
        >
          🚀 Registra tu comercio gratis
        </button>
        <span className="landing-cta-nota">Puesta en marcha en 2 minutos. ¡Gratis hasta 20 usuarios!</span>
      </section>

      <footer className="landing-footer">
        Fideliza &copy; {new Date().getFullYear()} &middot; Crece, premia y fideliza sin límites.
      </footer>
    </main>
  )
}