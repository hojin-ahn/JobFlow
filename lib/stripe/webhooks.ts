import { stripe } from './client'
import { prisma } from '@/lib/prisma'
import type Stripe from 'stripe'
import type { Plan } from '@prisma/client'

export async function handleSubscriptionUpsert(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string
  const user = await prisma.user.findFirst({ where: { stripeCustomerId: customerId } })
  if (!user) return

  const priceId = subscription.items.data[0]?.price.id
  const proPrice = process.env.STRIPE_PRO_PRICE_ID
  const teamPrice = process.env.STRIPE_TEAM_PRICE_ID

  let plan: Plan = 'FREE'
  if (subscription.status === 'active' || subscription.status === 'trialing') {
    if (priceId === teamPrice) plan = 'TEAM'
    else if (priceId === proPrice) plan = 'PRO'
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { plan },
  })
}

export async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string
  await prisma.user.updateMany({
    where: { stripeCustomerId: customerId },
    data: { plan: 'FREE' },
  })
}
