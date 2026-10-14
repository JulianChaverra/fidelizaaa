'use client'

import dynamic from 'next/dynamic'

const UsuarioPage = dynamic(() => import('./page.client'), { ssr: false })

export default function Wrapper() {
  return <UsuarioPage />
}