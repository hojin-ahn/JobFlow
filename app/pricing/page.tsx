'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { usePlan } from '@/hooks/usePlan'

const PLANS = [
  {
    id: 'FREE' as const,
    name: 'Free',
    price: '$0',
    period: '/month',
    description: 'Get started for free',
    features: [
      'Up to 3 job postings',
      'Real-time candidate preview',
      'Basic posting editor',
      'Public preview URLs',
    ],
    cta: 'Get started',
    ctaHref: '/auth/signin',
    highlight: false,
  },
  {
    id: 'PRO' as const,
    name: 'Pro',
    price: '$9',
    period: '/month',
    description: 'For serious recruiters',
    features: [
      'Unlimited job postings',
      'AI draft generation (streaming)',
      'AI optimization scoring',
      'Clickable score suggestions',
      'All preview modes',
      'Priority support',
    ],
    cta: 'Upgrade to Pro',
    ctaHref: null,
    highlight: true,
  },
  {
    id: 'TEAM' as const,
    name: 'Team',
    price: '$29',
    period: '/month',
    description: 'For growing teams',
    features: [
      'Everything in Pro',
      'Up to 5 team members',
      'Analytics export',
      'Custom branding',
      'Priority support',
    ],
    cta: 'Upgrade to Team',
    ctaHref: null,
    highlight: false,
  },
]

export default function PricingPage() {
  const { plan: currentPlan, loading } = usePlan()
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)

  const handleUpgrade = async (planId: 'PRO' | 'TEAM') => {
    setLoadingPlan(planId)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch (err) {
      console.error('Checkout error:', err)
    } finally {
      setLoadingPlan(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">J</span>
            </div>
            <span className="font-bold text-gray-900">JobFlow</span>
          </Link>
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">Dashboard</Button>
          </Link>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Simple, transparent pricing</h1>
          <p className="text-lg text-gray-500">
            Start free. Upgrade when you need AI superpowers.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {PLANS.map((p) => {
            const isCurrent = currentPlan === p.id
            return (
              <Card
                key={p.id}
                className={`relative ${p.highlight ? 'border-blue-500 border-2 shadow-lg' : ''}`}
              >
                {p.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-blue-600 text-white px-3">Most Popular</Badge>
                  </div>
                )}
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">{p.name}</CardTitle>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-3xl font-bold text-gray-900">{p.price}</span>
                    <span className="text-gray-500 text-sm">{p.period}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{p.description}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="text-green-500 mt-0.5">✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>

                  {isCurrent ? (
                    <Button disabled className="w-full" variant="outline">
                      Current plan
                    </Button>
                  ) : p.ctaHref ? (
                    <Link href={p.ctaHref}>
                      <Button className="w-full" variant={p.highlight ? 'default' : 'outline'}>
                        {p.cta}
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      className="w-full"
                      variant={p.highlight ? 'default' : 'outline'}
                      onClick={() => handleUpgrade(p.id as 'PRO' | 'TEAM')}
                      disabled={loadingPlan === p.id || loading}
                    >
                      {loadingPlan === p.id ? 'Redirecting...' : p.cta}
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </main>
    </div>
  )
}
