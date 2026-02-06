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
      {/* TopBar placeholder */}
      <div className="h-14 bg-white border-b flex items-center justify-between px-4">
        <div className="w-10 h-10 bg-zinc-200 rounded-lg" />
        <div className="w-24 h-6 bg-zinc-200 rounded" />
        <div className="w-10 h-10 bg-zinc-200 rounded-lg" />
      </div>
      {/* Content area */}
      <div className="flex-1 bg-zinc-50 p-6 space-y-6">
        <div className="h-8 bg-zinc-200 rounded w-48" />
        <div className="h-12 bg-zinc-200 rounded" />
        <div className="h-12 bg-zinc-200 rounded" />
        <div className="h-12 bg-zinc-200 rounded" />
      </div>
      {/* BottomBar placeholder */}
      <div className="h-20 bg-white border-t flex items-center justify-between px-4">
        <div className="space-y-1">
          <div className="h-3 bg-zinc-200 rounded w-12" />
          <div className="h-6 bg-zinc-200 rounded w-20" />
        </div>
        <div className="h-11 bg-zinc-200 rounded w-20" />
      </div>
    </div>
  )
}

export default function DesignPage() {
  // AI estimate could come from photo processing in Phase 03
  const aiEstimate = typeof window !== 'undefined'
    ? JSON.parse(sessionStorage.getItem('aiEstimate') || 'null')
    : null

  return (
    <Suspense fallback={<ConfiguratorSkeleton />}>
      <ConfiguratorPage aiEstimate={aiEstimate} />
    </Suspense>
  )
}
