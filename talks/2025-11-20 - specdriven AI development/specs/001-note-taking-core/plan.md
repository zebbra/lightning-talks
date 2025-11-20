# Implementation Plan: EasyNotes Core Note-Taking Platform

**Branch**: `001-note-taking-core` | **Date**: 2025-11-20 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-note-taking-core/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

EasyNotes is a cloud-based note-taking platform with a three-panel UI (calendar/filters, notes list, editor), tag-based organization, rich text editing with Markdown support, and PostgreSQL database storage. Built on Next.js 15 App Router with server actions, Prisma ORM, and React Server Components for optimal performance and developer experience.

## Technical Context

**Language/Version**: TypeScript 5.3+ with Next.js 15 (App Router)  
**Primary Dependencies**: 
- Next.js 15.0+ (React Server Components + Server Actions)
- React 19+ (useOptimistic, Server Actions support)
- Prisma 5.7+ (ORM with PostgreSQL support)
- PostgreSQL 15+ (Database)
- NEEDS CLARIFICATION: Rich text editor library (Tiptap vs Lexical vs Slate)
- NEEDS CLARIFICATION: Calendar component (react-day-picker vs custom)
- NEEDS CLARIFICATION: Color picker library (react-colorful vs custom)

**Storage**: PostgreSQL 15+ with Prisma ORM for schema management and type-safe queries  
**Testing**: 
- Jest + React Testing Library (unit/component tests)
- Playwright (E2E tests)
- NEEDS CLARIFICATION: Integration testing strategy for server actions

**Target Platform**: Web application (desktop-optimized, minimum 1024px width)  
**Project Type**: Web application (unified Next.js 15 full-stack)  
**Performance Goals**: 
- Initial page load: <2 seconds
- Note creation: <1 second to editor ready
- Auto-save latency: <3 seconds after typing stops
- Tag filter response: <1 second
- Calendar filter response: <1 second
- Support 1000+ notes without performance degradation

**Constraints**: 
- Desktop-first (no mobile responsive required per spec)
- No authentication/authorization system
- Auto-save every 2 seconds of inactivity
- Note content: minimum 50,000 characters support
- Database queries must use indexes for performance

**Scale/Scope**: 
- Single-user or public demo scenario (no auth)
- Support 1000+ notes
- Support 100+ tags
- Three-panel layout with complex interactions
- Rich text editor with Markdown support
- Calendar-based navigation

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Verify this feature design complies with the four core constitutional principles:

- [x] **Code Quality Standards**: 
  - Architecture follows SOLID principles: Server actions encapsulate business logic, Prisma models separate data concerns
  - DRY via reusable server actions, shared UI components, Prisma schema as single source of truth
  - Separation of concerns: Server Components for data fetching, Client Components for interactivity, Server Actions for mutations
  - TypeScript enforces type safety across full stack
  - ESLint + Prettier configured for Next.js 15
  - Documentation: JSDoc for server actions, README for setup, inline comments for complex logic

- [x] **Testing Standards**: 
  - Unit tests: Server actions (business logic), utility functions, data transformations
  - Integration tests: Server action + Prisma interactions, component + server action flows
  - E2E tests: Full user workflows (create note, tag note, filter by tag, delete note)
  - Test coverage target: 80% for server actions, 70% for components
  - CI/CD: GitHub Actions with test suite on all PRs
  - TDD approach for critical server actions (note CRUD, tag filtering)

- [x] **User Experience Consistency**: 
  - UI patterns: Three-panel layout following consistent design system
  - Accessibility: Semantic HTML, ARIA labels, keyboard navigation for all actions
  - Responsive design: N/A per spec (desktop-optimized only)
  - Intuitive design: Clear visual hierarchy, discoverable actions (New Note button, tag pills, calendar widget)
  - Error handling: Toast notifications for failures, loading states, graceful degradation
  - Design system: TailwindCSS with custom theme, reusable component library

- [x] **Performance Requirements**: 
  - Page load targets: <2s initial load via React Server Components, streaming with Suspense
  - API response times: Server actions <500ms for CRUD operations
  - Resource optimization: React Server Components reduce client bundle, Prisma connection pooling
  - Database optimization: Indexes on notes.createdAt, tags.name, noteTags junction table
  - Caching: Next.js automatic caching for Server Components, revalidation on mutations
  - Monitoring: Performance metrics via Web Vitals, server action timing logs

