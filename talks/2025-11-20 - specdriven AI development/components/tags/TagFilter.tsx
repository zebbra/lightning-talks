'use client'

import React from 'react'
import { Tag } from '@prisma/client'

interface TagFilterProps {
  tags: Tag[]
  selectedTagIds: string[]
  onToggleTag: (tagId: string) => void
  onClearFilters: () => void
}

export function TagFilter({ tags, selectedTagIds, onToggleTag, onClearFilters }: TagFilterProps) {
  if (tags.length === 0) {
    return (
      <div className="p-4">
        <h3 className="font-semibold mb-2">Tags</h3>
        <p className="text-sm text-gray-500">No tags yet</p>
      </div>
    )
  }
  
  return (
    <div className="p-6 pt-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          🏷️ Filter by Tags
        </h3>
        {selectedTagIds.length > 0 && (
          <button
            onClick={onClearFilters}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
            aria-label="Clear tag filters"
          >
            Clear
          </button>
        )}
      </div>
      <div className="space-y-2" role="group" aria-label="Tag filters">
        {tags.map(tag => {
          const isSelected = selectedTagIds.includes(tag.id)
          return (
            <label
              key={tag.id}
              className="flex items-center gap-3 cursor-pointer hover:glass p-3 rounded-xl transition-all"
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onToggleTag(tag.id)}
                className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 focus:ring-2"
                aria-label={`Filter by ${tag.name}`}
              />
              <span
                className="flex-1 px-3 py-1.5 text-sm rounded-lg font-medium backdrop-blur-sm"
                style={{
                  backgroundColor: tag.color + '25',
                  color: tag.color,
                  border: `1px solid ${tag.color}40`
                }}
              >
                {tag.name}
              </span>
            </label>
          )
        })}
      </div>
    </div>
  )
}
