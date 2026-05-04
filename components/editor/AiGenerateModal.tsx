'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useEditorStore } from '@/stores/editorStore'
import { TagInput } from './TagInput'

interface AiGenerateModalProps {
  open: boolean
  onClose: () => void
}

export function AiGenerateModal({ open, onClose }: AiGenerateModalProps) {
  const { setPosting, setIsGenerating, posting } = useEditorStore()
  const [form, setForm] = useState({
    jobTitle: posting.title || '',
    company: posting.company || '',
    companyDescription: '',
    location: posting.location || '',
    jobType: posting.jobType || 'FULL_TIME',
    keyResponsibilities: [] as string[],
    requiredSkills: [] as string[],
    tone: 'casual' as 'formal' | 'casual' | 'startup',
  })
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamedText, setStreamedText] = useState('')

  const handleGenerate = async () => {
    setIsStreaming(true)
    setStreamedText('')
    setIsGenerating(true)

    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!res.ok) throw new Error('Generation failed')
      if (!res.body) throw new Error('No stream body')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)

        // Parse SSE lines
        for (const line of chunk.split('\n')) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') continue
            try {
              const parsed = JSON.parse(data)
              if (parsed.text) {
                accumulated += parsed.text
                setStreamedText(accumulated)
              }
              if (parsed.result) {
                // Final structured result
                const draft = parsed.result
                setPosting({
                  id: posting.id,
                  title: draft.title || posting.title,
                  company: draft.company || posting.company,
                  location: draft.location || posting.location,
                  jobType: draft.jobType || posting.jobType,
                  category: draft.category || posting.category,
                  salaryMin: draft.salaryMin ?? posting.salaryMin,
                  salaryMax: draft.salaryMax ?? posting.salaryMax,
                  currency: draft.currency || posting.currency,
                  description: draft.description || '',
                  requirements: draft.requirements || [],
                  benefits: draft.benefits || [],
                  status: posting.status,
                })
                onClose()
              }
            } catch {
              // partial JSON chunk, continue
            }
          }
        }
      }
    } catch (err) {
      console.error('Generation error:', err)
    } finally {
      setIsStreaming(false)
      setIsGenerating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Generate with AI</DialogTitle>
        </DialogHeader>

        {isStreaming ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-sm text-gray-600">Generating your job posting...</span>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 font-mono max-h-48 overflow-y-auto whitespace-pre-wrap">
              {streamedText || 'Starting...'}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label htmlFor="jobTitle">Job Title *</Label>
              <Input
                id="jobTitle"
                value={form.jobTitle}
                onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
                placeholder="e.g. Frontend Engineer Intern"
              />
            </div>

            <div>
              <Label htmlFor="company">Company *</Label>
              <Input
                id="company"
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                placeholder="e.g. Daangn Market"
              />
            </div>

            <div>
              <Label htmlFor="companyDescription">Company Description</Label>
              <Textarea
                id="companyDescription"
                value={form.companyDescription}
                onChange={(e) => setForm({ ...form, companyDescription: e.target.value })}
                placeholder="1-3 sentences about the company"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="e.g. Seoul, Korea (Remote)"
              />
            </div>

            <div>
              <Label>Job Type</Label>
              <Select
                value={form.jobType}
                onValueChange={(v) => setForm({ ...form, jobType: v as typeof form.jobType })}
              >
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
              <Label>Key Responsibilities</Label>
              <TagInput
                value={form.keyResponsibilities}
                onChange={(v) => setForm({ ...form, keyResponsibilities: v })}
                placeholder="Add responsibility and press Enter..."
              />
            </div>

            <div>
              <Label>Required Skills</Label>
              <TagInput
                value={form.requiredSkills}
                onChange={(v) => setForm({ ...form, requiredSkills: v })}
                placeholder="React, TypeScript, GraphQL..."
              />
            </div>

            <div>
              <Label>Tone</Label>
              <Select
                value={form.tone}
                onValueChange={(v) => setForm({ ...form, tone: v as typeof form.tone })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="formal">Formal</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="startup">Startup</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={handleGenerate}
                className="flex-1"
                disabled={!form.jobTitle || !form.company || !form.location}
              >
                Generate
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
