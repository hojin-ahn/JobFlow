import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is required')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2026-04-22.dahlia',
})

export const STRIPE_PLANS = {
  PRO: {
    name: 'Pro',
    priceId: process.env.STRIPE_PRO_PRICE_ID ?? '',
    amount: 900, // $9/mo in cents
  },
  TEAM: {
    name: 'Team',
    priceId: process.env.STRIPE_TEAM_PRICE_ID ?? '',
    amount: 2900, // $29/mo in cents
  },
} as const
