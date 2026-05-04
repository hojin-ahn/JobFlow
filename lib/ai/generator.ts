import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export interface GenerateInput {
  jobTitle: string
  company: string
  companyDescription: string
  location: string
  jobType: string
  keyResponsibilities: string[]
  requiredSkills: string[]
  tone: 'formal' | 'casual' | 'startup'
}

const SYSTEM_PROMPT = `You are an expert recruiter and copywriter specializing in tech job postings.
Your job ads attract top candidates because they are specific, honest, and compelling.

Rules:
- Never use corporate filler ("fast-paced environment", "rockstar", "ninja")
- Lead with what makes this role unique and meaningful
- Requirements section: separate "must-have" from "nice-to-have"
- Benefits: only list real, specific benefits
- Match the requested tone exactly
- Write description in Korean if company is Korean, English otherwise
- Output strict JSON matching the provided schema`

export async function streamJobPostingGeneration(input: GenerateInput): Promise<ReadableStream> {
  const userPrompt = `Generate a complete job posting for:

Job Title: ${input.jobTitle}
Company: ${input.company}
Company Description: ${input.companyDescription || 'A growing tech company'}
Location: ${input.location}
Job Type: ${input.jobType}
Key Responsibilities: ${input.keyResponsibilities.join(', ') || 'To be determined'}
Required Skills: ${input.requiredSkills.join(', ') || 'Relevant technical skills'}
Tone: ${input.tone}

Return ONLY valid JSON in this exact format:
{
  "title": "string",
  "company": "string",
  "location": "string",
  "jobType": "FULL_TIME|PART_TIME|CONTRACT|INTERNSHIP",
  "category": "string",
  "salaryMin": number or null,
  "salaryMax": number or null,
  "currency": "KRW",
  "description": "string (HTML with <p>, <ul>, <li>, <strong> tags)",
  "requirements": ["string array of requirements"],
  "benefits": ["string array of benefits"]
}`

  const encoder = new TextEncoder()

  return new ReadableStream({
    async start(controller) {
      try {
        const stream = client.messages.stream({
          model: 'claude-sonnet-4-5',
          max_tokens: 2000,
          system: SYSTEM_PROMPT,
          messages: [{ role: 'user', content: userPrompt }],
        })

        let fullText = ''

        for await (const event of stream) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            const text = event.delta.text
            fullText += text
            const sseData = JSON.stringify({ text })
            controller.enqueue(encoder.encode(`data: ${sseData}\n\n`))
          }
        }

        // Parse and send final structured result
        try {
          const jsonMatch = fullText.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            const result = JSON.parse(jsonMatch[0])
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ result })}\n\n`)
            )
          }
        } catch {
          // Could not parse JSON from response
        }

        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      } catch (err) {
        controller.error(err)
      }
    },
  })
}
