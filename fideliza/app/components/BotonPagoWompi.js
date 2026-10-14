'use client'

import { useEffect } from "react"

export default function BotonPagoWompi({ config }) {
  useEffect(() => {
    if (!config) return

    // Extrae solo el string signature plano (nuevo flujo)
    const {
      amountInCents,
      currency,
      reference,
      publicKey,
      redirectUrl,
      signature
    } = config

    // Debug en consola
    console.log("🚦 Wompi config recibido en BotonPagoWompi:", {
      amountInCents,
      currency,
      reference,
      publicKey,
      redirectUrl,
      signature
    })

    // Valida que ningún campo esté indefinido o vacío
    if (
      !amountInCents ||
      !currency ||
      !reference ||
      !publicKey ||
      !redirectUrl ||
      !signature
    ) {
      console.error("❌ Falta un parámetro para el pago:", {
        amountInCents, currency, reference, publicKey, redirectUrl, signature
      })
      return
    }

    // Construye la URL de checkout de Wompi
    const checkoutUrl =
      `https://checkout.wompi.co/p/?public-key=${publicKey}` +
      `&currency=${currency}` +
      `&amount-in-cents=${amountInCents}` +
      `&reference=${reference}` +
      `&redirect-url=${encodeURIComponent(redirectUrl)}` +
      `&signature:integrity=${signature}`

    // Redirige apenas monta el componente
    console.log(checkoutUrl)
    window.location.href = checkoutUrl
  }, [config])

  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
      <p>Redirigiendo a la pasarela de pago de Wompi...</p>
      <div className="loader"></div>
      <style jsx>{`
        .loader {
          margin: 1rem auto;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #4e6d58;
          border-radius: 50%;
          width: 36px;
          height: 36px;
          animation: spin 0.9s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg);}
          100% { transform: rotate(360deg);}
        }
      `}</style>
    </div>
  )
}
