'use client'

import { useQuery } from '@apollo/client/react'
import { GET_ME } from '@/lib/graphql/operations'
import { match } from 'ts-pattern'

type Plan = 'FREE' | 'PRO' | 'TEAM'

interface PlanFeatures {
  canUseAI: boolean
  canCreateUnlimitedPostings: boolean
  maxPostings: number | null
  hasAnalytics: boolean
  hasTeamMembers: boolean
}

const PLAN_FEATURES: Record<Plan, PlanFeatures> = {
  FREE: {
    canUseAI: false,
    canCreateUnlimitedPostings: false,
    maxPostings: 3,
    hasAnalytics: false,
    hasTeamMembers: false,
  },
  PRO: {
    canUseAI: true,
    canCreateUnlimitedPostings: true,
    maxPostings: null,
    hasAnalytics: true,
    hasTeamMembers: false,
  },
  TEAM: {
    canUseAI: true,
    canCreateUnlimitedPostings: true,
    maxPostings: null,
    hasAnalytics: true,
    hasTeamMembers: true,
  },
}

export function usePlan() {
  const { data, loading } = useQuery<{ me: { plan: Plan } | null }>(GET_ME)
  const plan: Plan = data?.me?.plan ?? 'FREE'
  const features = PLAN_FEATURES[plan]

  const planLabel = match(plan)
    .with('FREE', () => 'Free')
    .with('PRO', () => 'Pro')
    .with('TEAM', () => 'Team')
    .exhaustive()

  return { plan, planLabel, features, loading }
}
