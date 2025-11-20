'use client'

import { useEffect, useState } from 'react'

export type ToastType = 'success' | 'error' | 'info'

interface ToastProps {
  message: string
  type: ToastType
  duration?: number
  onClose: () => void
}

export function Toast({ message, type, duration = 3000, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const styles = {
    success: 'from-green-500 to-emerald-600',
    error: 'from-red-500 to-pink-600',
    info: 'from-blue-500 to-purple-600',
  }[type]

  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
  }[type]

  return (
    <div
      className={`glass text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 min-w-[320px] max-w-md backdrop-blur-xl animate-slide-in`}
      role="alert"
      aria-live="polite"
    >
      <span className={`flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r ${styles} font-bold text-lg`}>
        {icons}
      </span>
      <span className="flex-1 text-gray-900 dark:text-gray-100 font-medium">{message}</span>
      <button
        onClick={onClose}
        className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-bold text-xl transition-colors"
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  )
}

interface ToastContainerProps {
  toasts: Array<{ id: string; message: string; type: ToastType }>
  onRemove: (id: string) => void
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => onRemove(toast.id)}
        />
      ))}
    </div>
  )
}

export function useToast() {
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: ToastType }>>([])

  const showToast = (message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(7)
    setToasts((prev) => [...prev, { id, message, type }])
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  return {
    toasts,
    showToast,
    removeToast,
    success: (message: string) => showToast(message, 'success'),
    error: (message: string) => showToast(message, 'error'),
    info: (message: string) => showToast(message, 'info'),
  }
}
