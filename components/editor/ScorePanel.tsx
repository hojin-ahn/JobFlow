'use client'

import { match } from 'ts-pattern'
import { useEditorStore, type ScoringResult } from '@/stores/editorStore'
import { Badge } from '@/components/ui/badge'

interface ScorePanelProps {
  score: ScoringResult
  isLoading?: boolean
}

const gradeColor = (grade: string) =>
  match(grade)
    .with('A', () => 'text-green-600')
    .with('B', () => 'text-blue-600')
    .with('C', () => 'text-yellow-600')
    .with('D', () => 'text-red-600')
    .otherwise(() => 'text-gray-600')

const impactColor = (impact: string) =>
  match(impact)
    .with('high', () => 'bg-red-100 text-red-700 border-red-200')
    .with('medium', () => 'bg-yellow-100 text-yellow-700 border-yellow-200')
    .with('low', () => 'bg-blue-100 text-blue-700 border-blue-200')
    .otherwise(() => 'bg-gray-100 text-gray-700 border-gray-200')

export function ScorePanel({ score, isLoading }: ScorePanelProps) {
  const { setActiveSuggestion } = useEditorStore()

  const scorePct = score.score

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
      {/* Score ring */}
      <div className="flex items-center gap-4">
        <div className="relative w-16 h-16">
          <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
            <circle
              cx="18"
              cy="18"
              r="15.9"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="3"
            />
            <circle
              cx="18"
              cy="18"
              r="15.9"
              fill="none"
              stroke={
                match(score.grade)
                  .with('A', () => '#16a34a')
                  .with('B', () => '#2563eb')
                  .with('C', () => '#ca8a04')
                  .with('D', () => '#dc2626')
                  .otherwise(() => '#6b7280')
              }
              strokeWidth="3"
              strokeDasharray={`${(scorePct / 100) * 100} 100`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-sm font-bold ${gradeColor(score.grade)}`}>{score.grade}</span>
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-900">{score.score}<span className="text-sm text-gray-400">/100</span></div>
          <div className="text-xs text-gray-500">AI Optimization Score</div>
        </div>
      </div>

      {/* Breakdown */}
      <div className="space-y-2">
        {Object.entries(score.breakdown).map(([key, val]) => (
          <div key={key} className="flex items-center gap-2">
            <span className="text-xs text-gray-500 w-32 capitalize">{key.replace('_', ' ')}</span>
            <div className="flex-1 bg-gray-100 rounded-full h-1.5">
              <div
                className="bg-blue-500 h-1.5 rounded-full transition-all"
                style={{ width: `${val}%` }}
              />
            </div>
            <span className="text-xs font-medium text-gray-600 w-6 text-right">{val}</span>
          </div>
        ))}
      </div>

      {/* Suggestions */}
      {score.suggestions.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Suggestions</p>
          {score.suggestions.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveSuggestion(s.field)}
              className="w-full text-left p-3 rounded-lg border hover:shadow-sm transition-shadow bg-gray-50 hover:bg-white"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs px-1.5 py-0.5 rounded border font-medium ${impactColor(s.impact)}`}>
                  {s.impact}
                </span>
                <span className="text-xs font-medium text-gray-700 capitalize">{s.field}</span>
              </div>
              <p className="text-xs text-gray-600 mb-1">{s.issue}</p>
              <p className="text-xs text-blue-600">{s.fix}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
