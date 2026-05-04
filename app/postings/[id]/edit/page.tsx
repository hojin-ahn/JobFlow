import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import { PostingEditor } from '@/components/editor/PostingEditor'
import type { PostingDraft } from '@/stores/editorStore'

export default async function EditPostingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) redirect('/auth/signin')

  const posting = await prisma.jobPosting.findUnique({ where: { id } })
  if (!posting || posting.userId !== session.user.id) notFound()

  const draft: PostingDraft & { id: string } = {
    id: posting.id,
    title: posting.title,
    company: posting.company,
    location: posting.location,
    jobType: posting.jobType as PostingDraft['jobType'],
    category: posting.category,
    salaryMin: posting.salaryMin,
    salaryMax: posting.salaryMax,
    currency: posting.currency,
    description: posting.description,
    requirements: posting.requirements,
    benefits: posting.benefits,
    status: posting.status as PostingDraft['status'],
    aiScore: posting.aiScore,
    expiresAt: posting.expiresAt?.toISOString() ?? null,
  }

  return <PostingEditor initialPosting={draft} />
}
