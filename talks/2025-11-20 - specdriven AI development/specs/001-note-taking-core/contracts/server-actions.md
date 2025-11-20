# Server Actions API Contracts

**Feature**: EasyNotes Core Note-Taking Platform  
**Date**: 2025-11-20  
**Architecture**: Next.js 15 Server Actions (No REST API)

## Overview

This document defines the contract specifications for all server actions in EasyNotes. Server actions replace traditional REST API endpoints and provide type-safe, direct server-client communication.

---

## General Conventions

### Response Format

All server actions return a discriminated union type for consistent error handling:

```typescript
type ActionResponse<T> = 
  | { success: true; data: T }
  | { success: false; error: string }
```

### Error Handling

- **Validation Errors**: Return `{ success: false, error: "Validation message" }`
- **Database Errors**: Log to console, return generic error to client
- **Authorization Errors**: N/A (no auth in this version)

### Input Validation

All inputs validated with Zod schemas before processing.

---

## Note Actions

### 1. createNote

Create a new note with optional title and content.

**Function Signature**:
```typescript
async function createNote(
  data: CreateNoteInput
): Promise<ActionResponse<Note>>
```

**Input Type**:
```typescript
type CreateNoteInput = {
  title?: string | null
  content: string
  tagIds?: string[]  // Optional: Assign tags during creation
}
```

**Validation Schema (Zod)**:
```typescript
const createNoteSchema = z.object({
  title: z.string().max(500).optional().nullable(),
  content: z.string().min(1).max(50000),
  tagIds: z.array(z.string()).optional()
})
```

**Success Response**:
```typescript
{
  success: true,
  data: {
    id: "clx1234567890",
    title: "My Note" | null,
    content: "Note content here",
    createdAt: "2025-11-20T10:30:00.000Z",
    updatedAt: "2025-11-20T10:30:00.000Z",
    noteTags: [
      {
        noteId: "clx1234567890",
        tagId: "clx0987654321",
        tag: {
          id: "clx0987654321",
          name: "Work",
          color: "#3B82F6"
        }
      }
    ]
  }
}
```

**Error Response Examples**:
```typescript
// Validation error
{ success: false, error: "Content is required" }
{ success: false, error: "Content cannot exceed 50,000 characters" }

// Database error
{ success: false, error: "Failed to create note" }
```

**Behavior**:
- Creates note in database with current timestamp
- If `tagIds` provided, creates NoteTag associations
- Calls `revalidatePath('/notes')` to update UI
- Returns created note with associated tags

---

### 2. updateNote

Update existing note's title, content, or both.

**Function Signature**:
```typescript
async function updateNote(
  id: string,
  data: UpdateNoteInput
): Promise<ActionResponse<Note>>
```

**Input Type**:
```typescript
type UpdateNoteInput = {
  title?: string | null
  content?: string
}
```

**Validation Schema (Zod)**:
```typescript
const updateNoteSchema = z.object({
  id: z.string().cuid(),
  title: z.string().max(500).optional().nullable(),
  content: z.string().min(1).max(50000).optional()
}).refine(data => data.title !== undefined || data.content !== undefined, {
  message: "At least one field (title or content) must be provided"
})
```

**Success Response**:
```typescript
{
  success: true,
  data: {
    id: "clx1234567890",
    title: "Updated Title",
    content: "Updated content",
    createdAt: "2025-11-20T10:30:00.000Z",
    updatedAt: "2025-11-20T11:45:00.000Z",  // Updated timestamp
    noteTags: [...]
  }
}
```

**Error Response Examples**:
```typescript
{ success: false, error: "Note not found" }
{ success: false, error: "Content cannot be empty" }
{ success: false, error: "Failed to update note" }
```

**Behavior**:
- Updates only provided fields
- Automatically updates `updatedAt` timestamp
- Calls `revalidatePath('/notes')`
- Returns updated note with tags

---

### 3. deleteNote

Permanently delete a note and all tag associations.

**Function Signature**:
```typescript
async function deleteNote(
  id: string
): Promise<ActionResponse<{ id: string }>>
```

**Input Type**:
```typescript
type DeleteNoteInput = {
  id: string
}
```

**Validation Schema (Zod)**:
```typescript
const deleteNoteSchema = z.object({
  id: z.string().cuid()
})
```

**Success Response**:
```typescript
{
  success: true,
  data: { id: "clx1234567890" }
}
```

