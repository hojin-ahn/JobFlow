import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { match } from 'ts-pattern'

export default async function DashboardPage() {
  const session = await auth()
  const userId = session!.user!.id

  const [user, postings] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.jobPosting.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  const stats = {
    total: postings.length,
    views: postings.reduce((sum, p) => sum + p.views, 0),
    applications: postings.reduce((sum, p) => sum + p.applications, 0),
    avgScore:
      postings.filter((p) => p.aiScore !== null).length > 0
        ? Math.round(
            postings.filter((p) => p.aiScore !== null).reduce((sum, p) => sum + (p.aiScore ?? 0), 0) /
              postings.filter((p) => p.aiScore !== null).length
          )
        : null,
  }

  const isFree = user?.plan === 'FREE'
  const postingsRemaining = isFree ? Math.max(0, 3 - postings.length) : null

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            {user?.name ? `Welcome back, ${user.name.split(' ')[0]}` : 'Welcome back'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isFree && postingsRemaining === 0 ? (
            <Link href="/pricing">
              <Button>Upgrade to Pro</Button>
            </Link>
          ) : (
            <Link href="/postings/new">
              <Button>New Posting</Button>
            </Link>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Postings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Views</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.views.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.applications.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Avg AI Score</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.avgScore !== null ? `${stats.avgScore}` : '—'}</p>
          </CardContent>
        </Card>
      </div>

      {/* Free plan usage meter */}
      {isFree && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-900">
                  Free plan: {postings.length} / 3 postings used
                </p>
                <p className="text-xs text-amber-700 mt-0.5">
                  Upgrade to Pro for unlimited postings + AI generation
                </p>
              </div>
              <Link href="/pricing">
                <Button size="sm" variant="outline" className="border-amber-400 text-amber-900 hover:bg-amber-100">
                  Upgrade
                </Button>
              </Link>
            </div>
            <div className="mt-3 bg-amber-200 rounded-full h-2">
              <div
                className="bg-amber-500 h-2 rounded-full transition-all"
                style={{ width: `${Math.min(100, (postings.length / 3) * 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Postings grid */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Postings</h2>
        {postings.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-16 flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <p className="text-gray-500 text-sm">No postings yet</p>
              <Link href="/postings/new">
                <Button size="sm">Create your first posting</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {postings.map((posting) => {
              const statusLabel = match(posting.status)
                .with('DRAFT', () => '임시저장')
                .with('PUBLISHED', () => '게시중')
                .with('PAUSED', () => '일시중지')
                .with('EXPIRED', () => '마감됨')
                .exhaustive()

              const statusVariant = match(posting.status)
                .with('DRAFT', () => 'secondary' as const)
                .with('PUBLISHED', () => 'default' as const)
                .with('PAUSED', () => 'outline' as const)
                .with('EXPIRED', () => 'destructive' as const)
                .exhaustive()

              return (
                <Card key={posting.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <CardTitle className="text-base font-semibold line-clamp-1">
                          {posting.title}
                        </CardTitle>
                        <p className="text-sm text-gray-500 mt-0.5">{posting.company}</p>
                      </div>
                      <Badge variant={statusVariant}>{statusLabel}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                      <span>{posting.location}</span>
                      <span>{posting.views} views</span>
                      <span>{posting.applications} apps</span>
                    </div>
                    {posting.aiScore !== null && (
                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                          <div
                            className="bg-blue-500 h-1.5 rounded-full"
                            style={{ width: `${posting.aiScore}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-blue-600">{posting.aiScore}/100</span>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Link href={`/postings/${posting.id}/edit`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          Edit
                        </Button>
                      </Link>
                      <Link href={`/postings/${posting.id}/preview`}>
                        <Button variant="ghost" size="sm">
                          Preview
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
