'use client'
import { useEffect } from 'react'

export default function ServiceWorkerUsuario() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw-usuario.js', { scope: '/u/' })
        .then(() => console.log('🟦 SW de usuario registrado'))
        .catch((err) => console.error('Error SW usuario', err));
    }
  }, []);

  return null;
}
