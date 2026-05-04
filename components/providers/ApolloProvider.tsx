'use client'

import { ApolloProvider } from '@apollo/client/react'
import { apolloClient } from '@/lib/graphql/client'

export function AppApolloProvider({ children }: { children: React.ReactNode }) {
  return <ApolloProvider client={apolloClient}>{children}</ApolloProvider>
}
