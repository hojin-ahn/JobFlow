'use client'

import { useQuery, useMutation } from '@apollo/client/react'
import {
  GET_POSTING,
  GET_POSTINGS,
  CREATE_POSTING,
  UPDATE_POSTING,
  PUBLISH_POSTING,
  DELETE_POSTING,
  UPDATE_POSTING_SCORE,
} from '@/lib/graphql/operations'
import type { JobPosting, PostingStatus } from '@prisma/client'

export type PostingInput = {
  title: string
  company: string
  location: string
  jobType?: string
  category?: string
  salaryMin?: number | null
  salaryMax?: number | null
  currency?: string
  description?: string
  requirements?: string[]
  benefits?: string[]
}

export function usePosting(id: string) {
  return useQuery<{ posting: JobPosting | null }>(GET_POSTING, {
    variables: { id },
    skip: !id,
  })
}

export function usePostings(status?: PostingStatus) {
  return useQuery<{
    postings: {
      edges: Array<{ node: JobPosting; cursor: string }>
      pageInfo: { hasNextPage: boolean; endCursor: string | null }
      totalCount: number
    }
  }>(GET_POSTINGS, {
    variables: { status, first: 50 },
  })
}

export function useCreatePosting() {
  return useMutation<{ createPosting: JobPosting }, { input: PostingInput }>(CREATE_POSTING, {
    refetchQueries: [GET_POSTINGS],
  })
}

export function useUpdatePosting() {
  return useMutation<{ updatePosting: JobPosting }, { id: string; input: Partial<PostingInput> & { status?: string; expiresAt?: string } }>(
    UPDATE_POSTING
  )
}

export function usePublishPosting() {
  return useMutation<{ publishPosting: JobPosting }, { id: string }>(PUBLISH_POSTING)
}

export function useDeletePosting() {
  return useMutation<{ deletePosting: boolean }, { id: string }>(DELETE_POSTING, {
    refetchQueries: [GET_POSTINGS],
  })
}

export function useUpdatePostingScore() {
  return useMutation<
    { updatePostingScore: JobPosting },
    { id: string; score: number; suggestions?: unknown }
  >(UPDATE_POSTING_SCORE)
}
