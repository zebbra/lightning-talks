import { z } from 'zod'

// Note validation schemas
export const createNoteSchema = z.object({
  title: z.string().max(500).optional().nullable(),
  content: z.string().max(50000, "Content cannot exceed 50,000 characters").optional().default(''),
  tagIds: z.array(z.string()).optional()
})

export const updateNoteSchema = z.object({
  title: z.string().max(500).optional().nullable(),
  content: z.string().max(50000, "Content cannot exceed 50,000 characters").optional()
}).refine(data => data.title !== undefined || data.content !== undefined, {
  message: "At least one field (title or content) must be provided"
})

export const deleteSchema = z.object({
  id: z.string().cuid("Invalid ID format")
})

// Tag validation schemas
export const createTagSchema = z.object({
  name: z.string()
    .min(1, "Tag name is required")
    .max(50, "Tag name cannot exceed 50 characters")
    .regex(/^[a-zA-Z0-9\s\-_]+$/, "Tag name can only contain letters, numbers, spaces, hyphens, and underscores")
    .transform(val => val.trim()),
  color: z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid HEX code (e.g., #3B82F6)")
})

export const updateTagSchema = z.object({
  name: z.string()
    .min(1, "Tag name is required")
    .max(50, "Tag name cannot exceed 50 characters")
    .regex(/^[a-zA-Z0-9\s\-_]+$/, "Tag name can only contain letters, numbers, spaces, hyphens, and underscores")
    .transform(val => val.trim())
    .optional(),
  color: z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid HEX code (e.g., #3B82F6)")
    .optional()
}).refine(data => data.name !== undefined || data.color !== undefined, {
  message: "At least one field (name or color) must be provided"
})

export const assignTagsSchema = z.object({
  noteId: z.string().cuid("Invalid note ID"),
  tagIds: z.array(z.string().cuid("Invalid tag ID"))
})
