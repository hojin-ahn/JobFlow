import Anthropic from '@anthropic-ai/sdk'
import type { PostingDraft } from '@/stores/editorStore'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export interface ScoringResult {
  score: number
  grade: 'A' | 'B' | 'C' | 'D'
  breakdown: {
    clarity: number
    specificity: number
    candidate_appeal: number
    completeness: number
  }
  suggestions: Array<{
    field: string
    issue: string
    fix: string
    impact: 'high' | 'medium' | 'low'
  }>
}

export async function scorePosting(posting: PostingDraft): Promise<ScoringResult> {
  const prompt = `Analyze this job posting and score it from 0-100 on effectiveness for attracting candidates.

Job Posting:
Title: ${posting.title}
Company: ${posting.company}
Location: ${posting.location}
Job Type: ${posting.jobType}
Salary: ${posting.salaryMin ? `${posting.salaryMin}~${posting.salaryMax} 만원` : 'Not specified'}
Description: ${posting.description.replace(/<[^>]*>/g, ' ').slice(0, 500)}
Requirements: ${posting.requirements.join(', ')}
Benefits: ${posting.benefits.join(', ')}

Return ONLY valid JSON in exactly this format:
{
  "score": <0-100>,
  "grade": "<A|B|C|D>",
  "breakdown": {
    "clarity": <0-100>,
    "specificity": <0-100>,
    "candidate_appeal": <0-100>,
    "completeness": <0-100>
  },
  "suggestions": [
    {
      "field": "<field name: title|description|requirements|benefits|salary|location>",
      "issue": "<what is wrong or missing>",
      "fix": "<specific actionable suggestion>",
      "impact": "<high|medium|low>"
    }
  ]
}

Scoring criteria:
- clarity: Is the role and expectations clearly communicated?
- specificity: Are requirements and responsibilities specific (not vague)?
- candidate_appeal: Does it highlight what makes this role attractive?
- completeness: Are all important fields filled in adequately?

Grade: A=85+, B=70-84, C=55-69, D=0-54
Provide 2-4 actionable suggestions ordered by impact.`

  const response = await client.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 1000,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('Could not parse scoring response')

  return JSON.parse(jsonMatch[0]) as ScoringResult
}
