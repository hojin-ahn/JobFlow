import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { stripe, STRIPE_PLANS } from '@/lib/stripe/client'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { plan } = await req.json() as { plan: 'PRO' | 'TEAM' }
  const planConfig = STRIPE_PLANS[plan]
  if (!planConfig) {
    return Response.json({ error: 'Invalid plan' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user) return Response.json({ error: 'User not found' }, { status: 404 })

  // Get or create Stripe customer
  let customerId = user.stripeCustomerId
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name ?? undefined,
      metadata: { userId: user.id },
    })
    customerId = customer.id
    await prisma.user.update({
      where: { id: user.id },
      data: { stripeCustomerId: customerId },
    })
  }

  const origin = req.headers.get('origin') ?? 'http://localhost:3000'

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: planConfig.priceId, quantity: 1 }],
    success_url: `${origin}/dashboard?upgraded=true`,
    cancel_url: `${origin}/pricing`,
    metadata: { userId: user.id, plan },
  })

  return Response.json({ url: checkoutSession.url })
}
