'use client'

import dynamic from 'next/dynamic'

const PremioPage = dynamic(() => import('./page.client'), { ssr: false })

export default function Wrapper() {
  return <PremioPage />
}