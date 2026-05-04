import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { auth } from '@/lib/auth'

export default async function LandingPage() {
  const session = await auth()

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Nav */}
      <nav className="border-b border-gray-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">J</span>
            </div>
            <span className="font-bold text-gray-900">JobFlow</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/pricing" className="text-sm text-gray-600 hover:text-gray-900">
              Pricing
            </Link>
            {session ? (
              <Link href="/dashboard">
                <Button size="sm">Dashboard</Button>
              </Link>
            ) : (
              <Link href="/auth/signin">
                <Button size="sm">Get started</Button>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
        <div className="max-w-3xl">
          <span className="inline-block text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full mb-6">
            AI-powered recruitment
          </span>
          <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-6">
            Job postings that
            <br />
            <span className="text-blue-600">attract top talent</span>
          </h1>
          <p className="text-xl text-gray-500 mb-10 leading-relaxed">
            Generate compelling job ads with AI in seconds. Real-time candidate preview,
            optimization scoring, and instant publishing.
          </p>
          <div className="flex items-center gap-4 justify-center">
            <Link href={session ? '/dashboard' : '/auth/signin'}>
              <Button size="lg" className="px-8">
                Start for free
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="px-8">
                View pricing
              </Button>
            </Link>
          </div>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-3 gap-6 mt-24 max-w-4xl w-full text-left">
          {[
            {
              icon: '✨',
              title: 'AI Draft Generation',
              desc: 'Input a few details, get a full compelling job posting in seconds. Streaming output.',
            },
            {
              icon: '👁',
              title: 'Real-time Preview',
              desc: 'See exactly how candidates see your posting. Korean job board style.',
            },
            {
              icon: '📊',
              title: 'Optimization Score',
              desc: 'AI scores your posting 0–100 with specific, actionable suggestions.',
            },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="bg-gray-50 rounded-xl p-6">
              <div className="text-2xl mb-3">{icon}</div>
              <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
