'use client'

import { create } from 'zustand'
import { match } from 'ts-pattern'

export type JobType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP'
export type PostingStatus = 'DRAFT' | 'PUBLISHED' | 'PAUSED' | 'EXPIRED'

export interface AiSuggestion {
  field: string
  issue: string
  fix: string
  impact: 'high' | 'medium' | 'low'
}

export interface ScoringResult {
  score: number
  grade: 'A' | 'B' | 'C' | 'D'
  breakdown: {
    clarity: number
    specificity: number
    candidate_appeal: number
    completeness: number
  }
  suggestions: AiSuggestion[]
}

export interface PostingDraft {
  id?: string
  title: string
  company: string
  location: string
  jobType: JobType
  category: string
  salaryMin: number | null
  salaryMax: number | null
  currency: string
  description: string
  requirements: string[]
  benefits: string[]
  status: PostingStatus
  aiScore?: number | null
  expiresAt?: string | null
}

interface EditorStore {
  posting: PostingDraft
  isDirty: boolean
  isSaving: boolean
  isGenerating: boolean
  score: ScoringResult | null
  previewMode: 'desktop' | 'mobile'
  activeSuggestion: string | null

  setField: <K extends keyof PostingDraft>(field: K, value: PostingDraft[K]) => void
  setPosting: (posting: PostingDraft) => void
  setIsSaving: (v: boolean) => void
  setIsGenerating: (v: boolean) => void
  setScore: (score: ScoringResult | null) => void
  setPreviewMode: (mode: 'desktop' | 'mobile') => void
  setActiveSuggestion: (field: string | null) => void
  markClean: () => void
}

const defaultPosting: PostingDraft = {
  title: '',
  company: '',
  location: '',
  jobType: 'FULL_TIME',
  category: 'Engineering',
  salaryMin: null,
  salaryMax: null,
  currency: 'KRW',
  description: '',
  requirements: [],
  benefits: [],
  status: 'DRAFT',
}

export const useEditorStore = create<EditorStore>((set) => ({
  posting: defaultPosting,
  isDirty: false,
  isSaving: false,
  isGenerating: false,
  score: null,
  previewMode: 'desktop',
  activeSuggestion: null,

  setField: (field, value) =>
    set((state) => ({
      posting: { ...state.posting, [field]: value },
      isDirty: true,
    })),

  setPosting: (posting) => set({ posting, isDirty: false }),

  setIsSaving: (isSaving) => set({ isSaving }),

  setIsGenerating: (isGenerating) => set({ isGenerating }),

  setScore: (score) => set({ score }),

  setPreviewMode: (previewMode) => set({ previewMode }),

  setActiveSuggestion: (activeSuggestion) => set({ activeSuggestion }),

  markClean: () => set({ isDirty: false }),
}))

// Helpers using ts-pattern
export const getStatusLabel = (status: PostingStatus) =>
  match(status)
    .with('DRAFT', () => '임시저장')
    .with('PUBLISHED', () => '게시중')
    .with('PAUSED', () => '일시중지')
    .with('EXPIRED', () => '마감됨')
    .exhaustive()

export const getJobTypeLabel = (jobType: JobType) =>
  match(jobType)
    .with('FULL_TIME', () => '정규직')
    .with('PART_TIME', () => '파트타임')
    .with('CONTRACT', () => '계약직')
    .with('INTERNSHIP', () => '인턴십')
    .exhaustive()

export const getScoreGrade = (score: number): 'A' | 'B' | 'C' | 'D' =>
  match(score)
    .when((s) => s >= 85, () => 'A' as const)
    .when((s) => s >= 70, () => 'B' as const)
    .when((s) => s >= 55, () => 'C' as const)
    .otherwise(() => 'D' as const)