**Error Response Examples**:
```typescript
{ success: false, error: "Note not found" }
{ success: false, error: "Failed to delete note" }
```

**Behavior**:
- Deletes note from database
- Cascade deletes all NoteTag associations
- Calls `revalidatePath('/notes')`
- No undo/trash functionality in v1

---

### 4. getNotes

Retrieve notes with optional filtering by tags or date range.

**Function Signature**:
```typescript
async function getNotes(
  filters?: GetNotesFilters
): Promise<ActionResponse<Note[]>>
```

**Input Type**:
```typescript
type GetNotesFilters = {
  tagIds?: string[]        // Filter by tags (OR logic)
  dateFrom?: string        // ISO 8601 date string
  dateTo?: string          // ISO 8601 date string
  limit?: number           // Pagination limit
  offset?: number          // Pagination offset
}
```

**Validation Schema (Zod)**:
```typescript
const getNotesSchema = z.object({
  tagIds: z.array(z.string().cuid()).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0)
})
```

**Success Response**:
```typescript
{
  success: true,
  data: [
    {
      id: "clx1234567890",
      title: "Note 1",
      content: "Content here",
      createdAt: "2025-11-20T10:30:00.000Z",
      updatedAt: "2025-11-20T10:30:00.000Z",
      noteTags: [
        {
          noteId: "clx1234567890",
          tagId: "clx0987654321",
          tag: {
            id: "clx0987654321",
            name: "Work",
            color: "#3B82F6"
          }
        }
      ]
    },
    // ... more notes
  ]
}
```

**Error Response Examples**:
```typescript
{ success: false, error: "Invalid date format" }
{ success: false, error: "Failed to fetch notes" }
```

**Behavior**:
- Returns notes sorted by `createdAt` DESC (newest first)
- If `tagIds` provided, filters notes with ANY of those tags (OR logic)
- If `dateFrom`/`dateTo` provided, filters by creation date range
- Includes associated tags in response
- Default limit: 50 notes

---

### 5. getNoteById

Retrieve a single note by ID.

**Function Signature**:
```typescript
async function getNoteById(
  id: string
): Promise<ActionResponse<Note>>
```

**Input Type**:
```typescript
type GetNoteByIdInput = {
  id: string
}
```

**Validation Schema (Zod)**:
```typescript
const getNoteByIdSchema = z.object({
  id: z.string().cuid()
})
```

**Success Response**:
```typescript
{
  success: true,
  data: {
    id: "clx1234567890",
    title: "My Note",
    content: "Content here",
    createdAt: "2025-11-20T10:30:00.000Z",
    updatedAt: "2025-11-20T10:30:00.000Z",
    noteTags: [...]
  }
}
```

**Error Response Examples**:
```typescript
{ success: false, error: "Note not found" }
```

**Behavior**:
- Returns single note with tags
- Used for opening note in editor

---

## Tag Actions

### 6. createTag

Create a new tag with name and color.

**Function Signature**:
```typescript
async function createTag(
  data: CreateTagInput
): Promise<ActionResponse<Tag>>
```

**Input Type**:
```typescript
type CreateTagInput = {
  name: string
  color: string  // HEX format: #RRGGBB
}
```

**Validation Schema (Zod)**:
```typescript
const createTagSchema = z.object({
  name: z.string()
    .min(1, "Tag name is required")
    .max(50, "Tag name too long")
    .regex(/^[a-zA-Z0-9\s\-_]+$/, "Invalid characters in tag name"),
  color: z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format. Use #RRGGBB")
})
```

**Success Response**:
```typescript
{
  success: true,
  data: {
    id: "clx0987654321",
    name: "Work",
    color: "#3B82F6",
    noteTags: []
  }
}
```

**Error Response Examples**:
```typescript
{ success: false, error: "Tag name already exists" }
{ success: false, error: "Invalid color format. Use #RRGGBB" }
{ success: false, error: "Tag name is required" }
```

**Behavior**:
- Checks for duplicate name (case-insensitive) before creation
- Trims whitespace from name
- Validates HEX color format
- Calls `revalidatePath('/notes')`

---

### 7. updateTag

Update tag's name or color.

**Function Signature**:
```typescript
async function updateTag(
  id: string,
  data: UpdateTagInput
): Promise<ActionResponse<Tag>>
```

**Input Type**:
```typescript
type UpdateTagInput = {
  name?: string
  color?: string
}
```

