'use client'

import dynamic from 'next/dynamic'

const AfiliarPage = dynamic(() => import('./page.client'), { ssr: false })

export default function Wrapper() {
  return <AfiliarPage />
}