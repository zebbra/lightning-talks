'use client'

import React, { useState, useEffect } from 'react'
import { NoteWithTags } from '@/types'
import { Tag } from '@prisma/client'
import { ThreePanelLayout } from './layout/ThreePanelLayout'
import { CalendarWidget } from './calendar/CalendarWidget'
import { TagFilter } from './tags/TagFilter'
import { TagManager } from './tags/TagManager'
import { NotesList } from './notes/NotesList'
import { NoteEditor } from './notes/NoteEditor'
import { createNote, getNotes } from '@/actions/notes'
import { getTags } from '@/actions/tags'
import { getStartOfDay, getEndOfDay } from '@/lib/utils'
import { useToast, ToastContainer } from './ui/Toast'
import { ErrorBoundary } from './ui/ErrorBoundary'
import { useKeyboardShortcuts } from '@/lib/hooks/useKeyboardShortcuts'

interface NotesClientProps {
  initialNotes: NoteWithTags[]
  initialTags: Tag[]
}

export function NotesClient({ initialNotes, initialTags }: NotesClientProps) {
  const [notes, setNotes] = useState<NoteWithTags[]>(initialNotes)
  const [tags, setTags] = useState<Tag[]>(initialTags)
  const [selectedNote, setSelectedNote] = useState<NoteWithTags | null>(null)
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [filteredNotes, setFilteredNotes] = useState<NoteWithTags[]>(initialNotes)
  const { toasts, removeToast, success, error } = useToast()
  
  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 'n',
      metaKey: true,
      callback: () => handleNewNote(),
      description: 'Create new note'
    },
    {
      key: 'Escape',
      callback: () => setSelectedNote(null),
      description: 'Deselect note'
    }
  ])
  
  // Apply filters
  useEffect(() => {
    let filtered = notes
    
    // Filter by tags (OR logic)
    if (selectedTagIds.length > 0) {
      filtered = filtered.filter(note =>
        note.noteTags.some(nt => selectedTagIds.includes(nt.tagId))
      )
    }
    
    // Filter by date
    if (selectedDate) {
      const start = getStartOfDay(selectedDate)
      const end = getEndOfDay(selectedDate)
      filtered = filtered.filter(note => {
        const noteDate = new Date(note.createdAt)
        return noteDate >= start && noteDate <= end
      })
    }
    
    setFilteredNotes(filtered)
  }, [notes, selectedTagIds, selectedDate])
  
  const handleNewNote = async () => {
    try {
      const result = await createNote({
        content: '',
        title: null
      })
      
      if (result.success) {
        await refreshNotes()
        setSelectedNote(result.data)
        success('Note created successfully')
      } else {
        error(result.error || 'Failed to create note')
      }
    } catch (err) {
      error('An unexpected error occurred')
    }
  }
  
  const handleSelectNote = (note: NoteWithTags) => {
    setSelectedNote(note)
  }
  
  const handleToggleTag = (tagId: string) => {
    setSelectedTagIds(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    )
  }
  
  const handleClearTagFilters = () => {
    setSelectedTagIds([])
  }
  
  const refreshNotes = async () => {
    const result = await getNotes()
    if (result.success) {
      setNotes(result.data)
      // Update selected note if it exists
      if (selectedNote) {
        const updated = result.data.find(n => n.id === selectedNote.id)
        if (updated) {
          setSelectedNote(updated)
        }
      }
    }
  }
  
  const refreshTags = async () => {
    const result = await getTags()
    if (result.success) {
      setTags(result.data)
    }
  }
  
  const handleNoteDeleted = () => {
    setSelectedNote(null)
    refreshNotes()
    success('Note deleted successfully')
  }
  
  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <ErrorBoundary>
        <ThreePanelLayout
      leftPanel={
        <div>
          <CalendarWidget
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
          <TagFilter
            tags={tags}
            selectedTagIds={selectedTagIds}
            onToggleTag={handleToggleTag}
            onClearFilters={handleClearTagFilters}
          />
          <TagManager
            tags={tags}
            onTagsUpdated={() => {
              refreshTags()
              refreshNotes()
            }}
          />
        </div>
      }
      centerPanel={
        <NotesList
          notes={filteredNotes}
          selectedNoteId={selectedNote?.id || null}
          onSelectNote={handleSelectNote}
          onNewNote={handleNewNote}
        />
      }
      rightPanel={
        <NoteEditor
          note={selectedNote}
          tags={tags}
          onNoteUpdated={refreshNotes}
          onNoteDeleted={handleNoteDeleted}
        />
      }
    />
      </ErrorBoundary>
    </>
  )
}