**Violations**: None. Architecture aligns with all constitutional principles.

**Post-Design Review** (After Phase 1):
- ✅ **Code Quality**: Data model follows single responsibility (Note, Tag, NoteTag separation), type-safe Prisma schema
- ✅ **Testing**: Clear contract definitions enable comprehensive test coverage, query patterns documented for testing
- ✅ **UX Consistency**: Server actions provide consistent error handling format, optimistic updates enable smooth UX
- ✅ **Performance**: Indexes defined for all query patterns, connection pooling configured, efficient many-to-many queries
- **Status**: All constitutional requirements validated in design phase. Ready for implementation.

## Project Structure

### Documentation (this feature)

```text
specs/001-note-taking-core/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── server-actions.ts  # Server action type definitions and schemas
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
easynotes/
├── prisma/
│   ├── schema.prisma          # Database schema (Note, Tag, NoteTag models)
│   ├── migrations/            # Database migration history
│   └── seed.ts                # Optional seed data for development
│
├── src/
│   ├── app/                   # Next.js 15 App Router
│   │   ├── layout.tsx         # Root layout with fonts, metadata
│   │   ├── page.tsx           # Home page (Server Component - redirects to /notes)
│   │   ├── notes/
│   │   │   ├── page.tsx       # Main notes UI (Server Component for initial data)
│   │   │   └── layout.tsx     # Notes layout with three-panel structure
│   │   └── globals.css        # Tailwind CSS imports
│   │
│   ├── components/
│   │   ├── calendar/
│   │   │   └── CalendarWidget.tsx     # Client Component - interactive calendar
│   │   ├── tags/
│   │   │   ├── TagFilter.tsx          # Client Component - multi-select filter
│   │   │   ├── TagManager.tsx         # Client Component - tag CRUD UI
│   │   │   └── TagPill.tsx            # Reusable tag display component
│   │   ├── notes/
│   │   │   ├── NotesList.tsx          # Client Component - note list with sorting
│   │   │   ├── NoteEditor.tsx         # Client Component - rich text editor
│   │   │   └── NoteListItem.tsx       # Note preview in list
│   │   ├── ui/
│   │   │   ├── Button.tsx             # Reusable button component
│   │   │   ├── Toast.tsx              # Toast notification system
│   │   │   ├── LoadingSpinner.tsx     # Loading state component
│   │   │   └── EmptyState.tsx         # Empty state placeholder
│   │   └── layout/
│   │       └── ThreePanelLayout.tsx   # Three-panel grid layout
│   │
│   ├── actions/               # Server Actions (use server directive)
│   │   ├── notes.ts           # createNote, updateNote, deleteNote, getNotes
│   │   └── tags.ts            # createTag, updateTag, deleteTag, getTags, assignTags
│   │
│   ├── lib/
│   │   ├── prisma.ts          # Prisma client singleton
│   │   ├── validations.ts     # Zod schemas for input validation
│   │   └── utils.ts           # Utility functions (date formatting, etc.)
│   │
│   └── types/
│       └── index.ts           # Shared TypeScript types
│
├── tests/
│   ├── unit/
│   │   ├── actions/           # Server action unit tests
│   │   └── lib/               # Utility function tests
│   ├── integration/
│   │   └── notes-workflow.test.ts  # Full note creation → tag → filter flow
│   └── e2e/
│       ├── note-management.spec.ts  # E2E: Create, edit, delete notes
│       ├── tag-filtering.spec.ts    # E2E: Tag creation and filtering
│       └── calendar-navigation.spec.ts  # E2E: Calendar date filtering
│
├── public/
│   └── fonts/                 # Custom fonts if needed
│
├── .env.example               # Environment variable template
├── .env.local                 # Local environment (DATABASE_URL)
├── package.json               # Dependencies and scripts
├── tsconfig.json              # TypeScript configuration
├── tailwind.config.ts         # Tailwind CSS configuration
├── next.config.js             # Next.js configuration
├── playwright.config.ts       # Playwright E2E test configuration
└── jest.config.js             # Jest unit/integration test configuration
```

**Structure Decision**: Web application structure selected. Next.js 15 App Router unifies frontend and backend in a single project. The `app/` directory contains Server Components and routing, `components/` contains Client Components with "use client" directive, and `actions/` contains Server Actions with "use server" directive. No separate backend/ and frontend/ directories needed due to Next.js unified architecture.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No constitutional violations identified. Architecture complexity is justified by requirements:

