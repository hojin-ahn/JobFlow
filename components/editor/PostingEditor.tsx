'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { debounce } from 'es-toolkit'
import { match } from 'ts-pattern'
import { useEditorStore, getStatusLabel, type PostingDraft } from '@/stores/editorStore'
import { useUpdatePosting, usePublishPosting } from '@/hooks/usePosting'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { MarkdownEditor } from './MarkdownEditor'
import { TagInput } from './TagInput'
import { ScorePanel } from './ScorePanel'
import { AiGenerateModal } from './AiGenerateModal'
import { CandidatePreview } from '@/components/preview/CandidatePreview'

interface PostingEditorProps {
  initialPosting: PostingDraft & { id: string }
}

export function PostingEditor({ initialPosting }: PostingEditorProps) {
  const router = useRouter()
  const {
    posting, isDirty, isSaving, isGenerating, score, previewMode,
    activeSuggestion, setPosting, setField, setIsSaving, setPreviewMode,
    markClean,
  } = useEditorStore()

  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [showScore, setShowScore] = useState(false)
  const [isScoring, setIsScoring] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  const [updatePosting] = useUpdatePosting()
  const [publishPosting] = usePublishPosting()

  useEffect(() => {
    setPosting(initialPosting)
    setIsMounted(true)
  }, [initialPosting.id])

  // Autosave — debounced 2s
  const savePosting = useCallback(
    async (draft: PostingDraft) => {
      if (!draft.id) return
      setIsSaving(true)
      try {
        await updatePosting({
          variables: {
            id: draft.id,
            input: {
              title: draft.title,
              company: draft.company,
              location: draft.location,
              jobType: draft.jobType,
              category: draft.category,
              salaryMin: draft.salaryMin ?? undefined,
              salaryMax: draft.salaryMax ?? undefined,
              currency: draft.currency,
              description: draft.description,
              requirements: draft.requirements,
              benefits: draft.benefits,
              status: draft.status,
            },
          },
        })
        markClean()
      } catch (err) {
        console.error('Autosave failed:', err)
      } finally {
        setIsSaving(false)
      }
    },
    [updatePosting, markClean, setIsSaving]
  )

  const debouncedSave = useRef(debounce(savePosting, 2000))

  useEffect(() => {
    if (isDirty && isMounted) {
      debouncedSave.current(posting)
    }
  }, [posting, isDirty, isMounted])

  const handlePublish = async () => {
    if (!posting.id) return
    await publishPosting({ variables: { id: posting.id } })
    setField('status', 'PUBLISHED')
  }

  const handleScore = async () => {
    if (!posting.id) return
    setIsScoring(true)
    try {
      const res = await fetch('/api/ai/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ posting }),
      })
      if (!res.ok) throw new Error('Scoring failed')
      const data = await res.json()
      const { setScore, setField: sf } = useEditorStore.getState()
      setScore(data)
      sf('aiScore', data.score)
      setShowScore(true)
    } catch (err) {
      console.error('Scoring error:', err)
    } finally {
      setIsScoring(false)
    }
  }

  const statusVariant = match(posting.status)
    .with('DRAFT', () => 'secondary' as const)
    .with('PUBLISHED', () => 'default' as const)
    .with('PAUSED', () => 'outline' as const)
    .with('EXPIRED', () => 'destructive' as const)
    .exhaustive()

  if (!isMounted) return null

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="border-b border-gray-200 bg-white px-4 py-3 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')}>
            ← Back
          </Button>
          <span className="text-sm font-semibold text-gray-900 max-w-xs truncate">
            {posting.title || 'Untitled Posting'}
          </span>
          <Badge variant={statusVariant}>{getStatusLabel(posting.status)}</Badge>
        </div>
        <div className="flex items-center gap-2">
          {isSaving && <span className="text-xs text-gray-400">Saving...</span>}
          {!isSaving && !isDirty && <span className="text-xs text-gray-400">Saved</span>}
          <Button
            size="sm"
            variant="outline"
            onClick={handleScore}
            disabled={isScoring || !posting.title}
          >
            {isScoring ? 'Scoring...' : 'Score'}
          </Button>
          {posting.status === 'DRAFT' && (
            <Button size="sm" onClick={handlePublish} disabled={!posting.title}>
              Publish
            </Button>
          )}
        </div>
      </div>

      {/* Split pane */}
      <div className="flex flex-1 overflow-hidden">
        {/* Editor — left 55% */}
        <div className="w-[55%] overflow-y-auto border-r border-gray-200 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700">Job Details</h2>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowGenerateModal(true)}
              disabled={isGenerating}
              className="text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              {isGenerating ? 'Generating...' : '✨ Generate with AI'}
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="title" className={activeSuggestion === 'title' ? 'text-blue-600' : ''}>
                Job Title *
              </Label>
              <Input
                id="title"
                value={posting.title}
                onChange={(e) => setField('title', e.target.value)}
                placeholder="e.g. Frontend Engineer Intern"
                className={activeSuggestion === 'title' ? 'border-blue-400 ring-1 ring-blue-300' : ''}
              />
            </div>

            <div>
              <Label htmlFor="company">Company *</Label>
              <Input
                id="company"
                value={posting.company}
                onChange={(e) => setField('company', e.target.value)}
                placeholder="Company name"
              />
            </div>

            <div>
              <Label htmlFor="location" className={activeSuggestion === 'location' ? 'text-blue-600' : ''}>
                Location
              </Label>
              <Input
                id="location"
                value={posting.location}
                onChange={(e) => setField('location', e.target.value)}
                placeholder="Seoul, Korea"
                className={activeSuggestion === 'location' ? 'border-blue-400 ring-1 ring-blue-300' : ''}
              />
            </div>

            <div>
              <Label>Job Type</Label>
              <Select value={posting.jobType} onValueChange={(v) => setField('jobType', v as PostingDraft['jobType'])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FULL_TIME">정규직 (Full Time)</SelectItem>
                  <SelectItem value="PART_TIME">파트타임 (Part Time)</SelectItem>
                  <SelectItem value="CONTRACT">계약직 (Contract)</SelectItem>
                  <SelectItem value="INTERNSHIP">인턴십 (Internship)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={posting.category}
                onChange={(e) => setField('category', e.target.value)}
                placeholder="Engineering"
              />
            </div>

            <div>
              <Label htmlFor="salaryMin" className={activeSuggestion === 'salary' ? 'text-blue-600' : ''}>
                Salary Min (만원)
              </Label>
              <Input
                id="salaryMin"
                type="number"
                value={posting.salaryMin ?? ''}
                onChange={(e) => setField('salaryMin', e.target.value ? Number(e.target.value) : null)}
                placeholder="3000"
                className={activeSuggestion === 'salary' ? 'border-blue-400 ring-1 ring-blue-300' : ''}
              />
            </div>

            <div>
              <Label htmlFor="salaryMax">Salary Max (만원)</Label>
              <Input
                id="salaryMax"
                type="number"
                value={posting.salaryMax ?? ''}
                onChange={(e) => setField('salaryMax', e.target.value ? Number(e.target.value) : null)}
                placeholder="5000"
              />
            </div>
          </div>

          <Separator />

          <div>
            <Label className={activeSuggestion === 'description' ? 'text-blue-600' : ''}>
              Description
            </Label>
            <div className={activeSuggestion === 'description' ? 'ring-1 ring-blue-300 rounded-md' : ''}>
              <MarkdownEditor
                value={posting.description}
                onChange={(v) => setField('description', v)}
                placeholder="Describe the role, team, and what makes it exciting..."
              />
            </div>
          </div>

          <div>
            <Label className={activeSuggestion === 'requirements' ? 'text-blue-600' : ''}>
              Requirements
            </Label>
            <TagInput
              value={posting.requirements}
              onChange={(v) => setField('requirements', v)}
              placeholder="Add requirement and press Enter..."
            />
          </div>

          <div>
            <Label className={activeSuggestion === 'benefits' ? 'text-blue-600' : ''}>
              Benefits
            </Label>
            <TagInput
              value={posting.benefits}
              onChange={(v) => setField('benefits', v)}
              placeholder="Add benefit and press Enter..."
            />
          </div>

          {/* Score panel at bottom of editor */}
          {(score && showScore) && (
            <div>
              <Separator className="mb-4" />
              <ScorePanel score={score} />
            </div>
          )}
        </div>

        {/* Preview — right 45% */}
        <div className="w-[45%] overflow-y-auto bg-gray-50">
          <div className="sticky top-0 bg-gray-50 border-b border-gray-200 px-4 py-2 flex items-center justify-between z-10">
            <span className="text-xs font-semibold text-gray-600">Candidate Preview</span>
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant={previewMode === 'desktop' ? 'default' : 'ghost'}
                className="h-6 text-xs px-2"
                onClick={() => setPreviewMode('desktop')}
              >
                Desktop
              </Button>
              <Button
                size="sm"
                variant={previewMode === 'mobile' ? 'default' : 'ghost'}
                className="h-6 text-xs px-2"
                onClick={() => setPreviewMode('mobile')}
              >
                Mobile
              </Button>
            </div>
          </div>
          <div className={`p-4 ${previewMode === 'mobile' ? 'max-w-sm mx-auto' : ''}`}>
            <CandidatePreview posting={posting} />
          </div>
        </div>
      </div>

      <AiGenerateModal open={showGenerateModal} onClose={() => setShowGenerateModal(false)} />
    </div>
  )
}
