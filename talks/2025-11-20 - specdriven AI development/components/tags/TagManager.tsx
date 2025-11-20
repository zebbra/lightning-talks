'use client'

import React, { useState } from 'react'
import { Tag } from '@prisma/client'
import { Button } from '@/components/ui/Button'
import { createTag, updateTag, deleteTag } from '@/actions/tags'

const PRESET_COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
]

interface TagManagerProps {
  tags: Tag[]
  onTagsUpdated: () => void
}

export function TagManager({ tags, onTagsUpdated }: TagManagerProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [color, setColor] = useState(PRESET_COLORS[0])
  const [error, setError] = useState('')
  
  const handleCreate = async () => {
    setError('')
    const result = await createTag({ name, color })
    
    if (result.success) {
      setName('')
      setColor(PRESET_COLORS[0])
      setIsCreating(false)
      onTagsUpdated()
    } else {
      setError(result.error)
    }
  }
  
  const handleUpdate = async (id: string) => {
    setError('')
    const result = await updateTag(id, { name, color })
    
    if (result.success) {
      setEditingId(null)
      setName('')
      setColor(PRESET_COLORS[0])
      onTagsUpdated()
    } else {
      setError(result.error)
    }
  }
  
  const handleDelete = async (id: string) => {
    if (confirm('Delete this tag? It will be removed from all notes.')) {
      await deleteTag(id)
      onTagsUpdated()
    }
  }
  
  const startEdit = (tag: Tag) => {
    setEditingId(tag.id)
    setName(tag.name)
    setColor(tag.color)
    setError('')
  }
  
  const cancelEdit = () => {
    setEditingId(null)
    setIsCreating(false)
    setName('')
    setColor(PRESET_COLORS[0])
    setError('')
  }
  
  return (
    <div className="p-4 border-t border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">Manage Tags</h3>
        {!isCreating && !editingId && (
          <Button
            size="sm"
            onClick={() => setIsCreating(true)}
          >
            + Tag
          </Button>
        )}
      </div>
      
      {error && (
        <div className="mb-2 p-2 bg-red-50 text-red-600 text-sm rounded">
          {error}
        </div>
      )}
      
      {/* Create Form */}
      {isCreating && (
        <div className="mb-3 p-3 bg-gray-50 rounded space-y-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tag name"
            className="w-full px-3 py-2 border border-gray-300 rounded"
          />
          <div className="flex gap-2 flex-wrap">
            {PRESET_COLORS.map(c => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-8 h-8 rounded-full ${color === c ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleCreate} className="flex-1">
              Create
            </Button>
            <Button size="sm" variant="secondary" onClick={cancelEdit}>
              Cancel
            </Button>
          </div>
        </div>
      )}
      
      {/* Tag List */}
      <div className="space-y-2">
        {tags.map(tag => (
          <div key={tag.id}>
            {editingId === tag.id ? (
              <div className="p-3 bg-gray-50 rounded space-y-2">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
                <div className="flex gap-2 flex-wrap">
                  {PRESET_COLORS.map(c => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className={`w-8 h-8 rounded-full ${color === c ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleUpdate(tag.id)} className="flex-1">
                    Save
                  </Button>
                  <Button size="sm" variant="secondary" onClick={cancelEdit}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span
                  className="flex-1 px-3 py-2 text-sm rounded"
                  style={{
                    backgroundColor: tag.color + '20',
                    color: tag.color
                  }}
                >
                  {tag.name}
                </span>
                <button
                  onClick={() => startEdit(tag)}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(tag.id)}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
