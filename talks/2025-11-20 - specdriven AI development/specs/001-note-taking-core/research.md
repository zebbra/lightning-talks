# Phase 0: Research & Technical Decisions

**Feature**: EasyNotes Core Note-Taking Platform  
**Date**: 2025-11-20  
**Status**: Complete

## Research Questions from Technical Context

This document resolves all "NEEDS CLARIFICATION" items identified in the Technical Context section of the implementation plan.

---

## 1. Rich Text Editor Library Selection

### Decision: Tiptap

### Rationale:
- **Modern Architecture**: Built on ProseMirror, extensible plugin system
- **React 19 Compatible**: Official React hooks, supports latest React features
- **Markdown Support**: Built-in markdown parser and serializer extensions
- **TypeScript-First**: Full TypeScript support with proper type definitions
- **Customizable**: Headless UI approach - full control over styling and UX
- **Performance**: Virtual DOM-free, direct manipulation of editor state
- **Active Maintenance**: Regular updates, strong community, excellent documentation
- **Next.js Compatible**: Works seamlessly with both Server and Client Components

### Alternatives Considered:

**Lexical (Facebook/Meta)**
- Pros: Modern, React-first, extensible, good performance
- Cons: 
  - Newer library, less mature ecosystem
  - More complex setup for basic use cases
  - Markdown support requires custom plugins
  - Smaller community and fewer examples
- Rejected because: Tiptap has better out-of-box Markdown support and larger ecosystem

**Slate**
- Pros: Pure React, flexible, customizable
- Cons:
  - Lower-level abstractions require more custom code
  - Markdown support requires significant custom implementation
  - Performance issues with large documents reported
  - API has gone through breaking changes historically
- Rejected because: Too low-level, would require substantial custom development for basic features

**Draft.js**
- Pros: Mature, Facebook-backed
- Cons:
  - Maintenance mode (minimal updates)
  - Not compatible with React 18+ without workarounds
  - Poor Markdown support
  - Less performant with large documents
- Rejected because: Effectively deprecated, poor React 19 compatibility

**Quill**
- Pros: Mature, feature-rich, good documentation
- Cons:
  - Not React-native, requires wrapper components
  - jQuery-like DOM manipulation doesn't align with React patterns
  - Harder to customize deeply
  - Heavier bundle size
- Rejected because: Not designed for React, integration friction

### Implementation Plan:
- Use `@tiptap/react` + `@tiptap/starter-kit` for basic formatting
- Add `@tiptap/extension-markdown` for Markdown support
- Extensions needed:
  - `StarterKit` (bold, italic, headings, lists, etc.)
  - `Link` extension for hyperlinks
  - `Placeholder` extension for empty state
  - Custom extension for auto-save trigger (debounced)

---

## 2. Calendar Component Selection

### Decision: react-day-picker v8+

### Rationale:
- **Lightweight**: Small bundle size (~15KB gzipped), no heavy dependencies
- **Customizable**: Full control over styling with CSS modules or Tailwind
- **Accessible**: WCAG 2.1 AA compliant, keyboard navigation, ARIA labels
- **TypeScript**: Written in TypeScript with excellent type definitions
- **Date Library Agnostic**: Works with native Date, date-fns, or no date library
- **Mature**: v8 is stable, well-tested, widely adopted
- **Next.js Compatible**: Works as Client Component, no SSR issues
- **Simple API**: Easy to integrate, minimal configuration for basic use cases

### Alternatives Considered:

**react-calendar**
- Pros: Popular, simple API, good documentation
- Cons:
  - Larger bundle size
  - Less customizable styling
  - More opinionated UI that may not match design
- Rejected because: Less flexible styling, larger bundle

**Custom Implementation**
- Pros: Full control, no dependency
- Cons:
  - Significant development time (calendar logic is complex)
  - Accessibility would require careful implementation
  - Date arithmetic edge cases (timezones, DST, leap years)
  - Maintenance burden
- Rejected because: Not worth the development cost for a solved problem

