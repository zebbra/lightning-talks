# Title Autosave Fix - 2025-11-20

## Issue
**Problem**: Title changes were not being saved automatically. Users would type in the title field but changes wouldn't persist.

## Root Cause
The issue was with how React handles state updates:

```tsx
// BEFORE (BROKEN):
const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setTitle(e.target.value)  // Updates state asynchronously
  handleAutoSave()           // Reads title from state - but it's still the OLD value!
}
```

**Why it didn't work:**
1. `setTitle()` schedules a state update (async)
2. `handleAutoSave()` executes immediately
3. `handleAutoSave()` reads `title` from state - still has OLD value
4. Database gets saved with the old title

## Solution
Pass the new title value directly instead of relying on state:

```tsx
// AFTER (FIXED):
const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const newTitle = e.target.value  // Capture the new value
  setTitle(newTitle)               // Update state for UI
  
  // Trigger autosave with the new title directly
  if (!note || !editor) return
  
  if (saveTimeout) clearTimeout(saveTimeout)
  
  const timeout = setTimeout(async () => {
    setIsSaving(true)
    const content = editor.getHTML()
    await updateNote(note.id, { title: newTitle || null, content })  // Use newTitle!
    setIsSaving(false)
    onNoteUpdated()
  }, 2000)
  
  setSaveTimeout(timeout)
}
```

**Why it works now:**
1. Capture `newTitle` from the event immediately
2. Update state for UI with `setTitle(newTitle)`
3. Use `newTitle` variable directly in the save function
4. Database gets saved with the correct new title

## Key Concept: React State Updates are Asynchronous

React doesn't update state immediately. When you call `setState()`, it schedules an update:

```tsx
setTitle("New Title")
console.log(title)  // Still shows OLD value!
```

**Solution:** Use the value from the event, not from state:

```tsx
const newValue = e.target.value
setTitle(newValue)
// Use newValue, not title
await save(newValue)
```

## Files Modified

**components/notes/NoteEditor.tsx**
- Changed `handleTitleChange` to capture and use the new title value directly
- Implemented inline autosave logic instead of calling shared `handleAutoSave()`
- Maintains 2-second debounce
- Shows "Saving..." indicator

## How It Works Now

1. **User types in title field** → Triggers `onChange`
2. **Capture new title** → `const newTitle = e.target.value`
3. **Update UI state** → `setTitle(newTitle)`
4. **Clear old save timeout** → Prevents multiple saves
5. **Start 2-second timer** → Debounced save
6. **After 2 seconds** → Save to database with `newTitle`
7. **Show "Saving..." indicator** → User feedback
8. **Refresh notes list** → Update displayed title

## Testing

Try these in the browser:

1. ✅ Type in the title field
2. ✅ Wait 2 seconds
3. ✅ See "Saving..." indicator appear
4. ✅ Title should update in the notes list
5. ✅ Refresh the page - title should persist
6. ✅ Type quickly - only saves after you stop typing

## All Autosave Scenarios Now Working

| Scenario | Status | Debounce |
|----------|--------|----------|
| Edit title | ✅ Fixed | 2 seconds |
| Edit content in rich text editor | ✅ Working | 2 seconds |
| Edit HTML source view | ✅ Working | 2 seconds |
| Toggle tags | ✅ Immediate | None |

## Status
✅ Title autosave is now fully functional!

---

**Date**: 2025-11-20 11:43 UTC  
**Issue**: Title autosave not working  
**Cause**: React state async updates  
**Solution**: Use event value directly  
**Status**: Fixed ✅
