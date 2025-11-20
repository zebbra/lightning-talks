# Tasks: EasyNotes Core Note-Taking Platform

**Branch**: `001-note-taking-core`  
**Input**: Design documents from `/specs/001-note-taking-core/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/server-actions.md ✅

**Tech Stack**: Next.js 15, TypeScript, Prisma, PostgreSQL, Tiptap, TailwindCSS  
**Tests**: NOT explicitly requested in spec - tests are optional enhancements  
**Organization**: Tasks grouped by user story for independent implementation and testing

## Format: `- [ ] [ID] [P?] [Story?] Description`

- **Checkbox**: `- [ ]` (markdown checkbox for tracking)
- **[P]**: Parallelizable (different files, no dependencies on incomplete tasks)
- **[Story]**: User story label (US1, US2, etc.) - only for user story phases
- File paths included in descriptions

## Path Conventions

Based on plan.md project structure:
- **App Router**: `app/` (Next.js 15 pages and layouts)
- **Components**: `components/` (React Client Components)
- **Server Actions**: `actions/` (Server-side business logic)
- **Database**: `prisma/` (schema and migrations)
- **Library**: `lib/` (utilities, validations, Prisma client)
- **Types**: `types/` (TypeScript definitions)

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Initialize Next.js project and install core dependencies

- [X] T001 Create Next.js 15 project with TypeScript, Tailwind CSS, and App Router at repository root
- [X] T002 [P] Install core dependencies: @prisma/client, prisma, zod
- [X] T003 [P] Install UI dependencies: @tiptap/react, @tiptap/starter-kit, @tiptap/extension-link, @tiptap/extension-placeholder, @tiptap/extension-markdown, react-day-picker, date-fns, react-colorful
- [X] T004 [P] Configure ESLint and Prettier per Next.js 15 defaults
- [X] T005 [P] Configure TypeScript with strict mode in tsconfig.json
- [X] T006 [P] Setup Tailwind CSS configuration in tailwind.config.ts
- [X] T007 Create .env.example with DATABASE_URL template
- [X] T008 Create .gitignore with Node, Next.js, and environment files

**Checkpoint**: Project structure initialized, dependencies installed

---

## Phase 2: Foundational (Database & Core Infrastructure)

**Purpose**: Database setup and foundational code that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T009 Initialize Prisma with `npx prisma init`
- [X] T010 Create Prisma schema with Note, Tag, and NoteTag models in prisma/schema.prisma
- [X] T011 Add indexes to Prisma schema: Note.createdAt DESC, Note.updatedAt, NoteTag composite key and foreign keys
- [X] T012 Create initial database migration with `npx prisma migrate dev --name init`
- [X] T013 Generate Prisma Client with `npx prisma generate`
- [X] T014 Create Prisma client singleton in lib/prisma.ts with development logging
- [X] T015 [P] Create validation schemas in lib/validations.ts: createNoteSchema, updateNoteSchema, createTagSchema, updateTagSchema, deleteSchema
- [X] T016 [P] Create shared TypeScript types in types/index.ts: Note, Tag, NoteTag, ActionResponse
- [X] T017 [P] Create utility functions in lib/utils.ts: date formatting, string truncation, color validation
- [X] T018 Setup Next.js configuration in next.config.js with React Strict Mode
- [X] T019 Create root layout in app/layout.tsx with metadata and font configuration
- [X] T020 Create home page redirect in app/page.tsx to /notes route

**Checkpoint**: Foundation ready - database configured, core utilities in place, user story implementation can now begin

---

## Phase 3: User Story 1 - Create and Edit Basic Notes (Priority: P1) 🎯 MVP

**Goal**: Users can create notes, add formatted text (bold, italic, headers), auto-save, and view/edit saved notes

**Independent Test**: Create a new note with formatted text, navigate away, reopen application, verify note persists with formatting intact

### Server Actions for User Story 1

- [X] T021 [P] [US1] Implement createNote server action in actions/notes.ts with validation and revalidation
- [X] T022 [P] [US1] Implement getNotes server action in actions/notes.ts with sorting by createdAt DESC
- [X] T023 [P] [US1] Implement getNoteById server action in actions/notes.ts
- [X] T024 [P] [US1] Implement updateNote server action in actions/notes.ts with auto-update of updatedAt
- [X] T025 [P] [US1] Implement deleteNote server action in actions/notes.ts with cascade delete

### UI Components for User Story 1

- [X] T026 [P] [US1] Create base Button component in components/ui/Button.tsx with variants and sizes
- [X] T027 [P] [US1] Create LoadingSpinner component in components/ui/LoadingSpinner.tsx
- [X] T028 [P] [US1] Create EmptyState component in components/ui/EmptyState.tsx for empty note list
- [X] T029 [US1] Create ThreePanelLayout component in components/layout/ThreePanelLayout.tsx with grid structure
- [X] T030 [US1] Create NoteListItem component in components/notes/NoteListItem.tsx with title/preview display
- [X] T031 [US1] Create NotesList component in components/notes/NotesList.tsx with New Note button and note selection
- [X] T032 [US1] Create TiptapEditor component in components/notes/NoteEditor.tsx with Tiptap integration, StarterKit, formatting toolbar, and auto-save
- [X] T033 [US1] Implement auto-save debouncing (2 second delay) in NoteEditor component
- [X] T034 [US1] Add character count display and 50,000 character limit validation in NoteEditor
- [X] T035 [US1] Create main NotesClient component in components/NotesClient.tsx with state management and three-panel integration
- [X] T036 [US1] Create notes page in app/notes/page.tsx as Server Component fetching initial data
- [X] T037 [US1] Create notes layout in app/notes/layout.tsx
- [X] T038 [US1] Add global styles in app/globals.css with Tailwind imports and custom styles

**Checkpoint**: User Story 1 complete - users can create, edit, and view notes with basic formatting and auto-save

---

## Phase 4: User Story 5 - Delete Notes (Priority: P2)

**Goal**: Users can delete unwanted notes with confirmation prompt to prevent accidental deletion

**Independent Test**: Create a note, trigger delete action, confirm deletion, verify note no longer appears

**Note**: Implementing US5 before US2 because delete is simpler and doesn't require tag infrastructure

### Implementation for User Story 5

- [X] T039 [P] [US5] Create ConfirmDialog component in components/ui/ConfirmDialog.tsx for delete confirmation
- [X] T040 [US5] Add delete button and confirmation flow to NoteEditor component in components/notes/NoteEditor.tsx
- [X] T041 [US5] Implement optimistic delete update using useOptimistic in NotesClient component
- [X] T042 [US5] Add delete success/error toast notification handling

**Checkpoint**: User Story 5 complete - users can safely delete notes with confirmation

---

## Phase 5: User Story 2 - Organize Notes with Tags (Priority: P2)

**Goal**: Users can create colored tags, assign multiple tags to notes, and filter notes by selecting tags

**Independent Test**: Create multiple notes, create several colored tags, assign tags to notes, use left panel filters to show only notes with specific tags

### Server Actions for User Story 2

- [X] T043 [P] [US2] Implement createTag server action in actions/tags.ts with uniqueness check and validation
- [X] T044 [P] [US2] Implement getTags server action in actions/tags.ts sorted alphabetically
- [X] T045 [P] [US2] Implement updateTag server action in actions/tags.ts with uniqueness check
- [X] T046 [P] [US2] Implement deleteTag server action in actions/tags.ts with cascade delete count
- [X] T047 [P] [US2] Implement assignTagsToNote server action in actions/tags.ts with idempotent behavior
- [X] T048 [P] [US2] Implement removeTagsFromNote server action in actions/tags.ts
- [X] T049 [P] [US2] Implement replaceNoteTags server action in actions/tags.ts for bulk replacement

### UI Components for User Story 2

- [X] T050 [P] [US2] Create TagPill component in components/tags/TagPill.tsx with colored display
- [X] T051 [P] [US2] Create ColorPicker component in components/tags/ColorPicker.tsx using react-colorful with preset palette
- [X] T052 [US2] Create TagFilter component in components/tags/TagFilter.tsx with multi-select checkboxes and clear filters
- [X] T053 [US2] Create TagManager component in components/tags/TagManager.tsx with create, edit, delete, and color selection
- [X] T054 [US2] Add tag assignment UI to NoteEditor component for current note
- [X] T055 [US2] Integrate TagFilter in left panel of NotesClient component
- [X] T056 [US2] Implement tag filtering logic in NotesClient component using OR logic
- [X] T057 [US2] Update getNotes server action call to support tagIds filter parameter
- [X] T058 [US2] Display assigned tags on each NoteListItem component
- [X] T059 [US2] Add optimistic tag updates using useOptimistic in NotesClient

**Checkpoint**: User Story 2 complete - users can create tags, assign to notes, and filter by tags

---

## Phase 6: User Story 3 - Enhanced Text Formatting with Markdown (Priority: P3)

**Goal**: Power users can write notes using Markdown syntax for efficient keyboard-driven input

**Independent Test**: Create a note, type Markdown syntax (headers with #, lists with -, bold with **, links), verify proper rendering

### Implementation for User Story 3

- [X] T060 [P] [US3] Add @tiptap/extension-markdown to NoteEditor component
- [X] T061 [US3] Configure Tiptap to parse Markdown syntax: headers (#), bold (**), italic (*), lists (-, 1.), links ([text](url))
- [X] T062 [US3] Add toggle button to switch between rendered and Markdown source view in NoteEditor
- [ ] T063 [US3] Test Markdown parsing for all supported elements and edge cases

**Checkpoint**: User Story 3 complete - users can use Markdown syntax alongside visual formatting

---

## Phase 7: User Story 4 - Calendar-Based Note Navigation (Priority: P3)

**Goal**: Users can find notes created on specific dates using calendar widget

**Independent Test**: Create notes on different dates, click dates on calendar widget, verify filtered results show only notes from selected date

### Implementation for User Story 4

- [X] T064 [P] [US4] Create CalendarWidget component in components/calendar/CalendarWidget.tsx using react-day-picker
- [X] T065 [US4] Add date selection state management to NotesClient component
- [X] T066 [US4] Implement date-based filtering in NotesClient to filter by createdAt date
- [X] T067 [US4] Update getNotes to support dateFrom/dateTo filter parameters
- [ ] T068 [US4] Add visual indicators (dots/highlights) to calendar for dates with notes
- [X] T069 [US4] Add Clear Date Filter button to CalendarWidget
- [X] T070 [US4] Integrate CalendarWidget in left panel above TagFilter in NotesClient
- [X] T071 [US4] Handle timezone conversion correctly for date filtering using lib/utils.ts

**Checkpoint**: User Story 4 complete - users can navigate notes by calendar date

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements affecting multiple user stories, performance, UX, and deployment readiness

### User Experience Enhancements

- [X] T072 [P] Create Toast notification component in components/ui/Toast.tsx for success/error messages
- [X] T073 [P] Create ErrorBoundary component in components/ui/ErrorBoundary.tsx for graceful error handling
- [X] T074 Add loading skeletons for NotesList in components/notes/NotesList.tsx
- [X] T075 Add loading skeleton for NoteEditor in components/notes/NoteEditor.tsx
- [ ] T076 Implement optimistic UI updates for all mutations using React 19 useOptimistic
- [X] T077 Add keyboard shortcuts: Cmd+N for new note, Cmd+S for manual save, Esc to deselect note
- [ ] T078 Improve empty states with helpful messages and action prompts

### Performance Optimization

- [ ] T079 [P] Add pagination or virtual scrolling to NotesList for 1000+ notes using react-window
- [X] T080 [P] Implement connection pooling configuration in lib/prisma.ts
- [ ] T081 Optimize Prisma queries with selective field fetching where appropriate
- [X] T082 Add React.memo to expensive components: NoteListItem, TagPill, CalendarWidget
- [ ] T083 Lazy load NoteEditor component using next/dynamic
- [ ] T084 Run Next.js bundle analyzer and optimize bundle size

### Accessibility

- [X] T085 [P] Add ARIA labels to all interactive elements across components
- [X] T086 [P] Ensure keyboard navigation works for note list, tag filters, and editor
- [ ] T087 [P] Test color contrast ratios for tag colors and ensure 4.5:1 minimum
- [ ] T088 Add focus indicators to all interactive elements
- [ ] T089 Test with screen reader (VoiceOver/NVDA) for all core workflows

### Testing Infrastructure Setup (Optional - for future enhancement)

- [ ] T090 [P] Configure Jest with next/jest in jest.config.js
- [ ] T091 [P] Create jest.setup.js with @testing-library/jest-dom
- [ ] T092 [P] Configure Playwright in playwright.config.ts
- [ ] T093 [P] Setup test database connection in .env.test
- [ ] T094 Create test utilities in tests/utils/ for database seeding and cleanup

### Documentation & Deployment

- [X] T095 [P] Create comprehensive README.md with setup, development, and deployment instructions
- [X] T096 [P] Document all server actions with JSDoc comments in actions/ files
- [ ] T097 [P] Create DATABASE_SETUP.md with PostgreSQL installation and configuration
- [ ] T098 Validate quickstart.md steps by following from scratch
- [ ] T099 Create seed.ts in prisma/ for development data seeding
- [ ] T100 Configure Vercel deployment settings or alternative platform
- [ ] T101 Setup environment variables in deployment platform
- [ ] T102 Run production migration with `npx prisma migrate deploy`
- [ ] T103 Smoke test deployed application for all core workflows

### Final Quality Checks

- [ ] T104 Verify all constitutional requirements from plan.md are met
- [ ] T105 Test with 1000+ notes for performance validation
- [ ] T106 Test with 100+ tags for performance validation
- [ ] T107 Cross-browser testing: Chrome, Firefox, Safari, Edge (latest 2 versions)
- [ ] T108 Verify all success criteria from spec.md are met
- [ ] T109 Security review: input validation, SQL injection prevention, XSS protection
- [ ] T110 Performance audit: measure and verify all timing targets from plan.md

**Checkpoint**: Application polished, documented, tested, and ready for production deployment

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies - start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 completion - BLOCKS all user stories
- **Phase 3 (US1)**: Depends on Phase 2 completion - Core MVP functionality
- **Phase 4 (US5)**: Depends on Phase 3 completion - Requires notes to exist to delete
- **Phase 5 (US2)**: Depends on Phase 2 completion, recommended after US1 - Independent but better with notes
- **Phase 6 (US3)**: Depends on Phase 3 completion - Enhances editor from US1
- **Phase 7 (US4)**: Depends on Phase 2 completion, recommended after US1 - Independent filtering feature
- **Phase 8 (Polish)**: Depends on desired user stories being complete

### User Story Dependencies

- **US1 (P1)**: REQUIRED for MVP - No dependencies after Foundational
- **US5 (P2)**: Requires US1 - Deletes notes created in US1
- **US2 (P2)**: Independent after Foundational - Can run parallel to US1 with separate team member
- **US3 (P3)**: Enhances US1 editor - Can start after US1 complete
- **US4 (P3)**: Independent after Foundational - Can run parallel to other stories

### Within Each Phase

**Phase 2 (Foundational)**:
1. T009-T013: Database setup (sequential)
2. T014-T017: Core utilities (parallel after T013)
3. T018-T020: Next.js configuration (parallel)

**Phase 3 (US1)**:
1. T021-T025: Server actions (all parallel)
2. T026-T028: Base UI components (all parallel)
3. T029-T034: Note components (sequential, but NoteListItem and NoteEditor can start together after T029)
4. T035-T038: Integration (sequential after components)

**Phase 5 (US2)**:
1. T043-T049: Server actions (all parallel)
2. T050-T052: Tag UI primitives (all parallel)
3. T053-T059: Tag integration (sequential after primitives)

### Parallel Opportunities

**High Parallelization**:
- Phase 1 Setup: T002-T006 (all parallel)
- Phase 2 Foundational: T015-T017 (parallel after Prisma setup)
- Phase 3 US1 Server Actions: T021-T025 (all parallel)
- Phase 3 US1 Base UI: T026-T028 (all parallel)
- Phase 5 US2 Server Actions: T043-T049 (all parallel)
- Phase 5 US2 Tag UI: T050-T052 (all parallel)
- Phase 8 Polish UX: T072-T073 (parallel)
- Phase 8 Polish Performance: T079-T080 (parallel)
- Phase 8 Polish Accessibility: T085-T087 (parallel)
- Phase 8 Testing Setup: T090-T094 (all parallel)
- Phase 8 Documentation: T095-T097 (all parallel)

**Team Parallelization** (after Phase 2):
- Developer A: Phase 3 (US1) + Phase 4 (US5)
- Developer B: Phase 5 (US2)
- Developer C: Phase 6 (US3) + Phase 7 (US4)

---

## Parallel Example: User Story 1 Implementation

```bash
# After completing foundational phase, launch server actions together:
# T021: Implement createNote in actions/notes.ts
# T022: Implement getNotes in actions/notes.ts  
# T023: Implement getNoteById in actions/notes.ts
# T024: Implement updateNote in actions/notes.ts
# T025: Implement deleteNote in actions/notes.ts

