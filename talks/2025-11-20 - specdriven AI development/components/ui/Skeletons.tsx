export function NotesListSkeleton() {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="h-10 bg-gray-200 rounded-lg animate-pulse" />
      </div>
      <div className="flex-1 overflow-y-auto">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="p-4 border-b border-gray-100 space-y-2">
            <div className="h-5 bg-gray-200 rounded animate-pulse w-3/4" />
            <div className="h-4 bg-gray-100 rounded animate-pulse w-full" />
            <div className="h-4 bg-gray-100 rounded animate-pulse w-5/6" />
            <div className="flex gap-2 mt-2">
              <div className="h-6 bg-gray-200 rounded-full animate-pulse w-16" />
              <div className="h-6 bg-gray-200 rounded-full animate-pulse w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function NoteEditorSkeleton() {
  return (
    <div className="h-full flex flex-col bg-white">
      <div className="border-b border-gray-200 p-4 space-y-4">
        <div className="h-6 bg-gray-200 rounded animate-pulse w-1/4" />
        <div className="flex gap-2">
          <div className="h-8 bg-gray-200 rounded animate-pulse w-20" />
          <div className="h-8 bg-gray-200 rounded animate-pulse w-20" />
          <div className="h-8 bg-gray-200 rounded animate-pulse w-20" />
        </div>
        <div className="flex gap-2 flex-wrap">
          <div className="h-7 bg-gray-200 rounded-full animate-pulse w-16" />
          <div className="h-7 bg-gray-200 rounded-full animate-pulse w-20" />
          <div className="h-7 bg-gray-200 rounded-full animate-pulse w-24" />
        </div>
      </div>
      <div className="flex-1 p-4 space-y-3">
        <div className="h-6 bg-gray-200 rounded animate-pulse w-full" />
        <div className="h-6 bg-gray-100 rounded animate-pulse w-5/6" />
        <div className="h-6 bg-gray-100 rounded animate-pulse w-4/6" />
        <div className="h-6 bg-gray-200 rounded animate-pulse w-full" />
        <div className="h-6 bg-gray-100 rounded animate-pulse w-3/4" />
      </div>
    </div>
  )
}
