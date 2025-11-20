# Phase 1: Data Model Design

**Feature**: EasyNotes Core Note-Taking Platform  
**Date**: 2025-11-20  
**Status**: Complete

## Overview

This document defines the complete data model for EasyNotes, including entities, relationships, validation rules, and state transitions. The model is implemented using Prisma ORM with PostgreSQL.

---

## Entity Definitions

### 1. Note

Represents a single note document with text content and metadata.

#### Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | String | Primary Key, Auto-generated (cuid) | Unique identifier for the note |
| `title` | String? | Optional, Max 500 characters | Note title (nullable - can use first line of content) |
| `content` | String | Required, Max 50,000 characters | Main note content (rich text/Markdown) |
| `createdAt` | DateTime | Auto-generated, Indexed | Timestamp when note was created (UTC) |
| `updatedAt` | DateTime | Auto-updated | Timestamp when note was last modified (UTC) |
| `noteTags` | NoteTag[] | Relation | Many-to-many relationship with tags |

#### Validation Rules

**Title**:
- Optional field
- Maximum 500 characters
- If null, UI displays first 50 characters of content
- Allows empty string (treated as null)

**Content**:
- Required field (cannot be null or empty)
- Minimum 1 character
- Maximum 50,000 characters
- Supports Unicode characters (emoji, special characters)
- Stored as TEXT in PostgreSQL

**Timestamps**:
- `createdAt`: Set automatically on creation, immutable
- `updatedAt`: Updated automatically on any field change or tag assignment change

#### Indexes

```prisma
@@index([createdAt(sort: Desc)]) // For sorting notes list (newest first)
@@index([updatedAt])              // For filtering by last modified
```

#### Prisma Schema

```prisma
model Note {
  id        String    @id @default(cuid())
  title     String?   @db.VarChar(500)
  content   String    @db.Text
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  noteTags  NoteTag[]

  @@index([createdAt(sort: Desc)])
  @@index([updatedAt])
}
```

---

### 2. Tag

Represents a categorical label with a name and color for organizing notes.

#### Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | String | Primary Key, Auto-generated (cuid) | Unique identifier for the tag |
| `name` | String | Required, Unique, Max 50 characters | Display name of the tag |
| `color` | String | Required, HEX format | Color code for visual distinction (#RRGGBB) |
| `noteTags` | NoteTag[] | Relation | Many-to-many relationship with notes |

#### Validation Rules

**Name**:
- Required field (cannot be null or empty)
- Minimum 1 character
- Maximum 50 characters
- Must be unique (case-insensitive comparison in application layer)
- Trim whitespace before validation
- No special characters except alphanumeric, spaces, hyphens, underscores

**Color**:
- Required field
- Must be valid HEX color code: `#[0-9A-Fa-f]{6}`
- Stored with leading `#` character
- Examples: `#3B82F6`, `#EF4444`, `#10B981`

#### Indexes

```prisma
@@unique([name]) // Ensures tag names are unique (also creates index)
```

#### Prisma Schema

```prisma
model Tag {
  id       String    @id @default(cuid())
  name     String    @unique @db.VarChar(50)
  color    String    @db.VarChar(7)
  noteTags NoteTag[]
}
```

---

### 3. NoteTag (Join Table)

Represents the many-to-many relationship between notes and tags.

#### Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `noteId` | String | Foreign Key, Part of Composite PK | Reference to Note.id |
| `tagId` | String | Foreign Key, Part of Composite PK | Reference to Tag.id |
| `note` | Note | Relation | The note in this relationship |
| `tag` | Tag | Relation | The tag in this relationship |

#### Constraints

- **Composite Primary Key**: `(noteId, tagId)` - A note cannot have the same tag assigned twice
- **Cascade Delete**: 
  - If a note is deleted, all associated NoteTag records are deleted
  - If a tag is deleted, all associated NoteTag records are deleted
- **Indexes**: Both `noteId` and `tagId` are indexed for query performance

#### Prisma Schema

```prisma
model NoteTag {
  noteId String
  tagId  String
  note   Note   @relation(fields: [noteId], references: [id], onDelete: Cascade)
  tag    Tag    @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([noteId, tagId])
  @@index([noteId])
  @@index([tagId])
}
```

---

## Entity Relationships

### Diagram

```
┌──────────────────────┐
│       Note           │
│──────────────────────│
│ id (PK)              │
│ title                │
│ content              │
│ createdAt (indexed)  │
│ updatedAt (indexed)  │
└──────────┬───────────┘
           │
           │ 1:N
           │
           ▼
┌──────────────────────┐
│      NoteTag         │
│──────────────────────│
│ noteId (FK, PK)      │◄────┐
│ tagId  (FK, PK)      │     │
└──────────┬───────────┘     │
           │                  │
           │ N:1              │ N:1
           │                  │
           ▼                  │
┌──────────────────────┐     │
│        Tag           │     │
│──────────────────────│     │
│ id (PK)              │─────┘
│ name (unique)        │
│ color                │
└──────────────────────┘
```

### Relationship Details

**Note ↔ Tag (Many-to-Many)**
- A Note can have zero or more Tags
- A Tag can be assigned to zero or more Notes
- Implemented via explicit join table `NoteTag`
- Cascade delete: Removing note or tag removes join records

---

## State Transitions

### Note Lifecycle

```
[Non-existent]
    │
    │ createNote()
    ▼
[Draft] ──────────────────────┐
    │                          │
    │ Content changes          │ deleteNote()
    │ Tag assignments          │
    │ (auto-save every 2s)     │
    │                          │
    ▼                          │
[Modified] ────────────────────┤
    │                          │
    │ updateNote()             │
    │                          │
    ▼                          ▼
[Persisted] ──────────────► [Deleted]
```

**States**:
- **Non-existent**: Note doesn't exist in database
- **Draft**: Note created, awaiting first auto-save
- **Modified**: Note has unsaved changes (client-side)
- **Persisted**: Note saved to database, no pending changes
- **Deleted**: Note removed from database (permanent)

**State Transitions**:
1. `createNote()`: Non-existent → Draft
2. Auto-save (2s debounce): Draft/Modified → Persisted
3. User edits: Persisted → Modified
4. `deleteNote()`: Any state → Deleted

### Tag Lifecycle

```
[Non-existent]
    │
    │ createTag()
    ▼
[Active] ──────────────────────┐
    │                          │
    │ updateTag()              │ deleteTag()
    │ (name or color change)   │
    │                          │
    ▼                          ▼
[Active] ──────────────────► [Deleted]
```

**States**:
- **Non-existent**: Tag doesn't exist in database
- **Active**: Tag exists and can be assigned to notes
- **Deleted**: Tag removed from database (all assignments removed)

**State Transitions**:
1. `createTag()`: Non-existent → Active
2. `updateTag()`: Active → Active (name/color changed)
3. `deleteTag()`: Active → Deleted (cascade deletes NoteTag records)

### NoteTag Association Lifecycle

```
[Unassigned]
    │
    │ assignTagsToNote()
    ▼
[Assigned]
    │
    │ removeTagsFromNote()
    ▼
[Unassigned]
```

**States**:
- **Unassigned**: Tag not associated with note
- **Assigned**: Tag linked to note via NoteTag record

**State Transitions**:
1. `assignTagsToNote()`: Creates NoteTag record
2. `removeTagsFromNote()`: Deletes NoteTag record
3. Note deletion: Auto-removes all NoteTag records (cascade)
4. Tag deletion: Auto-removes all NoteTag records (cascade)

---

## Query Patterns

### 1. Get All Notes (Sorted by Creation Date)

```typescript
const notes = await prisma.note.findMany({
  include: {
    noteTags: {
      include: {
        tag: true
      }
    }
  },
  orderBy: {
    createdAt: 'desc'
  }
})
```

### 2. Filter Notes by Tags (OR Logic)

```typescript
const notes = await prisma.note.findMany({
  where: {
    noteTags: {
      some: {
        tagId: {
          in: selectedTagIds // Array of tag IDs
        }
      }
    }
  },
  include: {
    noteTags: {
      include: {
        tag: true
      }
    }
  },
  orderBy: {
    createdAt: 'desc'
  }
})
```

### 3. Filter Notes by Calendar Date

```typescript
const startOfDay = new Date(selectedDate)
startOfDay.setHours(0, 0, 0, 0)

const endOfDay = new Date(selectedDate)
endOfDay.setHours(23, 59, 59, 999)

const notes = await prisma.note.findMany({
  where: {
    createdAt: {
      gte: startOfDay,
      lt: endOfDay
    }
  },
  include: {
    noteTags: {
      include: {
        tag: true
      }
    }
  },
  orderBy: {
    createdAt: 'desc'
  }
})
```

### 4. Get Dates with Notes (for Calendar Markers)

```typescript
const noteDates = await prisma.note.findMany({
  select: {
    createdAt: true
  },
  distinct: ['createdAt']
})

// Process in JavaScript to get unique dates
const uniqueDates = noteDates.map(note => {
  const date = new Date(note.createdAt)
  return date.toISOString().split('T')[0]
})
```

### 5. Create Note with Tags

```typescript
const note = await prisma.note.create({
  data: {
    title: 'My Note',
    content: 'Note content here',
    noteTags: {
      create: tagIds.map(tagId => ({
        tagId
      }))
    }
  },
  include: {
    noteTags: {
      include: {
        tag: true
      }
    }
  }
})
```

### 6. Update Note Tags (Replace All)

```typescript
// Remove existing tags and add new ones
await prisma.note.update({
  where: { id: noteId },
  data: {
    noteTags: {
      deleteMany: {}, // Remove all existing
      create: newTagIds.map(tagId => ({
        tagId
      }))
    }
  }
})
```

---

## Edge Cases & Data Integrity

### 1. Empty Note Content

**Scenario**: User tries to save note with no content  
**Handling**: Client-side validation prevents empty content; server action validates `content.length >= 1`  
**Database**: Content field is required (NOT NULL)

### 2. Duplicate Tag Names

**Scenario**: User tries to create tag with existing name  
**Handling**: 
- Database enforces unique constraint on `name` field
- Server action checks for existing tag before creation
- UI shows error: "Tag name already exists"
- Case-insensitive check in application layer before DB call

### 3. Very Long Note Content

**Scenario**: User creates note exceeding 50,000 characters  
**Handling**:
- Client-side validation shows character count
- Prevents typing beyond limit (or shows warning)
- Server action validates `content.length <= 50000`
- Database: TEXT field supports up to 1GB in PostgreSQL

### 4. Tag Deletion with Note Assignments

**Scenario**: User deletes tag that's assigned to multiple notes  
**Handling**:
- Cascade delete removes all NoteTag records
- Notes remain in database (content unaffected)
- UI shows confirmation: "This tag is used by X notes. Continue?"

### 5. Note Deletion

**Scenario**: User deletes note  
**Handling**:
- Confirmation prompt required
- Cascade delete removes all NoteTag records
- Permanent deletion (no trash/undo in this version)

### 6. Special Characters in Note Content

**Scenario**: User enters emoji, Unicode characters, special symbols  
**Handling**:
- PostgreSQL TEXT field supports full Unicode
- No escaping needed (Prisma handles parameterization)
- Display: Ensure font supports Unicode characters

### 7. Concurrent Edits (Same User, Multiple Tabs)

**Scenario**: User edits same note in two browser tabs  
**Handling**:
- Last write wins (no conflict resolution in v1)
- `updatedAt` timestamp tracks latest change
- Future enhancement: Optimistic locking with version numbers

### 8. Database Connection Failure During Auto-Save

**Scenario**: Network issue or database down during save  
**Handling**:
- Server action returns error response
- Client queues save and retries (exponential backoff)
- UI shows warning: "Unable to save. Retrying..."
- Data persists in browser state until save succeeds

---

## Performance Considerations

### Database Optimization

1. **Indexes**:
   - `Note.createdAt` (DESC): Fast sorting for note list
   - `Note.updatedAt`: Filter by modification date
   - `Tag.name`: Unique constraint creates index
   - `NoteTag.noteId`: Fast tag lookups per note
   - `NoteTag.tagId`: Fast note lookups per tag

2. **Query Optimization**:
   - Use `select` to fetch only needed fields
   - Avoid N+1 queries with `include`
   - Implement pagination for large note lists (offset or cursor-based)

3. **Connection Pooling**:
   - Prisma default: 10 connections
   - Adjust for production load: `connection_limit=20` in DATABASE_URL

### Data Volume Estimates

- **1000 Notes**: 
  - Average note size: 2KB
  - Total: ~2MB of text content
  - With metadata: ~3MB
  - Query performance: Excellent with indexes

- **100 Tags**:
  - ~5KB total
  - Negligible impact

- **Note-Tag Associations**:
  - Assume average 3 tags per note
  - 1000 notes × 3 = 3000 records
  - ~60KB of join table data
  - Query performance: Excellent with composite PK and indexes

---

## Summary

| Entity | Purpose | Key Relationships | Key Constraints |
|--------|---------|-------------------|-----------------|
| **Note** | Store note content and metadata | Many-to-many with Tag | Max 50K chars, indexed timestamps |
| **Tag** | Categorize and organize notes | Many-to-many with Note | Unique name, HEX color format |
| **NoteTag** | Link notes to tags | Connects Note and Tag | Composite PK, cascade delete |

**Data Model Status**: Complete and ready for implementation. All entities, relationships, validations, and query patterns are defined.
