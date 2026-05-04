import { createYoga } from 'graphql-yoga'
import { schema } from '@/lib/graphql/schema'
import { auth } from '@/lib/auth'
import type { NextRequest } from 'next/server'

const yoga = createYoga({
  schema,
  graphqlEndpoint: '/api/graphql',
  fetchAPI: { Response, Request, Headers },
  context: async () => {
    const session = await auth()
    return {
      userId: session?.user?.id ?? null,
    }
  },
})

export async function GET(req: NextRequest) {
  return yoga.fetch(req)
}

export async function POST(req: NextRequest) {
  return yoga.fetch(req)
}

export async function OPTIONS(req: NextRequest) {
  return yoga.fetch(req)
}
