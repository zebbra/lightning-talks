import React from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 backdrop-blur-sm'
  
  const variants = {
    primary: 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] focus-visible:ring-purple-500',
    secondary: 'glass border border-white/20 text-gray-700 dark:text-gray-200 hover:bg-white/30 dark:hover:bg-white/10 hover:scale-[1.02] active:scale-[0.98] focus-visible:ring-gray-400',
    danger: 'bg-gradient-to-r from-red-500 to-pink-600 text-white hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] focus-visible:ring-red-500',
    ghost: 'hover:glass text-gray-700 dark:text-gray-200 hover:scale-[1.02] active:scale-[0.98] focus-visible:ring-gray-400'
  }
  
  const sizes = {
    sm: 'h-9 px-4 text-sm',
    md: 'h-11 px-6 text-base',
    lg: 'h-13 px-8 text-lg'
  }
  
  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  )
}
