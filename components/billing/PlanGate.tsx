'use client'

import { usePlan } from '@/hooks/usePlan'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface PlanGateProps {
  feature: 'ai' | 'analytics' | 'team'
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function PlanGate({ feature, children, fallback }: PlanGateProps) {
  const { features, loading, planLabel } = usePlan()

  if (loading) return null

  const allowed =
    feature === 'ai' ? features.canUseAI :
    feature === 'analytics' ? features.hasAnalytics :
    features.hasTeamMembers

  if (allowed) return <>{children}</>

  if (fallback) return <>{fallback}</>

  return (
    <div className="rounded-lg border-2 border-dashed border-blue-200 bg-blue-50 p-6 text-center">
      <div className="text-2xl mb-2">✨</div>
      <p className="font-semibold text-gray-900 mb-1">Pro feature</p>
      <p className="text-sm text-gray-500 mb-4">
        This feature requires a Pro or Team plan. You&apos;re on {planLabel}.
      </p>
      <Link href="/pricing">
        <Button size="sm">Upgrade to Pro</Button>
      </Link>
    </div>
  )
}
