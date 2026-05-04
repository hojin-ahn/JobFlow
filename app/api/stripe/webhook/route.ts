import { stripe } from '@/lib/stripe/client'
import { handleSubscriptionUpsert, handleSubscriptionDeleted } from '@/lib/stripe/webhooks'
import { NextRequest } from 'next/server'
import type Stripe from 'stripe'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return new Response('Missing signature', { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch {
    return new Response('Webhook signature verification failed', { status: 400 })
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpsert(event.data.object as Stripe.Subscription)
        break
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break
    }
  } catch (err) {
    console.error(`Webhook handler error for ${event.type}:`, err)
    return new Response('Handler error', { status: 500 })
  }

  return new Response('OK')
}