**Validation Schema (Zod)**:
```typescript
const updateTagSchema = z.object({
  id: z.string().cuid(),
  name: z.string()
    .min(1)
    .max(50)
    .regex(/^[a-zA-Z0-9\s\-_]+$/)
    .optional(),
  color: z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional()
}).refine(data => data.name !== undefined || data.color !== undefined, {
  message: "At least one field (name or color) must be provided"
})
```

**Success Response**:
```typescript
{
  success: true,
  data: {
    id: "clx0987654321",
    name: "Work Projects",  // Updated
    color: "#3B82F6",
    noteTags: [...]
  }
}
```

**Error Response Examples**:
```typescript
{ success: false, error: "Tag not found" }
{ success: false, error: "Tag name already exists" }
{ success: false, error: "Invalid color format" }
```

**Behavior**:
- Updates only provided fields
- Checks for duplicate name if name is updated
- Calls `revalidatePath('/notes')`
- All notes with this tag see updated name/color

---

### 8. deleteTag

Delete a tag and remove all note associations.

**Function Signature**:
```typescript
async function deleteTag(
  id: string
): Promise<ActionResponse<{ id: string; removedFrom: number }>>
```

**Input Type**:
```typescript
type DeleteTagInput = {
  id: string
}
```

**Validation Schema (Zod)**:
```typescript
const deleteTagSchema = z.object({
  id: z.string().cuid()
})
```

**Success Response**:
```typescript
{
  success: true,
  data: {
    id: "clx0987654321",
    removedFrom: 15  // Number of notes that had this tag
  }
}
```

**Error Response Examples**:
```typescript
{ success: false, error: "Tag not found" }
{ success: false, error: "Failed to delete tag" }
```

**Behavior**:
- Counts number of note associations before deletion
- Cascade deletes all NoteTag records
- Calls `revalidatePath('/notes')`
- Notes remain in database (only tag association removed)

---

### 9. getTags

Retrieve all tags.

**Function Signature**:
```typescript
async function getTags(): Promise<ActionResponse<Tag[]>>
```

**Input Type**:
```typescript
// No input parameters
```

**Success Response**:
```typescript
{
  success: true,
  data: [
    {
      id: "clx0987654321",
      name: "Work",
      color: "#3B82F6",
      noteTags: [...]  // Optionally include note count
    },
    {
      id: "clx1111111111",
      name: "Personal",
      color: "#EF4444",
      noteTags: [...]
    }
  ]
}
```

**Error Response Examples**:
```typescript
{ success: false, error: "Failed to fetch tags" }
```

**Behavior**:
- Returns all tags sorted alphabetically by name
- Can include note count for each tag
- Used to populate tag filter UI

---

### 10. assignTagsToNote

Assign one or more tags to a note.

**Function Signature**:
```typescript
async function assignTagsToNote(
  noteId: string,
  tagIds: string[]
): Promise<ActionResponse<Note>>
```

**Input Type**:
```typescript
type AssignTagsInput = {
  noteId: string
  tagIds: string[]
}
```

**Validation Schema (Zod)**:
```typescript
const assignTagsSchema = z.object({
  noteId: z.string().cuid(),
  tagIds: z.array(z.string().cuid()).min(1, "At least one tag required")
})
```

**Success Response**:
```typescript
{
  success: true,
  data: {
    id: "clx1234567890",
    title: "My Note",
    content: "Content",
    createdAt: "...",
    updatedAt: "...",  // Updated timestamp
    noteTags: [
      // Includes newly assigned tags
      { noteId: "...", tagId: "...", tag: {...} }
    ]
  }
}
```

**Error Response Examples**:
```typescript
{ success: false, error: "Note not found" }
{ success: false, error: "One or more tags not found" }
{ success: false, error: "Failed to assign tags" }
```

**Behavior**:
- Creates NoteTag records for each tag
- Skips tags already assigned (idempotent)
- Updates note's `updatedAt` timestamp
- Calls `revalidatePath('/notes')`

---

### 11. removeTagsFromNote

Remove one or more tags from a note.

**Function Signature**:
```typescript
async function removeTagsFromNote(
  noteId: string,
  tagIds: string[]
): Promise<ActionResponse<Note>>
```

**Input Type**:
```typescript
type RemoveTagsInput = {
  noteId: string
  tagIds: string[]
}
```

