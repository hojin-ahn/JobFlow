'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { useEffect, useCallback } from 'react'

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function MarkdownEditor({ value, onChange, placeholder, className }: MarkdownEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: placeholder ?? 'Write a compelling job description...',
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[200px] px-3 py-2',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  // Sync external value changes (e.g. from AI generation)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false })
    }
  }, [value, editor])

  return (
    <div className={`border border-gray-200 rounded-md bg-white ${className ?? ''}`}>
      {editor && (
        <div className="border-b border-gray-100 px-2 py-1 flex items-center gap-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`px-2 py-0.5 text-xs rounded font-medium ${
              editor.isActive('bold') ? 'bg-gray-200' : 'hover:bg-gray-100'
            }`}
          >
            B
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`px-2 py-0.5 text-xs rounded italic ${
              editor.isActive('italic') ? 'bg-gray-200' : 'hover:bg-gray-100'
            }`}
          >
            I
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`px-2 py-0.5 text-xs rounded ${
              editor.isActive('bulletList') ? 'bg-gray-200' : 'hover:bg-gray-100'
            }`}
          >
            • List
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`px-2 py-0.5 text-xs rounded ${
              editor.isActive('orderedList') ? 'bg-gray-200' : 'hover:bg-gray-100'
            }`}
          >
            1. List
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`px-2 py-0.5 text-xs rounded ${
              editor.isActive('heading', { level: 2 }) ? 'bg-gray-200' : 'hover:bg-gray-100'
            }`}
          >
            H2
          </button>
        </div>
      )}
      <EditorContent editor={editor} />
    </div>
  )
}