**FullCalendar**
- Pros: Feature-rich, handles events and complex scheduling
- Cons:
  - Overkill for simple date selection
  - Very large bundle size (100KB+)
  - Complex API for simple use case
- Rejected because: Too heavy and feature-rich for our needs

### Implementation Plan:
- Use `react-day-picker` v8.x
- Style with Tailwind CSS classes
- Features needed:
  - Date selection (single date)
  - Visual indicators for dates with notes (modifiers API)
  - Clear button to reset filter
  - Accessibility: keyboard navigation, ARIA labels

---

## 3. Color Picker Library Selection

### Decision: react-colorful

### Rationale:
- **Tiny Bundle**: Only 2.8KB gzipped (smallest option available)
- **Zero Dependencies**: No external dependencies
- **TypeScript**: Written in TypeScript
- **Accessible**: Keyboard navigation support, ARIA attributes
- **Framework Agnostic**: Pure React hooks, works everywhere
- **Color Formats**: Supports HEX, RGB, HSL out of the box
- **Touch Friendly**: Works on touch devices
- **Performance**: Fast rendering, optimized for frequent updates

### Alternatives Considered:

**react-color**
- Pros: Popular, multiple picker styles (Sketch, Chrome, etc.)
- Cons:
  - Much larger bundle (30KB+)
  - Older API design patterns
  - Less active maintenance
  - More dependencies
- Rejected because: Significantly larger bundle for minimal additional value

**Custom Implementation**
- Pros: Full control, no dependency
- Cons:
  - Complex color space mathematics (HSL ↔ RGB ↔ HEX)
  - Accessibility challenges (keyboard navigation, screen readers)
  - Touch/mouse interaction handling
  - Browser compatibility edge cases
- Rejected because: Color picker UI is complex to implement correctly

**Native `<input type="color">`**
- Pros: No library needed, native browser support
- Cons:
  - Inconsistent UI across browsers
  - Limited customization
  - Poor mobile experience in some browsers
  - No HEX input field built-in
- Rejected because: UX inconsistency, can't match design system

