import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { CandidatePreview } from '@/components/preview/CandidatePreview'
import type { PostingDraft } from '@/stores/editorStore'
import Link from 'next/link'

export default async function PublicPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const posting = await prisma.jobPosting.findUnique({ where: { id } })
  if (!posting) notFound()

  const draft: PostingDraft = {
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
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-4">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900"
          >
            <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs">J</span>
            </div>
            JobFlow
          </Link>
          <span className="text-xs text-gray-400">Candidate preview</span>
        </div>
        <CandidatePreview posting={draft} />
        <p className="text-center text-xs text-gray-400 mt-4">
          Created with{' '}
          <Link href="/" className="text-blue-500 hover:underline">
            JobFlow
          </Link>
        </p>
      </div>
    </div>
  )
}