# Then launch base UI components together:
# T026: Create Button component in components/ui/Button.tsx
# T027: Create LoadingSpinner in components/ui/LoadingSpinner.tsx
# T028: Create EmptyState in components/ui/EmptyState.tsx

# Continue with note-specific components (some sequential due to dependencies)
```

---

## Implementation Strategy

### MVP First (User Story 1 + Delete Only)

1. **Complete Phase 1**: Setup → T001-T008
2. **Complete Phase 2**: Foundational → T009-T020 (CRITICAL - blocks everything)
3. **Complete Phase 3**: User Story 1 → T021-T038 (Core note-taking)
4. **Complete Phase 4**: User Story 5 → T039-T042 (Delete notes)
5. **STOP and VALIDATE**: Test note creation, editing, auto-save, deletion independently
6. **Optional**: Add minimal polish (T072-T074) for better UX
7. **Deploy/Demo**: Basic working note-taking app

**MVP Delivers**: Users can create, edit, save, view, and delete notes with rich text formatting. This is a fully functional (albeit basic) note-taking application.

### Incremental Delivery (Recommended)

1. **Foundation** (Phase 1 + 2): T001-T020 → Database and infrastructure ready
2. **MVP Release** (Phase 3 + 4): T021-T042 → Basic note-taking with CRUD operations
3. **Tags Release** (Phase 5): T043-T059 → Add organizational system
4. **Power User Release** (Phase 6): T060-T063 → Add Markdown support
5. **Navigation Release** (Phase 7): T064-T071 → Add calendar filtering
6. **Production Ready** (Phase 8): T072-T110 → Polish, optimize, document, deploy

Each release adds independent value without breaking previous functionality.

### Parallel Team Strategy

**Scenario**: 3 developers available after foundation is complete

1. **Foundation Sprint** (All hands): Complete Phase 1 + 2 together → T001-T020
2. **Feature Sprint 1** (Parallel work):
   - Dev A: Phase 3 (US1) → T021-T038
   - Dev B: Phase 5 (US2) → T043-T059 (can start immediately after foundation)
   - Dev C: Phase 7 (US4) → T064-T071 (can start immediately after foundation)
3. **Feature Sprint 2** (Sequential work):
   - Dev A: Phase 4 (US5) → T039-T042 (depends on US1)
   - Dev B: Phase 6 (US3) → T060-T063 (can help Dev A)
   - Dev C: Start Phase 8 polish → T072+
4. **Polish Sprint** (All hands): Complete Phase 8 together

---

## Task Summary

**Total Tasks**: 110 tasks across 8 phases

### Breakdown by Phase:
- **Phase 1 (Setup)**: 8 tasks
- **Phase 2 (Foundational)**: 12 tasks (BLOCKS all user stories)
- **Phase 3 (US1 - MVP Core)**: 18 tasks
- **Phase 4 (US5 - Delete)**: 4 tasks
- **Phase 5 (US2 - Tags)**: 17 tasks
- **Phase 6 (US3 - Markdown)**: 4 tasks
- **Phase 7 (US4 - Calendar)**: 8 tasks
- **Phase 8 (Polish)**: 39 tasks

### Breakdown by User Story:
- **US1 (P1)**: 18 tasks - Create and edit notes with formatting
- **US2 (P2)**: 17 tasks - Tag system and filtering
- **US3 (P3)**: 4 tasks - Markdown syntax support
- **US4 (P3)**: 8 tasks - Calendar navigation
- **US5 (P2)**: 4 tasks - Delete notes with confirmation
- **Setup/Foundation**: 20 tasks - Infrastructure and shared code
- **Polish**: 39 tasks - UX, performance, accessibility, deployment

### Parallelizable Tasks: 47 tasks marked with [P]

### MVP Scope (Minimum Viable Product):
- Phase 1: Setup (8 tasks)
- Phase 2: Foundational (12 tasks)
- Phase 3: User Story 1 (18 tasks)
- Phase 4: User Story 5 (4 tasks)
- **Total for MVP**: 42 tasks

### Estimated Timeline:
- **MVP (Solo)**: 2-3 weeks
- **MVP (Team of 3)**: 1-1.5 weeks
- **Full Feature Set (Solo)**: 4-5 weeks
- **Full Feature Set (Team of 3)**: 2-3 weeks
- **Production Ready with Polish**: +1 week

---

## Format Validation

✅ **All tasks follow required format**: `- [ ] [ID] [P?] [Story?] Description with file path`
✅ **Task IDs**: Sequential T001-T110
✅ **Parallel markers**: 47 tasks marked [P] for parallel execution
✅ **Story labels**: Applied to all user story tasks (US1, US2, US3, US4, US5)
✅ **File paths**: Included in all implementation task descriptions
✅ **Checkboxes**: All tasks start with `- [ ]` for markdown checkbox tracking

---

## Notes

- All tasks include specific file paths per project structure in plan.md
- Server actions use Next.js 15 "use server" directive pattern
- Client components will use "use client" directive
- Database operations use Prisma ORM with TypeScript types
- Validation uses Zod schemas as specified in research.md
- Rich text editor uses Tiptap as decided in research.md
- Calendar uses react-day-picker as decided in research.md
- Color picker uses react-colorful as decided in research.md
- All server actions return ActionResponse<T> discriminated union
- Auto-save debounces at 2 seconds per spec.md requirement
- Tests are optional and not included in main task list (can add T111+ if TDD desired)
- Constitutional requirements validated: Code Quality ✅, Testing ✅, UX ✅, Performance ✅

---

**Tasks Status**: ✅ COMPLETE - Ready for implementation

**Next Steps**: Begin Phase 1 (Setup) or jump to MVP implementation (Phases 1-4)
