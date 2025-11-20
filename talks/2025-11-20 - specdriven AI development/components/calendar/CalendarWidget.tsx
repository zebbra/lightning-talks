'use client'

import React, { memo } from 'react'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/dist/style.css'

interface CalendarWidgetProps {
  selectedDate: Date | undefined
  onSelectDate: (date: Date | undefined) => void
}

export const CalendarWidget = memo(function CalendarWidget({ selectedDate, onSelectDate }: CalendarWidgetProps) {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          📅 Calendar
        </h3>
        {selectedDate && (
          <button
            onClick={() => onSelectDate(undefined)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            Clear
          </button>
        )}
      </div>
      <DayPicker
        mode="single"
        selected={selectedDate}
        onSelect={onSelectDate}
        className="glass rounded-2xl p-4 shadow-md overflow-hidden"
      />
    </div>
  )
})
