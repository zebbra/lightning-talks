# Autosave and Markdown Fixes - 2025-11-20

## Issues Fixed

### 1. Invisible Text in HTML Source View ✅
**Problem**: When editing HTML source (markdown view), the text was invisible due to transparent/gradient colors

**Root Cause**: 
- Textarea had `bg-transparent` class
- Text was inheriting gradient colors from parent elements
- No explicit text color was set

**Solution**:
```tsx
// Added explicit text colors
className="w-full h-full p-6 font-mono text-sm focus:outline-none resize-none bg-transparent text-gray-900 dark:text-gray-100"
```

### 2. No Autosave in HTML Source View ✅
**Problem**: Changes in HTML source view didn't trigger autosave

**Root Cause**: 
- `handleMarkdownChange` only updated state
- Didn't trigger the save mechanism

**Solution**:
```tsx
const handleMarkdownChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
  setMarkdownSource(e.target.value)
  // Added autosave logic with 2-second debounce
  if (!note || !editor) return
  
  if (saveTimeout) clearTimeout(saveTimeout)
  
  const timeout = setTimeout(async () => {
    setIsSaving(true)
    editor.commands.setContent(e.target.value)
    await updateNote(note.id, { title: title || null, content: e.target.value })
    setIsSaving(false)
    onNoteUpdated()
  }, 2000)
  
  setSaveTimeout(timeout)
}
```

### 3. ProseMirror Text Colors ✅
**Problem**: Editor text might appear invisible due to CSS variable issues

**Solution**:
- Changed from `color: var(--foreground)` to explicit colors
- Added dark mode support

```css
.ProseMirror {
  color: #1d1d1f;
}

@media (prefers-color-scheme: dark) {
  .ProseMirror {
    color: #f5f5f7;
  }
}
```

### 4. H1 Gradient Color ✅
**Problem**: H1 gradient used undefined CSS variable

**Solution**:
```css
.ProseMirror h1 {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  color: transparent;
}
```

### 5. Blockquote Color ✅
**Problem**: Blockquote used invalid rgba syntax with CSS variable

**Solution**:
```css
.ProseMirror blockquote {
  color: #6b7280;
}

@media (prefers-color-scheme: dark) {
  .ProseMirror blockquote {
    color: #9ca3af;
  }
}
```

## Files Modified

1. **components/notes/NoteEditor.tsx**
   - Added text color to HTML source textarea
   - Implemented autosave for HTML source editing
   - Debounced saves with 2-second delay
   - Updates editor content when switching back from HTML view

2. **app/globals.css**
   - Fixed ProseMirror text colors (explicit colors instead of variables)
   - Fixed H1 gradient (removed undefined CSS variable)
   - Fixed blockquote colors (explicit colors)
   - Added dark mode support for all text elements

## How Autosave Works Now

### Regular Editor
1. User types in the rich text editor
2. Tiptap triggers `onUpdate` event
3. Calls `handleAutoSave()`
4. Debounces for 2 seconds
5. Saves to database
6. Shows "Saving..." indicator

### HTML Source View
1. User types in the textarea
2. Triggers `handleMarkdownChange`
3. Updates markdown source state
4. Triggers autosave with 2-second debounce
5. Updates editor content
6. Saves to database
7. Shows "Saving..." indicator

### Key Features
- ✅ 2-second debounce on all edits
- ✅ Clears previous timeout when new changes occur
- ✅ Visual "Saving..." indicator with animated dot
- ✅ Updates note list after save
- ✅ Syncs content between rich text and HTML views

## Testing Checklist

- [x] Text is visible in HTML source view
- [x] Typing in HTML source triggers autosave
- [x] Autosave debounces correctly (2 seconds)
- [x] "Saving..." indicator appears
- [x] Content persists after switching views
- [x] Regular editor text is visible
- [x] H1 gradient text displays correctly
- [x] Blockquotes have proper color
- [x] Dark mode colors work

## Known Behaviors

- **Switching Views**: When you toggle between Editor and HTML views, the content is synced
- **Debouncing**: Autosave waits 2 seconds after you stop typing
- **Character Limit**: 50,000 characters enforced
- **HTML Validation**: Raw HTML is accepted and rendered by Tiptap

## Status
✅ All autosave and markdown styling issues fixed

---

**Date**: 2025-11-20 11:40 UTC  
**Issues Fixed**: 5  
**Files Modified**: 2  
**Status**: Complete
