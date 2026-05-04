import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { scorePosting } from '@/lib/ai/scorer'
import { NextRequest } from 'next/server'

if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error('ANTHROPIC_API_KEY is required')
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (user?.plan === 'FREE') {
    return Response.json({ error: 'AI scoring requires Pro plan' }, { status: 403 })
  }

  const { posting } = await req.json()
  if (!posting) {
    return Response.json({ error: 'Missing posting data' }, { status: 400 })
  }

  const result = await scorePosting(posting)

  // Persist score if posting has an ID
  if (posting.id) {
    await prisma.jobPosting.update({
      where: { id: posting.id },
      data: {
        aiScore: result.score,
        aiSuggestions: result.suggestions,
      },
    }).catch(() => {}) // non-fatal
  }

  return Response.json(result)
}
