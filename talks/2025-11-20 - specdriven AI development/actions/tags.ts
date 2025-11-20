'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { createTagSchema, updateTagSchema, deleteSchema, assignTagsSchema } from '@/lib/validations'
import { ActionResponse } from '@/types'
import { Tag } from '@prisma/client'

/**
 * Create a new tag with unique name validation
 */
export async function createTag(data: unknown): Promise<ActionResponse<Tag>> {
  try {
    const validated = createTagSchema.parse(data)
    
    // Check for existing tag (case-insensitive)
    const existing = await prisma.tag.findFirst({
      where: {
        name: {
          equals: validated.name,
          mode: 'insensitive'
        }
      }
    })
    
    if (existing) {
      return { success: false, error: 'A tag with this name already exists' }
    }
    
    const tag = await prisma.tag.create({
      data: {
        name: validated.name,
        color: validated.color
      }
    })
    
    revalidatePath('/notes')
    return { success: true, data: tag }
  } catch (error) {
    console.error('Failed to create tag:', error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Failed to create tag' }
  }
}

/**
 * Get all tags sorted alphabetically
 */
export async function getTags(): Promise<ActionResponse<Tag[]>> {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: { name: 'asc' }
    })
    
    return { success: true, data: tags }
  } catch (error) {
    console.error('Failed to fetch tags:', error)
    return { success: false, error: 'Failed to fetch tags' }
  }
}

/**
 * Update tag name and/or color
 */
export async function updateTag(id: string, data: unknown): Promise<ActionResponse<Tag>> {
  try {
    const validated = updateTagSchema.parse(data)
    
    // If updating name, check for conflicts
    if (validated.name) {
      const existing = await prisma.tag.findFirst({
        where: {
          name: {
            equals: validated.name,
            mode: 'insensitive'
          },
          NOT: { id }
        }
      })
      
      if (existing) {
        return { success: false, error: 'A tag with this name already exists' }
      }
    }
    
    const updateData: any = {}
    if (validated.name !== undefined) updateData.name = validated.name
    if (validated.color !== undefined) updateData.color = validated.color
    
    const tag = await prisma.tag.update({
      where: { id },
      data: updateData
    })
    
    revalidatePath('/notes')
    return { success: true, data: tag }
  } catch (error) {
    console.error('Failed to update tag:', error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Failed to update tag' }
  }
}

/**
 * Delete a tag and all its note associations
 */
export async function deleteTag(id: string): Promise<ActionResponse<{ tag: Tag; count: number }>> {
  try {
    const validated = deleteSchema.parse({ id })
    
    // Count affected notes
    const count = await prisma.noteTag.count({
      where: { tagId: validated.id }
    })
    
    const tag = await prisma.tag.delete({
      where: { id: validated.id }
    })
    
    revalidatePath('/notes')
    return { success: true, data: { tag, count } }
  } catch (error) {
    console.error('Failed to delete tag:', error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Failed to delete tag' }
  }
}

/**
 * Assign tags to a note (idempotent - won't create duplicates)
 */
export async function assignTagsToNote(data: unknown): Promise<ActionResponse<void>> {
  try {
    const validated = assignTagsSchema.parse(data)
    
    // Use createMany with skipDuplicates for idempotent behavior
    await prisma.noteTag.createMany({
      data: validated.tagIds.map(tagId => ({
        noteId: validated.noteId,
        tagId
      })),
      skipDuplicates: true
    })
    
    revalidatePath('/notes')
    return { success: true, data: undefined }
  } catch (error) {
    console.error('Failed to assign tags:', error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Failed to assign tags' }
  }
}

/**
 * Remove specific tags from a note
 */
export async function removeTagsFromNote(noteId: string, tagIds: string[]): Promise<ActionResponse<void>> {
  try {
    await prisma.noteTag.deleteMany({
      where: {
        noteId,
        tagId: { in: tagIds }
      }
    })
    
    revalidatePath('/notes')
    return { success: true, data: undefined }
  } catch (error) {
    console.error('Failed to remove tags:', error)
    return { success: false, error: 'Failed to remove tags' }
  }
}

/**
 * Replace all tags on a note
 */
export async function replaceNoteTags(noteId: string, tagIds: string[]): Promise<ActionResponse<void>> {
  try {
    await prisma.noteTag.deleteMany({
      where: { noteId }
    })
    
    if (tagIds.length > 0) {
      await prisma.noteTag.createMany({
        data: tagIds.map(tagId => ({ noteId, tagId }))
      })
    }
    
    revalidatePath('/notes')
    return { success: true, data: undefined }
  } catch (error) {
    console.error('Failed to replace tags:', error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Failed to replace tags' }
  }
}
