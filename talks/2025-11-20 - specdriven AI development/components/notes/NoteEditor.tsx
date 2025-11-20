'use client'

import React, { useEffect, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { NoteWithTags } from '@/types'
import { Tag } from '@prisma/client'
import { Button } from '@/components/ui/Button'
import { updateNote, deleteNote } from '@/actions/notes'
import { replaceNoteTags } from '@/actions/tags'

interface NoteEditorProps {
  note: NoteWithTags | null
  tags: Tag[]
  onNoteUpdated: () => void
  onNoteDeleted: () => void
}

export function NoteEditor({ note, tags, onNoteUpdated, onNoteDeleted }: NoteEditorProps) {
  const [title, setTitle] = useState('')
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [charCount, setCharCount] = useState(0)
  const [showMarkdownSource, setShowMarkdownSource] = useState(false)
  const [markdownSource, setMarkdownSource] = useState('')
  
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder: 'Start typing your note...',
      }),
    ],
    content: note?.content || '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[500px] p-4',
      },
    },
    onUpdate: ({ editor }) => {
      const text = editor.getText()
      setCharCount(text.length)
      handleAutoSave()
    },
  })
  
  // Update editor when note changes
  useEffect(() => {
    if (note) {
      setTitle(note.title || '')
      setSelectedTagIds(note.noteTags.map(nt => nt.tagId))
      setCharCount(note.content.length)
      editor?.commands.setContent(note.content)
    } else {
      setTitle('')
      setSelectedTagIds([])
      setCharCount(0)
      editor?.commands.setContent('')
    }
  }, [note?.id])
  
  // Auto-save with debounce
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null)
  
  const handleAutoSave = () => {
    if (!note || !editor) return
    
    if (saveTimeout) clearTimeout(saveTimeout)
    
    const timeout = setTimeout(async () => {
      setIsSaving(true)
      const content = editor.getHTML()
      await updateNote(note.id, { title: title || null, content })
      setIsSaving(false)
      onNoteUpdated()
    }, 2000)
    
    setSaveTimeout(timeout)
  }
  
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value
    setTitle(newTitle)
    
    // Trigger autosave with the new title
    if (!note || !editor) return
    
    if (saveTimeout) clearTimeout(saveTimeout)
    
    const timeout = setTimeout(async () => {
      setIsSaving(true)
      const content = editor.getHTML()
      await updateNote(note.id, { title: newTitle || null, content })
      setIsSaving(false)
      onNoteUpdated()
    }, 2000)
    
    setSaveTimeout(timeout)
  }
  
  const handleTagToggle = async (tagId: string) => {
    if (!note) return
    
    const newTags = selectedTagIds.includes(tagId)
      ? selectedTagIds.filter(id => id !== tagId)
      : [...selectedTagIds, tagId]
    
    setSelectedTagIds(newTags)
    await replaceNoteTags(note.id, newTags)
    onNoteUpdated()
  }
  
  const handleDelete = async () => {
    if (!note) return
    
    await deleteNote(note.id)
    setShowDeleteConfirm(false)
    onNoteDeleted()
  }
  
  const toggleMarkdownView = () => {
    if (!editor) return
    
    if (!showMarkdownSource) {
      // Switch to HTML source view
      const html = editor.getHTML()
      setMarkdownSource(html)
    } else {
      // Switch back to editor view
      editor.commands.setContent(markdownSource)
    }
    setShowMarkdownSource(!showMarkdownSource)
  }
  
  const handleMarkdownChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMarkdownSource(e.target.value)
    // Trigger autosave when editing HTML source
    if (!note || !editor) return
    
    if (saveTimeout) clearTimeout(saveTimeout)
    
    const timeout = setTimeout(async () => {
      setIsSaving(true)
      // Update editor content with the HTML source
      editor.commands.setContent(e.target.value)
      await updateNote(note.id, { title: title || null, content: e.target.value })
      setIsSaving(false)
      onNoteUpdated()
    }, 2000)
    
    setSaveTimeout(timeout)
  }
  
  if (!note) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        <p>Select a note or create a new one</p>
      </div>
    )
  }
  
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 pb-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-6">
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            placeholder="Untitled Note"
            className="text-3xl font-bold w-full focus:outline-none bg-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent placeholder:text-gray-400"
          />
          <div className="flex items-center gap-3 ml-4">
            {isSaving && (
              <span className="text-sm text-gray-500 flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                Saving...
              </span>
            )}
            <Button
              variant="secondary"
              size="sm"
              onClick={toggleMarkdownView}
              className="glass border-0"
            >
              {showMarkdownSource ? '📝 Editor' : '💻 HTML'}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              className="glass border-0 text-red-600 hover:text-red-700"
            >
              🗑️ Delete
            </Button>
          </div>
        </div>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-3 mt-2">
          {tags.map(tag => {
            const isSelected = selectedTagIds.includes(tag.id)
            return (
              <button
                key={tag.id}
                onClick={() => handleTagToggle(tag.id)}
                className={`px-4 py-2 text-sm rounded-xl transition-all backdrop-blur-sm font-medium ${
                  isSelected
                    ? 'ring-2 ring-offset-2 scale-105 shadow-lg'
                    : 'opacity-60 hover:opacity-100'
                }`}
                style={{
                  backgroundColor: tag.color + '20',
                  color: tag.color,
                  ...(isSelected && { boxShadow: `0 0 0 2px ${tag.color}` })
                }}
              >
                {tag.name}
              </button>
            )
          })}
        </div>
      </div>
      
      {/* Editor */}
      <div className="flex-1 overflow-y-auto">
        {showMarkdownSource ? (
          <textarea
            value={markdownSource}
            onChange={handleMarkdownChange}
            className="w-full h-full p-6 font-mono text-sm focus:outline-none resize-none bg-transparent text-gray-900 dark:text-gray-100"
            placeholder="HTML source..."
          />
        ) : (
          <EditorContent editor={editor} />
        )}
      </div>
      
      {/* Footer */}
      <div className="border-t border-white/10 px-6 py-3 text-sm text-gray-500 flex items-center justify-between">
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          Connected
        </span>
        <span>{charCount} / 50,000 characters</span>
      </div>
      
      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass rounded-2xl p-6 max-w-sm shadow-2xl border border-white/20">
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">Delete Note?</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              This action cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDelete}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
