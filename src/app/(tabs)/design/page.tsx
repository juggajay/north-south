'use client'

import { Suspense } from 'react'
import dynamic from 'next/dynamic'

// Dynamic import to avoid SSR issues with Three.js
const ConfiguratorPage = dynamic(
  () => import('@/components/configurator/ConfiguratorPage').then(m => ({ default: m.ConfiguratorPage })),
  { ssr: false, loading: () => <ConfiguratorSkeleton /> }
)

function ConfiguratorSkeleton() {
  return (
    <div className="flex flex-col h-screen animate-pulse">
      <div className="h-12 bg-zinc-200" />
      <div className="h-[60vh] bg-zinc-100" />
      <div className="flex-1 bg-zinc-50" />
    </div>
  )
}

export default function DesignPage() {
  // AI estimate could come from photo processing in Phase 03
  // For now, check if there's a pending estimate in session storage
  const aiEstimate = typeof window !== 'undefined'
    ? JSON.parse(sessionStorage.getItem('aiEstimate') || 'null')
    : null

  return (
    <Suspense fallback={<ConfiguratorSkeleton />}>
      <ConfiguratorPage aiEstimate={aiEstimate} />
    </Suspense>
  )
}
