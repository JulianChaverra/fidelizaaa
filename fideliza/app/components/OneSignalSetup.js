'use client'

import { useEffect } from 'react'
import Cookies from 'js-cookie'

export default function OneSignalSetup() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Evita doble carga del script
    if (window.OneSignalScriptAdded) return
    window.OneSignalScriptAdded = true

    const script = document.createElement('script')
    script.src = 'https://cdn.onesignal.com/sdks/OneSignalSDK.js'
    script.async = true
    document.head.appendChild(script)

    script.onload = () => {
      window.OneSignal = window.OneSignal || []
      window.OneSignal.push(function () {
        OneSignal.init({
          appId: 'dfb07328-5c73-4b18-ad8c-5745eafc2122',
          notifyButton: { enable: false },
        })

        // Mostrar el prompt
        OneSignal.showSlidedownPrompt()

        // Si ya está suscrito, guardar el playerId igual
        OneSignal.isPushNotificationsEnabled(async function(isEnabled) {
          if (isEnabled) {
            const playerId = await OneSignal.getUserId()
            console.log('🎯 playerId (ya suscrito):', playerId)
            const usuarioId = Cookies.get('fidelizaUsuarioId')
            if (playerId && usuarioId) {
              await fetch('/api/usuario/push', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usuarioId, playerId }),
              })
            }
          }
        })

        // Guardar el playerId al suscribirse
        OneSignal.on('subscriptionChange', async (isSubscribed) => {
          console.log('✅ Cambio de suscripción:', isSubscribed)
          if (isSubscribed) {
            const playerId = await OneSignal.getUserId()
            console.log('🎯 playerId:', playerId)
            const usuarioId = Cookies.get('fidelizaUsuarioId')
            if (playerId && usuarioId) {
              await fetch('/api/usuario/push', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usuarioId, playerId }),
              })
            }
          }
        })
      })
    }
  }, [])

  return null
}
