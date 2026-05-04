import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { streamJobPostingGeneration, type GenerateInput } from '@/lib/ai/generator'
import { NextRequest } from 'next/server'

if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error('ANTHROPIC_API_KEY is required')
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 })
  }

  // Check PRO plan for AI features
  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (user?.plan === 'FREE') {
    return new Response('AI generation requires Pro plan', { status: 403 })
  }

  const input: GenerateInput = await req.json()

  if (!input.jobTitle || !input.company || !input.location) {
    return new Response('Missing required fields', { status: 400 })
  }

  const stream = await streamJobPostingGeneration(input)

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
