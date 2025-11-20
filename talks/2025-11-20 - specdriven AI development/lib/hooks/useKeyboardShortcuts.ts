'use client'

import { useEffect } from 'react'

interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  metaKey?: boolean
  shiftKey?: boolean
  callback: (e: KeyboardEvent) => void
  description?: string
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      shortcuts.forEach((shortcut) => {
        const isKeyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase()
        const isCtrlMatch = shortcut.ctrlKey === undefined || e.ctrlKey === shortcut.ctrlKey
        const isMetaMatch = shortcut.metaKey === undefined || e.metaKey === shortcut.metaKey
        const isShiftMatch = shortcut.shiftKey === undefined || e.shiftKey === shortcut.shiftKey

        if (isKeyMatch && isCtrlMatch && isMetaMatch && isShiftMatch) {
          e.preventDefault()
          shortcut.callback(e)
        }
      })
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [shortcuts])
}
