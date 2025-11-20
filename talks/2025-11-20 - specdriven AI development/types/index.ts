import { Note, Tag } from '@prisma/client'

// Note with populated tags
export type NoteWithTags = Note & {
  noteTags: Array<{
    noteId: string
    tagId: string
    tag: Tag
  }>
}

// Server action response type
export type ActionResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string }

// Tag assignment types
export type TagAssignment = {
  noteId: string
  tagId: string
}
