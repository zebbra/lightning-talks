'use client'

import React from 'react'

interface ThreePanelLayoutProps {
  leftPanel: React.ReactNode
  centerPanel: React.ReactNode
  rightPanel: React.ReactNode
}

export function ThreePanelLayout({ leftPanel, centerPanel, rightPanel }: ThreePanelLayoutProps) {
  return (
    <div className="flex h-screen w-full overflow-hidden p-4 gap-4">
      {/* Left Panel: Calendar + Filters */}
      <div className="w-80 glass rounded-3xl overflow-hidden flex flex-col shadow-xl">
        <div className="overflow-y-auto flex-1 custom-scrollbar">
          {leftPanel}
        </div>
      </div>
      
      {/* Center Panel: Notes List */}
      <div className="w-96 glass rounded-3xl overflow-hidden flex flex-col shadow-xl">
        <div className="overflow-y-auto flex-1 custom-scrollbar">
          {centerPanel}
        </div>
      </div>
      
      {/* Right Panel: Editor */}
      <div className="flex-1 glass rounded-3xl overflow-hidden flex flex-col shadow-xl">
        <div className="overflow-y-auto flex-1 custom-scrollbar">
          {rightPanel}
        </div>
      </div>
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
          border-radius: 10px;
          margin: 8px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(158, 158, 158, 0.4);
          border-radius: 10px;
          border: 2px solid transparent;
          background-clip: padding-box;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(158, 158, 158, 0.6);
          background-clip: padding-box;
        }
      `}</style>
    </div>
  )
}