| Architectural Choice | Justification | Alternative Rejected |
|---------------------|---------------|---------------------|
| Prisma ORM | Type-safe database access, migrations, schema management | Raw SQL: No type safety, manual migrations, error-prone |
| Server Actions | Eliminates API routes, type-safe client-server communication | REST API: Additional boilerplate, separate endpoint files |
| React Server Components | Reduces client bundle, faster initial load, SEO-friendly | Pure Client SPA: Larger bundle, slower initial render |
| Three separate state layers | Client state (UI), Optimistic updates (UX), Server state (persistence) | Single state layer: No optimistic updates, poor UX |

**Note**: This section documents justified architectural decisions that add necessary complexity, not constitutional violations.

## Architecture Decisions

### 1. Next.js 15 App Router with Server Actions

**Decision**: Use Next.js 15 App Router with Server Actions instead of traditional API routes.

**Rationale**:
- **Type Safety**: Server Actions provide end-to-end type safety from client to database
- **Reduced Boilerplate**: No need for separate API route files, request/response handling
- **Better DX**: Direct function calls from client components instead of fetch() wrappers
- **Built-in Features**: Automatic request deduplication, caching, revalidation
- **Progressive Enhancement**: Forms work without JavaScript via native form actions
- **Performance**: Eliminates API middleware overhead, direct server-side execution

**Trade-offs**:
- Learning curve for developers unfamiliar with Server Actions
- Debugging can be more complex than REST APIs
- Limited third-party integration examples (newer pattern)

**Mitigation**:
- Comprehensive documentation in quickstart.md
- Clear contract definitions in contracts/server-actions.md
- Consistent error handling patterns across all actions

---

### 2. React Server Components for Data Fetching

**Decision**: Use React Server Components for initial data loading, Client Components for interactivity.

**Rationale**:
- **Performance**: Server Components fetch data on server, reducing client bundle size
- **SEO**: Server-rendered content is indexable (future benefit if auth added)
- **Data Security**: Database credentials never exposed to client
- **Automatic Optimization**: Next.js handles streaming, suspense, caching

**Implementation Pattern**:
```typescript
// app/notes/page.tsx (Server Component)
export default async function NotesPage() {
  const notes = await getNotes()  // Fetches on server
  return <NotesClient initialNotes={notes} />
}

// components/NotesClient.tsx (Client Component)
'use client'
export function NotesClient({ initialNotes }) {
  // Interactive UI logic here
}
```

---

### 3. Prisma ORM with Explicit Join Table

**Decision**: Use Prisma with explicit NoteTag model for many-to-many relationship.

**Rationale**:
- **Query Control**: Explicit join table allows custom queries on the relationship
- **Performance**: Can add indexes on join table columns for faster lookups
- **Future Extensions**: Easy to add metadata to relationship (e.g., assignedAt timestamp)
- **Type Safety**: Prisma generates TypeScript types for all models
- **Migration Management**: Prisma migrations track schema changes

**Alternative Considered**: Implicit many-to-many with Prisma's `@relation` syntax
- Rejected because: Less control over join table structure and queries

---

### 4. Optimistic UI Updates with React 19 useOptimistic

**Decision**: Use React 19's useOptimistic hook for immediate UI feedback on mutations.

**Rationale**:
- **User Experience**: Instant feedback before server response
- **Perceived Performance**: App feels faster even with network latency
- **Built-in Pattern**: React 19 provides official API (no third-party library needed)
- **Automatic Rollback**: If server action fails, optimistic update is reverted

**Implementation Pattern**:
```typescript
const [optimisticNotes, addOptimisticNote] = useOptimistic(
  notes,
  (state, newNote) => [newNote, ...state]
)

async function handleCreate(data) {
  addOptimisticNote({ id: 'temp-id', ...data })
  await createNote(data)  // Server action
}
```

---

### 5. Tiptap Rich Text Editor

**Decision**: Use Tiptap for rich text editing with Markdown support.

**Rationale**: (See research.md for detailed analysis)
- Best Markdown support out of the box
- React 19 compatible
- Extensible plugin architecture
- Headless UI allows full design control

---

### 6. Auto-Save with Debouncing

