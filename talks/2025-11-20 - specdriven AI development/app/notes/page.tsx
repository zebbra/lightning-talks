import { getNotes } from '@/actions/notes'
import { getTags } from '@/actions/tags'
import { NotesClient } from '@/components/NotesClient'

export default async function NotesPage() {
  const [notesResult, tagsResult] = await Promise.all([
    getNotes(),
    getTags()
  ])
  
  const notes = notesResult.success ? notesResult.data : []
  const tags = tagsResult.success ? tagsResult.data : []
  
  return <NotesClient initialNotes={notes} initialTags={tags} />
}
