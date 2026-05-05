'use client'

import { useRouter } from 'next/navigation'

interface BackButtonProps {
  editHref: string
}

export function BackButton({ editHref }: BackButtonProps) {
  const router = useRouter()

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push(editHref)
    }
  }

  return (
    <button
      onClick={handleBack}
      className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      뒤로가기
    </button>
  )
}
