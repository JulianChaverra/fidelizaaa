'use client'
import './terminos.css'

export default function TerminosPage() {
  return (
    <main className="terminos-main">
      {/* Logo Fideliza */}
      <div className="terminos-logo-wrap">
        <a href="/">
          <img src="/logo-fideliza.png" alt="Logo Fideliza" className="terminos-logo" />
        </a>
      </div>

      <h1 className="terminos-titulo">Términos y Condiciones de Uso</h1>
      <p className="terminos-actualizado">Actualizado el 3 de junio de 2025</p>

      <section className="terminos-section">
        <h2>1. Aceptación de los Términos</h2>
        <p>
          El acceso y uso de la plataforma <strong>Fidelizaaa.com</strong> implica la aceptación plena y sin reservas de los presentes Términos y Condiciones, así como de la Política de Tratamiento de Datos Personales. Si no estás de acuerdo, por favor abstente de usar la plataforma.
        </p>
      </section>
      <section className="terminos-section">
        <h2>2. Definiciones</h2>
        <ul>
          <li><strong>Usuario:</strong> Persona que se afilia a un comercio mediante la plataforma para acumular y redimir puntos.</li>
          <li><strong>Comercio:</strong> Negocio afiliado a Fideliza que ofrece un programa de fidelización a través de la plataforma.</li>
          <li><strong>Fideliza:</strong> Plataforma digital fidelizaaa.com administrada por Code & Capital SAS.</li>
        </ul>
      </section>
      <section className="terminos-section">
        <h2>3. Registro y Acceso</h2>
        <ul>
          <li>Para acceder a los beneficios, los usuarios deben registrarse proporcionando datos verídicos.</li>
          <li>El usuario es responsable de la veracidad y actualización de los datos proporcionados.</li>
          <li>Code & Capital SAS  podrá rechazar registros o cancelar cuentas ante conductas fraudulentas o uso indebido.</li>
        </ul>
      </section>
      <section className="terminos-section">
        <h2>4. Responsabilidad de Code & Capital SAS</h2>
        <ul>
          <li>Code & Capital SAS es responsable por el funcionamiento de la plataforma, la protección de datos personales y la comunicación de cambios.</li>
          <li>Code & Capital SAS no se hace responsable por los productos, servicios, premios o condiciones ofrecidas directamente por los comercios afiliados.</li>
        </ul>
      </section>
      <section className="terminos-section">
        <h2>5. Responsabilidad de los Comercios</h2>
        <ul>
          <li>Los comercios son responsables de la entrega de los premios, beneficios y el cumplimiento de las condiciones de sus campañas de fidelización.</li>
          <li>El comercio se compromete a tratar los datos personales de los usuarios de acuerdo con la normativa colombiana vigente y la política de Fideliza.</li>
        </ul>
      </section>
      <section className="terminos-section">
        <h2>6. Acumulación y Redención de Puntos</h2>
        <ul>
          <li>La acumulación y redención de puntos está sujeta a las condiciones establecidas por cada comercio afiliado.</li>
          <li>Code & Capital SAS no es responsable por la negativa de un comercio a entregar un premio o por cambios en sus programas internos.</li>
        </ul>
      </section>
      <section className="terminos-section">
        <h2>7. Propiedad Intelectual</h2>
        <p>
          Todos los derechos sobre el software, el diseño, la marca y el contenido de Fideliza pertenecen a Code & Capital SAS . No está permitido copiar, modificar o distribuir ningún contenido sin autorización expresa.
        </p>
      </section>
      <section className="terminos-section">
        <h2>8. Modificaciones</h2>
        <p>
        Code & Capital SAS se reserva el derecho de modificar estos Términos y Condiciones en cualquier momento. Las modificaciones serán publicadas en esta página y entrarán en vigor a partir de su publicación.
        </p>
      </section>
      <section className="terminos-section">
        <h2>9. Legislación y Jurisdicción</h2>
        <p>
          Estos Términos y Condiciones se rigen por la legislación colombiana. Cualquier controversia será resuelta por los jueces y tribunales de la ciudad de Medellín, Colombia.
        </p>
      </section>
      <section className="terminos-section">
        <h2>10. Contacto</h2>
        <p>
          Para consultas sobre estos Términos y Condiciones, puedes escribir a <a href="mailto:codecapitalsas@gmail.com">codecapitalsas@gmail.com</a>.
        </p>
      </section>
        {/* SECCIÓN COMERCIOS */}
        <section className="terminos-section">
        <h2>11. Condiciones Específicas para Comercios Afiliados</h2>
        <ul>
          <li>
            El comercio acepta que el uso de la plataforma Fideliza está sujeto a la suscripción de un plan mensual, cuyo valor varía según el número de <b>usuarios activos afiliados</b> al comercio.
          </li>
          <li>
            <b>Definición de usuario activo:</b> Se considera usuario activo a todo usuario afiliado que haya sumado puntos al menos una vez en los últimos 6 meses calendario. Los usuarios inactivos por más de 6 meses no serán contabilizados para el cálculo de la tarifa.
          </li>
          <li>
            <b>Rangos y precios:</b> Fideliza define y publica los rangos de precios según la cantidad de usuarios activos. El comercio podrá consultar los valores actualizados en el panel o en la web oficial. El monto mensual será informado y facturado anticipadamente cada periodo.
          </li>
          <li>
            El comercio se compromete a mantener actualizada la información de premios, condiciones y promociones ofrecidas a los usuarios afiliados.
          </li>
          <li>
            El comercio no podrá usar la plataforma para el envío de spam, promociones engañosas, ni realizar prácticas prohibidas por la legislación colombiana.
          </li>
          <li>
            El comercio es responsable por la entrega de los premios y el cumplimiento de las condiciones ofrecidas en su programa de fidelización.
          </li>
          <li>
          Code & Capital SAS podrá suspender o cancelar el acceso a la plataforma fidelizaaa.com ante el incumplimiento de estos términos, el no pago de la suscripción, o la detección de actividades fraudulentas.
          </li>
          <li>
          Code & Capital SAS se reserva el derecho de modificar los precios y condiciones comerciales, notificando con al menos 15 días de antelación al comercio a través de los medios registrados.
          </li>
        </ul>
      </section>

      <section className="terminos-section">
    <h2>12. Propiedad y Acceso a la Base de Datos</h2>
        <ul>
            <li>
            Toda la información y datos recolectados a través de la plataforma Fideliza, incluyendo datos de usuarios, transacciones, puntos, premios y actividad de comercios, son de propiedad de <strong>Code & Capital SAS</strong>.
            </li>
            <li>
            Sin perjuicio de lo anterior, cada comercio afiliado tiene derecho a <strong>acceder, consultar y exportar</strong> la información de sus propios usuarios, transacciones y reportes de actividad desde el panel de administración proporcionado por la plataforma fidelizaaa.com, siempre que su suscripción esté activa y al día.
            </li>
            <li>
            Code & Capital SAS garantiza la confidencialidad y seguridad de la base de datos, así como el cumplimiento de las obligaciones legales respecto al tratamiento y protección de datos personales en Colombia.
            </li>
            <li>
            El acceso o uso no autorizado de la base de datos por parte de los comercios, así como la reproducción, comercialización o cesión total o parcial a terceros de dicha información, está prohibido salvo autorización expresa y por escrito de Code & Capital SAS.
            </li>
            <li>
            Ante la terminación de la suscripción o relación comercial, el comercio podrá solicitar la exportación de sus datos históricos relevantes, conforme a la ley y los procedimientos internos de Code & Capital SAS.
            </li>
        </ul>
        </section>

        <section className="terminos-section">
            <h2>13. Disponibilidad, Seguridad y Responsabilidad sobre la Información</h2>
            <ul>
                <li>
                Code & Capital SAS realiza copias de seguridad periódicas de la información almacenada en la plataforma para reducir el riesgo de pérdida de datos, sin que esto constituya una garantía absoluta contra pérdidas accidentales o fallos de terceros.
                </li>
                <li>
                En caso de solicitud de exportación de datos por parte del comercio, Code & Capital SAS procesará la solicitud en un plazo máximo de 15 días hábiles, entregando la información relevante a través de medios digitales seguros.
                </li>
                <li>
                Code & Capital SAS no será responsable por pérdida de datos causada por fuerza mayor, ataques informáticos externos o causas fuera de su control razonable. El comercio es responsable de descargar periódicamente sus propios reportes si así lo requiere.
                </li>
                <li>
                Code & Capital SAS no garantiza la disponibilidad ininterrumpida de la plataforma, pero se compromete a informar y resolver incidencias técnicas en el menor tiempo posible.
                </li>
            </ul>
        </section>

        <section className="terminos-section">
            <h2>14. Uso de Cookies</h2>
            <p>
             Code & Capital SAS emplea cookies en la plataforma fidelizaaa.com estrictamente necesarias para el funcionamiento seguro y eficiente de la plataforma. Estas cookies son de carácter técnico y funcional, y no son utilizadas para fines publicitarios ni para rastreo fuera del entorno de Fideliza. El uso de la plataforma implica la aceptación del uso de dichas cookies esenciales.
            </p>
        </section>

      <footer className="terminos-footer">
        Fideliza &copy; 2025 &middot; Todos los derechos reservados.
      </footer>
    </main>
  )
}