**Validation Schema (Zod)**:
```typescript
const removeTagsSchema = z.object({
  noteId: z.string().cuid(),
  tagIds: z.array(z.string().cuid()).min(1, "At least one tag required")
})
```

**Success Response**:
```typescript
{
  success: true,
  data: {
    id: "clx1234567890",
    title: "My Note",
    content: "Content",
    createdAt: "...",
    updatedAt: "...",  // Updated timestamp
    noteTags: [
      // Remaining tags after removal
    ]
  }
}
```

**Error Response Examples**:
```typescript
{ success: false, error: "Note not found" }
{ success: false, error: "Failed to remove tags" }
```

**Behavior**:
- Deletes NoteTag records for specified tags
- Ignores tags not currently assigned (idempotent)
- Updates note's `updatedAt` timestamp
- Calls `revalidatePath('/notes')`

---

### 12. replaceNoteTags

Replace all tags on a note with a new set (convenience method).

**Function Signature**:
```typescript
async function replaceNoteTags(
  noteId: string,
  tagIds: string[]
): Promise<ActionResponse<Note>>
```

**Input Type**:
```typescript
type ReplaceTagsInput = {
  noteId: string
  tagIds: string[]  // Can be empty to remove all tags
}
```

**Validation Schema (Zod)**:
```typescript
const replaceTagsSchema = z.object({
  noteId: z.string().cuid(),
  tagIds: z.array(z.string().cuid())
})
```

**Success Response**:
```typescript
{
  success: true,
  data: {
    id: "clx1234567890",
    title: "My Note",
    content: "Content",
    createdAt: "...",
    updatedAt: "...",
    noteTags: [
      // New tags only
    ]
  }
}
```

**Error Response Examples**:
```typescript
{ success: false, error: "Note not found" }
{ success: false, error: "One or more tags not found" }
```

**Behavior**:
- Deletes all existing NoteTag records for the note
- Creates new NoteTag records for provided tags
- More efficient than separate remove + assign calls
- Updates note's `updatedAt` timestamp
- Calls `revalidatePath('/notes')`

---

## Shared Types

### Note Type

```typescript
type Note = {
  id: string
  title: string | null
  content: string
  createdAt: Date | string  // Date object or ISO string
  updatedAt: Date | string
  noteTags: NoteTag[]
}
```

### Tag Type

```typescript
type Tag = {
  id: string
  name: string
  color: string  // HEX format: #RRGGBB
  noteTags?: NoteTag[]  // Optional in some contexts
}
```

### NoteTag Type

```typescript
type NoteTag = {
  noteId: string
  tagId: string
  note?: Note    // Optional: sometimes not included
  tag?: Tag      // Optional: usually included
}
```

---

## Performance Considerations

### Batching

Consider batching operations for better performance:

- **Create multiple notes**: Not needed (single note creation is fast)
- **Assign multiple tags**: Already supported via `tagIds` array
- **Delete multiple notes**: Could be added if bulk operations needed

### Caching Strategy

- **Next.js Automatic Caching**: Server Components cache by default
- **Revalidation**: All mutations call `revalidatePath('/notes')` to invalidate cache
- **Optimistic Updates**: Client uses React 19's `useOptimistic` for immediate UI feedback

### Rate Limiting

Not implemented in v1. Consider adding in production:
- Rate limit per IP address
- Prevent spam note creation
- Protect against abuse

---

## Summary

| Action | Purpose | Input | Output | Revalidation |
|--------|---------|-------|--------|--------------|
| `createNote` | Create new note | title?, content, tagIds? | Note | Yes |
| `updateNote` | Update note | id, title?, content? | Note | Yes |
| `deleteNote` | Delete note | id | { id } | Yes |
| `getNotes` | List notes | filters? | Note[] | No |
| `getNoteById` | Get single note | id | Note | No |
| `createTag` | Create tag | name, color | Tag | Yes |
| `updateTag` | Update tag | id, name?, color? | Tag | Yes |
| `deleteTag` | Delete tag | id | { id, removedFrom } | Yes |
| `getTags` | List all tags | - | Tag[] | No |
| `assignTagsToNote` | Add tags to note | noteId, tagIds | Note | Yes |
| `removeTagsFromNote` | Remove tags | noteId, tagIds | Note | Yes |
| `replaceNoteTags` | Replace all tags | noteId, tagIds | Note | Yes |

**Contract Status**: Complete. All server actions specified with types, validation, and behavior.
