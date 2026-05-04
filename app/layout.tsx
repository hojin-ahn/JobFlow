import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { AppApolloProvider } from '@/components/providers/ApolloProvider'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'JobFlow — AI-Powered Job Ad Builder',
  description: 'Create compelling job postings with AI assistance. Real-time preview, optimization scores, and instant publishing.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <AppApolloProvider>{children}</AppApolloProvider>
      </body>
    </html>
  )
}
