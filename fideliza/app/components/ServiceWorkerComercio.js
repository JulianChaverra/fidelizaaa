'use client'
import { useEffect } from 'react'

export default function ServiceWorkerComercio() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw-comercio.js', { scope: '/panel/' })
        .then(() => console.log('🟧 SW de comercio registrado'))
        .catch((err) => console.error('Error SW comercio', err));
    }
  }, []);

  return null;
}