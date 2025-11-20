'use client'

import React from 'react'
import { NoteWithTags } from '@/types'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { NoteListItem } from './NoteListItem'

interface NotesListProps {
  notes: NoteWithTags[]
  selectedNoteId: string | null
  onSelectNote: (note: NoteWithTags) => void
  onNewNote: () => void
}

export function NotesList({ notes, selectedNoteId, onSelectNote, onNewNote }: NotesListProps) {
  if (notes.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-6">
          <Button onClick={onNewNote} className="w-full">
            <span className="text-lg mr-2">+</span> New Note
          </Button>
        </div>
        <EmptyState
          title="No notes yet"
          description="Create your first note to get started"
          action={
            <Button onClick={onNewNote} size="sm">
              Create Note
            </Button>
          }
        />
      </div>
    )
  }
  
  return (
    <div className="h-full flex flex-col">
      <div className="p-6 pb-4">
        <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Notes
        </h2>
        <Button onClick={onNewNote} className="w-full">
          <span className="text-lg mr-2">+</span> New Note
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto px-3 space-y-2">
        {notes.map(note => (
          <NoteListItem
            key={note.id}
            note={note}
            isSelected={note.id === selectedNoteId}
            onClick={() => onSelectNote(note)}
          />
        ))}
      </div>
    </div>
  )
}