**Decision**: Auto-save note content after 2 seconds of typing inactivity.

**Rationale**:
- **Data Safety**: Users don't lose work if they forget to save
- **Performance**: Debouncing prevents excessive database writes
- **UX**: No manual save button reduces cognitive load
- **Balance**: 2 seconds is long enough to avoid save spam, short enough to feel automatic

**Implementation**:
```typescript
useEffect(() => {
  const timer = setTimeout(() => {
    if (hasChanges) {
      updateNote(noteId, content)  // Server action
    }
  }, 2000)
  
  return () => clearTimeout(timer)
}, [content])
```

---

## Component Hierarchy

### High-Level Structure

```
NotesPage (Server Component)
└── NotesClient (Client Component)
    ├── LeftPanel
    │   ├── CalendarWidget (Client)
    │   └── TagFilter (Client)
    ├── CenterPanel
    │   └── NotesList (Client)
    │       └── NoteListItem × N
    └── RightPanel
        └── NoteEditor (Client)
            ├── TagManager
            └── TiptapEditor
```

### Component Responsibilities

**NotesPage (Server Component)**
- Fetch initial data (notes and tags) on server
- Pass data to client components
- Handles route parameters (if any)

**NotesClient (Client Component)**
- Manages application state (selected note, filters, date)
- Coordinates between panels
- Handles optimistic updates
- Provides layout structure

**CalendarWidget**
- Displays month calendar
- Highlights dates with notes
- Handles date selection
- Clears date filter

**TagFilter**
- Displays list of all tags with colors
- Multi-select checkboxes
- Shows count of notes per tag
- Clear all filters button

**NotesList**
- Displays filtered/sorted notes
- Shows note preview (title or first line)
- Handles note selection
- "New Note" button
- Loading and empty states

**NoteEditor**
- Rich text editor (Tiptap)
- Auto-save indicator
- Tag assignment UI
- Delete note button
- Formatting toolbar
- Character count display

**TagManager**
- Create new tags with color picker
- Display assigned tags on current note
- Add/remove tags from note
- Edit tag name/color
- Delete tags with confirmation

---

## Database Schema & Migrations

### Schema Overview

Three models with many-to-many relationship:
- **Note**: Content storage with timestamps
- **Tag**: Organization labels with colors
- **NoteTag**: Junction table for associations

### Migration Strategy

**Development**:
```bash
npx prisma migrate dev --name descriptive_name
```

**Production**:
```bash
npx prisma migrate deploy  # In CI/CD pipeline
```

**Rollback** (if needed):
```bash
# Manually remove migration folder and revert schema
npx prisma migrate resolve --rolled-back migration_name
```

### Index Strategy

Critical indexes for performance:
1. `Note.createdAt DESC` - Primary sorting for note list
2. `Note.updatedAt` - Filter by modification date
3. `Tag.name UNIQUE` - Uniqueness constraint (also an index)
4. `NoteTag (noteId, tagId)` - Composite primary key
5. `NoteTag.noteId` - Fast lookup of tags per note
6. `NoteTag.tagId` - Fast lookup of notes per tag

---

## Deployment Strategy

### Recommended: Vercel

**Why Vercel**:
- Built by Next.js creators, zero-config deployment
- Automatic HTTPS, CDN, edge network
- Preview deployments for every PR
- Built-in PostgreSQL (Vercel Postgres)
- Environment variable management
- Excellent Next.js 15 support

**Deployment Steps**:
1. Push code to GitHub
2. Connect repository to Vercel
3. Add DATABASE_URL environment variable
4. Deploy (automatic on push to main branch)
5. Run migrations: `vercel env pull && npx prisma migrate deploy`

### Alternative: Railway / Render / Fly.io

**Pros**:
- More control over infrastructure
- Potentially lower cost at scale
- Separate PostgreSQL management

**Cons**:
- More configuration required
- Manual SSL/CDN setup
- Less optimized for Next.js

### Environment Variables

Required for production:
```env
DATABASE_URL=postgresql://...
NODE_ENV=production
```

Optional:
```env
NEXT_PUBLIC_APP_URL=https://easynotes.com
```

---

## Phased Implementation Approach

### Phase 1: Foundation (Week 1)
- ✅ Setup Next.js 15 project
- ✅ Configure Prisma with PostgreSQL
- ✅ Create database schema and migrations
- ✅ Setup testing infrastructure (Jest + Playwright)
- ✅ Create basic layout structure

