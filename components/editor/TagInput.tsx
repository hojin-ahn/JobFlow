'use client'

import { useState, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

interface TagInputProps {
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
}

export function TagInput({ value, onChange, placeholder }: TagInputProps) {
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const addTag = (tag: string) => {
    const trimmed = tag.trim()
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed])
    }
    setInputValue('')
  }

  const removeTag = (index: number) => {
    onChange(value.filter((_, i) => i !== index))
  }

  return (
    <div
      className="flex flex-wrap gap-1.5 p-2 border border-gray-200 rounded-md bg-white min-h-[40px] cursor-text"
      onClick={() => inputRef.current?.focus()}
    >
      {value.map((tag, i) => (
        <Badge key={i} variant="secondary" className="gap-1 text-xs">
          {tag}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              removeTag(i)
            }}
            className="ml-1 hover:text-red-500 leading-none"
          >
            ×
          </button>
        </Badge>
      ))}
      <input
        ref={inputRef}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault()
            addTag(inputValue)
          } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
            onChange(value.slice(0, -1))
          }
        }}
        onBlur={() => {
          if (inputValue.trim()) addTag(inputValue)
        }}
        placeholder={value.length === 0 ? (placeholder ?? 'Type and press Enter...') : ''}
        className="flex-1 min-w-[120px] outline-none text-sm bg-transparent"
      />
    </div>
  )
}
