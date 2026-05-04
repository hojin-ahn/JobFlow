import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export default async function NewPostingPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/auth/signin')

  const userId = session.user.id

  // Check free plan limit
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (user?.plan === 'FREE') {
    const count = await prisma.jobPosting.count({ where: { userId } })
    if (count >= 3) {
      redirect('/pricing?reason=limit')
    }
  }

  // Create the posting immediately, then redirect to edit
  const posting = await prisma.jobPosting.create({
    data: {
      userId,
      title: '',
      company: '',
      location: '',
      jobType: 'FULL_TIME',
      category: 'Engineering',
      currency: 'KRW',
      description: '',
      requirements: [],
      benefits: [],
    },
  })

  redirect(`/postings/${posting.id}/edit`)
}
