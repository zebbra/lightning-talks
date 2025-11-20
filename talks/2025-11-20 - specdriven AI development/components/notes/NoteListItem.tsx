'use client'

import React, { memo } from 'react'
import { NoteWithTags } from '@/types'
import { formatRelativeTime, getPreview } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface NoteListItemProps {
  note: NoteWithTags
  isSelected: boolean
  onClick: () => void
}

export const NoteListItem = memo(function NoteListItem({ note, isSelected, onClick }: NoteListItemProps) {
  const preview = getPreview(note.content, 80)
  const displayTitle = note.title || preview || 'Untitled Note'
  
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left p-4 rounded-2xl transition-all duration-200',
        'hover:glass hover:shadow-md',
        isSelected && 'glass shadow-lg ring-2 ring-purple-500/50'
      )}
    >
      <div className="flex flex-col gap-2">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate text-base">
          {displayTitle}
        </h3>
        {note.title && (
          <p className="text-sm text-gray-600 dark:text-gray-400 truncate line-clamp-2">
            {preview}
          </p>
        )}
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {formatRelativeTime(note.updatedAt)}
          </span>
          {note.noteTags.length > 0 && (
            <div className="flex gap-1.5 flex-wrap">
              {note.noteTags.slice(0, 3).map(({ tag }) => (
                <span
                  key={tag.id}
                  className="inline-block px-2.5 py-1 text-xs rounded-full font-medium backdrop-blur-sm"
                  style={{
                    backgroundColor: tag.color + '25',
                    color: tag.color,
                    border: `1px solid ${tag.color}40`
                  }}
                >
                  {tag.name}
                </span>
              ))}
              {note.noteTags.length > 3 && (
                <span className="text-xs text-gray-400 px-2 py-1">
                  +{note.noteTags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </button>
  )
})
