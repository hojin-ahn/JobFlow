'use client'

import { match } from 'ts-pattern'
import { useMemo } from 'react'
import type { PostingDraft } from '@/stores/editorStore'
import { Badge } from '@/components/ui/badge'

interface CandidatePreviewProps {
  posting: PostingDraft
}

function formatSalary(min: number | null, max: number | null, currency: string) {
  if (!min && !max) return null
  const fmt = (n: number) => `${(n / 100).toFixed(0)}억`.replace(/^0억$/, '') || `${n}만원`
  const fmtWon = (n: number) => n >= 10000
    ? `${(n / 10000).toFixed(n % 10000 === 0 ? 0 : 1)}억`
    : `${n.toLocaleString()}만원`

  if (min && max) return `연봉 ${fmtWon(min)} ~ ${fmtWon(max)}`
  if (min) return `연봉 ${fmtWon(min)} 이상`
  if (max) return `연봉 최대 ${fmtWon(max!)}`
  return null
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function CandidatePreview({ posting }: CandidatePreviewProps) {
  const salaryText = useMemo(
    () => formatSalary(posting.salaryMin, posting.salaryMax, posting.currency),
    [posting.salaryMin, posting.salaryMax, posting.currency]
  )

  const jobTypeLabel = match(posting.jobType)
    .with('FULL_TIME', () => '정규직')
    .with('PART_TIME', () => '파트타임')
    .with('CONTRACT', () => '계약직')
    .with('INTERNSHIP', () => '인턴십')
    .exhaustive()

  const initials = posting.company ? getInitials(posting.company) : 'J'

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      {/* Header card */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-start gap-4">
          {/* Company logo placeholder */}
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-lg">{initials}</span>
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold text-gray-900 leading-tight">
              {posting.title || <span className="text-gray-300">채용 제목</span>}
            </h1>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <span className="text-sm text-gray-600">
                {posting.company || <span className="text-gray-300">회사명</span>}
              </span>
              {posting.location && (
                <>
                  <span className="text-gray-300">·</span>
                  <span className="text-sm text-gray-500">{posting.location}</span>
                </>
              )}
              <span className="text-gray-300">·</span>
              <span className="text-sm text-gray-500">{jobTypeLabel}</span>
            </div>

            {salaryText && (
              <div className="mt-2">
                <span className="text-sm font-semibold text-blue-600">{salaryText}</span>
              </div>
            )}

            <div className="flex flex-wrap gap-1.5 mt-3">
              <Badge variant="secondary" className="text-xs">{posting.category}</Badge>
              {posting.location && (
                <Badge variant="outline" className="text-xs">{posting.location}</Badge>
              )}
            </div>
          </div>
        </div>

        {/* CTA */}
        <button className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2.5 text-sm font-semibold transition-colors">
          지원하기
        </button>
      </div>

      {/* Body */}
      <div className="p-5 space-y-6">
        {/* Description */}
        {posting.description && posting.description !== '<p></p>' ? (
          <div>
            <h2 className="text-sm font-bold text-gray-800 mb-2">업무 소개</h2>
            <div
              className="text-sm text-gray-600 leading-relaxed prose prose-sm max-w-none [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
              dangerouslySetInnerHTML={{ __html: posting.description }}
            />
          </div>
        ) : (
          <div className="text-sm text-gray-300 italic">업무 설명이 여기에 표시됩니다...</div>
        )}

        {/* Requirements */}
        {posting.requirements.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-gray-800 mb-2">자격 요건</h2>
            <ul className="space-y-1.5">
              {posting.requirements.map((req, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="mt-0.5 w-4 h-4 rounded border border-gray-300 shrink-0 flex items-center justify-center">
                    <span className="text-xs text-gray-400">✓</span>
                  </span>
                  {req}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Benefits */}
        {posting.benefits.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-gray-800 mb-2">복지 및 혜택</h2>
            <div className="grid grid-cols-2 gap-2">
              {posting.benefits.map((benefit, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
                  <span className="text-base">🎁</span>
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-400 text-center">
            JobFlow로 제작된 채용 공고
          </p>
        </div>
      </div>
    </div>
  )
}