### Implementation Plan:
- Use `react-colorful` with HexColorPicker component
- Provide predefined palette of 12 common colors as quick-select options
- Allow custom HEX input via text field alongside picker
- Store colors in database as HEX strings (7 characters: #RRGGBB)

---

## 4. Integration Testing Strategy for Server Actions

### Decision: Jest + MSW (Mock Service Worker) for Server Action Integration Tests

### Rationale:
- **Server Action Testing**: Jest can test server actions directly in Node.js environment
- **Database Mocking Options**:
  - Option A: Test against real PostgreSQL (via Docker container in CI)
  - Option B: Mock Prisma client with `jest-mock-extended`
  - **Chosen**: Test against real PostgreSQL for integration tests
- **Benefits of Real DB**:
  - Tests actual database behavior (constraints, indexes, transactions)
  - Catches SQL-level issues
  - Tests migrations work correctly
  - More confidence in production behavior
- **CI/CD**: Use Docker Compose to spin up PostgreSQL in GitHub Actions

### Testing Layers:

**Unit Tests** (Jest)
- Test server actions in isolation
- Mock Prisma client with `jest-mock-extended`
- Fast, no database required
- Focus on business logic, validation, error handling

**Integration Tests** (Jest + Real PostgreSQL)
- Test server actions + Prisma + Database
- Use test database (separate from development)
- Test complete data flows
- Reset database state between tests with `prisma migrate reset`

**Component Tests** (React Testing Library)
- Test Client Components in isolation
- Mock server actions
- Focus on UI interactions, state management, props

**E2E Tests** (Playwright)
- Full browser automation
- Test complete user workflows
- Real database, real UI, real interactions
- Slower, run on CI and pre-deployment

### Alternatives Considered:

**Mock Prisma for Integration Tests**
- Pros: Faster test execution
- Cons: Doesn't test actual database behavior, false confidence
- Rejected because: Integration tests should test real integrations

**Testing Library Only (No E2E)**
- Pros: Simpler setup, faster execution
- Cons: Misses browser-specific issues, navigation, real network
- Rejected because: E2E tests catch critical issues that unit/integration miss

### Implementation Plan:
1. Set up Jest with TypeScript support
2. Configure test database connection (DATABASE_URL_TEST)
3. Create test helpers:
   - `setupTestDB()` - Run migrations before tests
   - `cleanupTestDB()` - Reset database after each test
   - `createTestNote()` - Factory functions for test data
4. Docker Compose for local and CI database
5. Playwright for E2E with dedicated test database

---

## 5. Best Practices for Next.js 15 Server Actions

### Key Patterns:

**1. Server Action File Organization**
```typescript
// src/actions/notes.ts
'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'

export async function createNote(data: FormData | Object) {
  // Business logic
  revalidatePath('/notes')
  return result
}
```

**2. Input Validation with Zod**
```typescript
import { z } from 'zod'

const noteSchema = z.object({
  title: z.string().max(500).optional(),
  content: z.string().max(50000),
})

export async function createNote(data: unknown) {
  const validated = noteSchema.parse(data)
  // Proceed with validated data
}
```

**3. Error Handling**
```typescript
export async function createNote(data: unknown) {
  try {
    const validated = noteSchema.parse(data)
    const note = await prisma.note.create({ data: validated })
    revalidatePath('/notes')
    return { success: true, data: note }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Invalid input' }
    }
    console.error('Failed to create note:', error)
    return { success: false, error: 'Failed to create note' }
  }
}
```

**4. Optimistic Updates in Client Components**
```typescript
'use client'

import { useOptimistic } from 'react'
import { createNote } from '@/actions/notes'

export function NotesList({ initialNotes }) {
  const [optimisticNotes, addOptimisticNote] = useOptimistic(
    initialNotes,
    (state, newNote) => [...state, newNote]
  )

  async function handleCreate(data) {
    addOptimisticNote({ id: 'temp', ...data })
    await createNote(data)
  }
}
```

**5. Type Safety**
```typescript
// src/types/index.ts
export type Note = {
  id: string
  title: string | null
  content: string
  createdAt: Date
  updatedAt: Date
}

// Server action with explicit types
export async function updateNote(
  id: string,
  data: Partial<Pick<Note, 'title' | 'content'>>
): Promise<{ success: boolean; data?: Note; error?: string }> {
  // Implementation
}
```

**6. Revalidation Strategy**
- Use `revalidatePath('/notes')` after mutations
- Use `revalidateTag('notes')` for fine-grained cache control
- Server Components automatically re-fetch on navigation

**7. Progressive Enhancement**
```typescript
// Works without JavaScript (form submission)
<form action={createNote}>
  <input name="content" />
  <button type="submit">Save</button>
</form>

// Enhanced with JavaScript
<form onSubmit={handleSubmit}>
  {/* Client-side validation, optimistic updates */}
</form>
```

---

## 6. Best Practices for Prisma with PostgreSQL

### Schema Design Patterns:

**1. Many-to-Many Relationship (Explicit Join Table)**
```prisma
model Note {
  id        String   @id @default(cuid())
  title     String?
  content   String   @db.Text
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  noteTags  NoteTag[]
}

model Tag {
  id       String    @id @default(cuid())
  name     String    @unique
  color    String    // HEX color code
  noteTags NoteTag[]
}

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

**2. Indexes for Performance**
```prisma
model Note {
  // ... fields
  
  @@index([createdAt(sort: Desc)]) // For sorting notes by date
  @@index([updatedAt])             // For filtering by update time
}

model Tag {
  name String @unique // Unique constraint is also an index
}
```

**3. Query Optimization Patterns**
```typescript
// Include related data efficiently
const notesWithTags = await prisma.note.findMany({
  include: {
    noteTags: {
      include: {
        tag: true
      }
    }
  },
  orderBy: { createdAt: 'desc' },
  take: 50 // Pagination
})

// Filter by tags (OR logic)
const filteredNotes = await prisma.note.findMany({
  where: {
    noteTags: {
      some: {
        tagId: {
          in: selectedTagIds
        }
      }
    }
  }
})

// Filter by date range
const notesByDate = await prisma.note.findMany({
  where: {
    createdAt: {
      gte: startOfDay,
      lt: endOfDay
    }
  }
})
```

**4. Migration Strategy**
- Development: `npx prisma migrate dev --name description`
- Production: `npx prisma migrate deploy` (in CI/CD)
- Always review generated SQL before applying
- Use `@@map` and `@map` to keep Prisma names clean while matching DB conventions

**5. Connection Management**
```typescript
// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

**6. Data Seeding**
```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create sample tags
  const workTag = await prisma.tag.create({
    data: { name: 'Work', color: '#3B82F6' }
  })

  // Create sample notes
  await prisma.note.create({
    data: {
      title: 'Sample Note',
      content: 'This is a sample note',
      noteTags: {
        create: [{ tagId: workTag.id }]
      }
    }
  })
}

main()
```

---

## 7. Performance Optimization Strategies

### Database Layer:
1. **Indexes**: All foreign keys and frequently queried fields
2. **Connection Pooling**: Prisma handles automatically (default 10 connections)
3. **Query Optimization**: Use `select` instead of full object when possible
4. **Pagination**: Implement cursor-based or offset pagination for large datasets

### Next.js Layer:
1. **React Server Components**: Fetch data on server, reduce client bundle
2. **Streaming**: Use Suspense boundaries for progressive rendering
3. **Code Splitting**: Dynamic imports for heavy components (editor)
4. **Caching**: Leverage Next.js automatic caching, use revalidation wisely

### Client Layer:
1. **Optimistic Updates**: Immediate UI feedback with `useOptimistic`
2. **Debouncing**: Auto-save with 2-second debounce
3. **Virtualization**: For large note lists (1000+), use `react-window` or `react-virtual`
4. **Bundle Size**: Monitor with `@next/bundle-analyzer`

### Monitoring:
1. **Web Vitals**: Track LCP, FID, CLS
2. **Server Action Timing**: Log execution time for slow queries
3. **Database Query Analysis**: Use Prisma query logging in development

---

## 8. Deployment Strategy

### Recommended Platform: Vercel

**Rationale**:
- Built by Next.js creators, optimized for Next.js 15
- Zero-config deployment for Next.js projects
- Automatic HTTPS, CDN, edge functions
- Preview deployments for every PR
- PostgreSQL add-on available (Vercel Postgres)
- Environment variable management
- Excellent Next.js-specific optimizations

### Alternative: Railway / Render / Fly.io
- More control over infrastructure
- Separate PostgreSQL instance
- Docker-based deployment
- Potentially lower cost at scale

### Deployment Checklist:
1. Set up PostgreSQL database (Vercel Postgres or separate provider)
2. Configure `DATABASE_URL` environment variable
3. Run migrations: `prisma migrate deploy`
4. Set up CI/CD pipeline (GitHub Actions)
5. Configure domain and SSL
6. Set up monitoring (Vercel Analytics or external)

---

## Summary of Resolved Clarifications

| Question | Decision | Key Benefit |
|----------|----------|-------------|
| Rich text editor | Tiptap | Best Markdown support, React 19 compatible, extensible |
| Calendar component | react-day-picker v8 | Lightweight, accessible, customizable |
| Color picker | react-colorful | Tiny bundle (2.8KB), zero dependencies |
| Integration testing | Jest + Real PostgreSQL | Tests actual DB behavior, higher confidence |
| Architecture patterns | Server Actions + RSC + Optimistic Updates | Type-safe, minimal boilerplate, great UX |
| ORM patterns | Prisma with explicit join table | Type-safe, performant queries, clear schema |
| Deployment | Vercel (recommended) | Zero-config, optimized for Next.js 15 |

All "NEEDS CLARIFICATION" items from Technical Context have been resolved. Ready to proceed to Phase 1: Design & Contracts.
