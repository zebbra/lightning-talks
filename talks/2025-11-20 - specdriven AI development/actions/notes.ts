'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { createNoteSchema, updateNoteSchema, deleteSchema } from '@/lib/validations'
import { ActionResponse, NoteWithTags } from '@/types'
import { Note } from '@prisma/client'

/**
 * Create a new note with optional title, content, and tags
 */
export async function createNote(data: unknown): Promise<ActionResponse<NoteWithTags>> {
  try {
    const validated = createNoteSchema.parse(data)
    
    const note = await prisma.note.create({
      data: {
        title: validated.title,
        content: validated.content,
        noteTags: validated.tagIds ? {
          create: validated.tagIds.map(tagId => ({ tagId }))
        } : undefined
      },
      include: {
        noteTags: {
          include: { tag: true }
        }
      }
    })
    
    revalidatePath('/notes')
    return { success: true, data: note }
  } catch (error) {
    console.error('Failed to create note:', error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Failed to create note' }
  }
}

/**
 * Get all notes with tags, sorted by creation date (newest first)
 */
export async function getNotes(filters?: {
  tagIds?: string[]
  dateFrom?: Date
  dateTo?: Date
}): Promise<ActionResponse<NoteWithTags[]>> {
  try {
    const where: any = {}
    
    // Filter by tags (OR logic)
    if (filters?.tagIds && filters.tagIds.length > 0) {
      where.noteTags = {
        some: {
          tagId: {
            in: filters.tagIds
          }
        }
      }
    }
    
    // Filter by date range
    if (filters?.dateFrom || filters?.dateTo) {
      where.createdAt = {}
      if (filters.dateFrom) {
        where.createdAt.gte = filters.dateFrom
      }
      if (filters.dateTo) {
        where.createdAt.lt = filters.dateTo
      }
    }
    
    const notes = await prisma.note.findMany({
      where,
      include: {
        noteTags: {
          include: { tag: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    return { success: true, data: notes }
  } catch (error) {
    console.error('Failed to fetch notes:', error)
    return { success: false, error: 'Failed to fetch notes' }
  }
}

/**
 * Get a single note by ID with tags
 */
export async function getNoteById(id: string): Promise<ActionResponse<NoteWithTags>> {
  try {
    const note = await prisma.note.findUnique({
      where: { id },
      include: {
        noteTags: {
          include: { tag: true }
        }
      }
    })
    
    if (!note) {
      return { success: false, error: 'Note not found' }
    }
    
    return { success: true, data: note }
  } catch (error) {
    console.error('Failed to fetch note:', error)
    return { success: false, error: 'Failed to fetch note' }
  }
}

/**
 * Update note title and/or content
 */
export async function updateNote(id: string, data: unknown): Promise<ActionResponse<NoteWithTags>> {
  try {
    const validated = updateNoteSchema.parse(data)
    
    const updateData: any = {}
    if (validated.title !== undefined) updateData.title = validated.title
    if (validated.content !== undefined) updateData.content = validated.content
    
    const note = await prisma.note.update({
      where: { id },
      data: updateData,
      include: {
        noteTags: {
          include: { tag: true }
        }
      }
    })
    
    revalidatePath('/notes')
    return { success: true, data: note }
  } catch (error) {
    console.error('Failed to update note:', error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Failed to update note' }
  }
}

/**
 * Delete a note and all its tag associations
 */
export async function deleteNote(id: string): Promise<ActionResponse<Note>> {
  try {
    const validated = deleteSchema.parse({ id })
    
    const note = await prisma.note.delete({
      where: { id: validated.id }
    })
    
    revalidatePath('/notes')
    return { success: true, data: note }
  } catch (error) {
    console.error('Failed to delete note:', error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Failed to delete note' }
  }
}