### Phase 2: Core Note Functionality (Week 1-2)
- Implement note CRUD server actions
- Build basic NotesList component
- Build basic NoteEditor with Tiptap
- Implement auto-save logic
- Add loading and error states
- Write unit tests for server actions

### Phase 3: Tag System (Week 2)
- Implement tag CRUD server actions
- Build TagFilter component
- Build TagManager component
- Implement tag assignment/removal
- Add color picker (react-colorful)
- Test tag filtering logic

### Phase 4: Calendar Navigation (Week 3)
- Integrate react-day-picker
- Build CalendarWidget component
- Implement date-based filtering
- Add date indicators for notes
- Test calendar interactions

### Phase 5: UI Polish (Week 3)
- Add optimistic updates with useOptimistic
- Implement toast notifications
- Add empty states
- Improve loading skeletons
- Add keyboard shortcuts
- Accessibility audit (WCAG 2.1 AA)

### Phase 6: Testing & QA (Week 4)
- Write integration tests
- Write E2E tests for all user workflows
- Performance testing (1000+ notes)
- Cross-browser testing
- Fix bugs and edge cases

### Phase 7: Deployment (Week 4)
- Setup CI/CD pipeline (GitHub Actions)
- Deploy to Vercel (or alternative)
- Production database setup
- Run migrations in production
- Performance monitoring setup

---

## Success Metrics

### Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Initial page load | < 2s | Web Vitals LCP |
| Note creation time | < 1s | Time to editor ready |
| Auto-save latency | < 3s | Debounce + server response |
| Tag filter response | < 1s | UI update time |
| Calendar filter response | < 1s | UI update time |
| Notes with 1000+ records | No degradation | Load time comparison |

### Test Coverage Targets

- Server Actions: 80% coverage
- React Components: 70% coverage
- E2E: All critical user paths

### Accessibility Goals

- WCAG 2.1 Level AA compliance
- Keyboard navigation for all actions
- Screen reader compatibility
- Sufficient color contrast (4.5:1 minimum)

---

## Risk Assessment & Mitigation

### Technical Risks

**Risk**: Server Actions are a newer pattern, limited community resources  
**Mitigation**: Detailed documentation, clear contracts, fallback to REST if needed

**Risk**: Large notes (50K chars) could cause performance issues  
**Mitigation**: Text compression, pagination, virtualized rendering if needed

**Risk**: Concurrent edits (same user, multiple tabs)  
**Mitigation**: Last-write-wins in v1, optimistic locking in future version

**Risk**: Database connection failures during auto-save  
**Mitigation**: Retry logic with exponential backoff, queue saves in browser state

### Operational Risks

**Risk**: Database migration failures in production  
**Mitigation**: Test migrations in staging, backup before deploy, rollback plan

**Risk**: Vercel free tier limits exceeded  
**Mitigation**: Monitor usage, plan upgrade, alternative deployment ready

---

## Definition of Done

A feature is considered complete when:

- [ ] All functional requirements from spec.md are implemented
- [ ] Constitution Check passes (all 4 principles satisfied)
- [ ] Unit tests written and passing (80% coverage for server actions)
- [ ] Integration tests written and passing
- [ ] E2E tests written and passing for critical paths
- [ ] Code reviewed and approved
- [ ] Performance targets met (see Success Metrics)
- [ ] Accessibility audit passed (WCAG 2.1 AA)
- [ ] Documentation updated (README, quickstart.md)
- [ ] Deployed to production and smoke tested
- [ ] No P0 or P1 bugs open

---

## Appendix: Key Files Reference

| File | Purpose |
|------|---------|
| `specs/001-note-taking-core/spec.md` | Feature specification with requirements |
| `specs/001-note-taking-core/plan.md` | This implementation plan |
| `specs/001-note-taking-core/research.md` | Technical research and decisions |
| `specs/001-note-taking-core/data-model.md` | Database schema and entity definitions |
| `specs/001-note-taking-core/contracts/server-actions.md` | Server action API contracts |
| `specs/001-note-taking-core/quickstart.md` | Developer setup guide |

---

**Implementation Plan Status**: ✅ COMPLETE

Ready for Phase 2: Task Breakdown (use `/speckit.tasks` command)
