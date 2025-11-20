# EasyNotes Quickstart Guide

**Feature**: EasyNotes Core Note-Taking Platform  
**Date**: 2025-11-20  
**Stack**: Next.js 15 + Prisma + PostgreSQL

## Overview

This quickstart guide will help you set up, develop, and deploy EasyNotes from scratch. Follow these steps to get a working application in under 30 minutes.

---

## Prerequisites

Before you begin, ensure you have:

- **Node.js**: v18.17 or higher (v20 recommended)
- **npm**: v9 or higher (comes with Node.js)
- **PostgreSQL**: v15 or higher (local or cloud)
- **Git**: For version control
- **Code Editor**: VS Code recommended

---

## 1. Project Setup (5 minutes)

### 1.1 Create Next.js Project

```bash
# Create new Next.js 15 project with TypeScript and App Router
npx create-next-app@latest easynotes --typescript --tailwind --app --no-src-dir

cd easynotes
```

When prompted, select:
- ✅ TypeScript
- ✅ ESLint
- ✅ Tailwind CSS
- ✅ App Router
- ❌ `src/` directory (we'll use root-level structure)
- ✅ Import alias (@/*)

### 1.2 Install Dependencies

```bash
# Core dependencies
npm install @prisma/client
npm install prisma --save-dev

# Rich text editor
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-link @tiptap/extension-placeholder

# Calendar component
npm install react-day-picker date-fns

# Color picker
npm install react-colorful

# Validation
npm install zod

# Testing
npm install --save-dev jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
npm install --save-dev @playwright/test

# TypeScript types
npm install --save-dev @types/node @types/react @types/react-dom
```

---

## 2. Database Setup (10 minutes)

### 2.1 Initialize Prisma

```bash
npx prisma init
```

This creates:
- `prisma/schema.prisma` - Database schema file
- `.env` - Environment variables file

### 2.2 Configure Database Connection

Edit `.env`:

```env
# Local PostgreSQL
DATABASE_URL="postgresql://username:password@localhost:5432/easynotes?schema=public"

# Or use cloud PostgreSQL (Vercel Postgres, Neon, Supabase, etc.)
# DATABASE_URL="postgresql://user:password@host:5432/database"
```

### 2.3 Create Database Schema

Edit `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

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

model Tag {
  id       String    @id @default(cuid())
  name     String    @unique @db.VarChar(50)
  color    String    @db.VarChar(7)
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

### 2.4 Run Migration

```bash
# Create and apply first migration
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate
```

---

## 3. Core Implementation (10 minutes)

### 3.1 Create Prisma Client Singleton

Create `lib/prisma.ts`:

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### 3.2 Create Validation Schemas

Create `lib/validations.ts`:

```typescript
import { z } from 'zod'

export const createNoteSchema = z.object({
  title: z.string().max(500).optional().nullable(),
  content: z.string().min(1).max(50000),
  tagIds: z.array(z.string()).optional()
})

export const updateNoteSchema = z.object({
  title: z.string().max(500).optional().nullable(),
  content: z.string().min(1).max(50000).optional()
})

export const createTagSchema = z.object({
  name: z.string()
    .min(1, "Tag name is required")
    .max(50, "Tag name too long")
    .regex(/^[a-zA-Z0-9\s\-_]+$/, "Invalid characters"),
  color: z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format")
})
```

### 3.3 Create Server Actions

Create `actions/notes.ts`:

```typescript
'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { createNoteSchema, updateNoteSchema } from '@/lib/validations'

export async function createNote(data: unknown) {
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
    return { success: false, error: 'Failed to create note' }
  }
}

export async function getNotes() {
  try {
    const notes = await prisma.note.findMany({
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

// Add updateNote, deleteNote, etc. following the same pattern
```

Create `actions/tags.ts`:

```typescript
'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { createTagSchema } from '@/lib/validations'

export async function createTag(data: unknown) {
  try {
    const validated = createTagSchema.parse(data)
    
    const existing = await prisma.tag.findUnique({
      where: { name: validated.name }
    })
    
    if (existing) {
      return { success: false, error: 'Tag name already exists' }
    }
    
    const tag = await prisma.tag.create({
      data: validated
    })
    
    revalidatePath('/notes')
    return { success: true, data: tag }
  } catch (error) {
    console.error('Failed to create tag:', error)
    return { success: false, error: 'Failed to create tag' }
  }
}

export async function getTags() {
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

// Add updateTag, deleteTag, etc.
```

---

## 4. UI Components (5 minutes)

### 4.1 Create Main Layout

Edit `app/notes/page.tsx`:

```typescript
import { getNotes } from '@/actions/notes'
import { getTags } from '@/actions/tags'
import { NotesClient } from '@/components/NotesClient'

export default async function NotesPage() {
  const [notesResult, tagsResult] = await Promise.all([
    getNotes(),
    getTags()
  ])
  
  if (!notesResult.success || !tagsResult.success) {
    return <div>Error loading data</div>
  }
  
  return (
    <NotesClient 
      initialNotes={notesResult.data} 
      initialTags={tagsResult.data}
    />
  )
}
```

### 4.2 Create Client Component

Create `components/NotesClient.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { CalendarWidget } from './calendar/CalendarWidget'
import { TagFilter } from './tags/TagFilter'
import { NotesList } from './notes/NotesList'
import { NoteEditor } from './notes/NoteEditor'

export function NotesClient({ initialNotes, initialTags }) {
  const [selectedNote, setSelectedNote] = useState(null)
  const [selectedTags, setSelectedTags] = useState([])
  const [selectedDate, setSelectedDate] = useState(null)
  
  return (
    <div className="grid grid-cols-[300px_1fr_1fr] h-screen">
      {/* Left Panel: Calendar + Filters */}
      <div className="border-r p-4 overflow-y-auto">
        <CalendarWidget 
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />
        <TagFilter 
          tags={initialTags}
          selectedTags={selectedTags}
          onToggleTag={(tagId) => {/* toggle logic */}}
        />
      </div>
      
      {/* Center Panel: Notes List */}
      <div className="border-r overflow-y-auto">
        <NotesList 
          notes={initialNotes}
          onSelectNote={setSelectedNote}
        />
      </div>
      
      {/* Right Panel: Editor */}
      <div className="overflow-y-auto">
        <NoteEditor 
          note={selectedNote}
          tags={initialTags}
        />
      </div>
    </div>
  )
}
```

---

## 5. Testing Setup (Optional, 5 minutes)

### 5.1 Configure Jest

Create `jest.config.js`:

```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
}

module.exports = createJestConfig(customJestConfig)
```

Create `jest.setup.js`:

```javascript
import '@testing-library/jest-dom'
```

### 5.2 Configure Playwright

```bash
npx playwright install
```

Create `playwright.config.ts`:

```typescript
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  use: {
    baseURL: 'http://localhost:3000',
  },
  webServer: {
    command: 'npm run dev',
    port: 3000,
  },
})
```

---

## 6. Development Workflow

### 6.1 Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 6.2 Database Management

```bash
# View database in Prisma Studio
npx prisma studio

# Create new migration
npx prisma migrate dev --name migration_name

# Reset database (⚠️ deletes all data)
npx prisma migrate reset

# Seed database (if seed file exists)
npx prisma db seed
```

### 6.3 Run Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Type checking
npm run type-check
```

---

## 7. Deployment (5 minutes)

### 7.1 Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# - DATABASE_URL
```

### 7.2 Run Production Migration

```bash
# SSH into production or use CI/CD
npx prisma migrate deploy
```

---

## 8. Common Tasks

### Create a New Feature

1. **Add to schema** → `prisma/schema.prisma`
2. **Create migration** → `npx prisma migrate dev`
3. **Add server action** → `actions/feature.ts`
4. **Add validation** → `lib/validations.ts`
5. **Create UI component** → `components/feature/`
6. **Write tests** → `tests/unit/` or `tests/e2e/`

### Debug Database Issues

```bash
# View generated SQL
npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma

# Check database connection
npx prisma db pull

# Format schema file
npx prisma format
```

### Optimize Performance

```bash
# Analyze bundle size
npm install --save-dev @next/bundle-analyzer

# Enable in next.config.js
```

---

## 9. Project Structure Reference

```
easynotes/
├── actions/               # Server actions (use server)
│   ├── notes.ts
│   └── tags.ts
├── app/                   # Next.js App Router
│   ├── notes/
│   │   └── page.tsx
│   ├── layout.tsx
│   └── globals.css
├── components/            # React components (use client)
│   ├── calendar/
│   ├── tags/
│   ├── notes/
│   └── ui/
├── lib/                   # Utilities
│   ├── prisma.ts
│   ├── validations.ts
│   └── utils.ts
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
└── .env                   # Environment variables
```

---

## 10. Troubleshooting

### Database Connection Errors

```bash
# Check PostgreSQL is running
psql -U username -d easynotes

# Test connection
npx prisma db pull
```

### Prisma Client Not Found

```bash
npx prisma generate
```

### Type Errors with Prisma

```bash
# Regenerate types
npx prisma generate

# Restart TypeScript server in VS Code
# Cmd+Shift+P → "TypeScript: Restart TS Server"
```

### Next.js Cache Issues

```bash
# Clear Next.js cache
rm -rf .next

# Restart dev server
npm run dev
```

---

## Next Steps

1. ✅ Complete all UI components (Calendar, Tag Filter, Editor)
2. ✅ Implement auto-save with debouncing
3. ✅ Add optimistic updates with `useOptimistic`
4. ✅ Write comprehensive tests
5. ✅ Add error boundaries
6. ✅ Implement loading states
7. ✅ Add accessibility features
8. ✅ Deploy to production

---

## Resources

- [Next.js 15 Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tiptap Documentation](https://tiptap.dev/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Day Picker](https://react-day-picker.js.org)

---

**Quickstart Status**: Complete. Ready to build EasyNotes!
