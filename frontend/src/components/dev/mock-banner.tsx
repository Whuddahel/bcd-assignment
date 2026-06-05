"use client"

import { useState } from "react"
import { X, FlaskConical } from "lucide-react"

export function MockBanner() {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <div className="relative z-50 flex items-center justify-between gap-2 bg-amber-500/10 px-4 py-2 text-center text-xs text-amber-400 border-b border-amber-500/20">
      <div className="flex flex-1 items-center justify-center gap-2">
        <FlaskConical className="h-3.5 w-3.5 shrink-0" />
        <span>
          <strong>Development Mode</strong> — no real credentials required. Use the role switcher
          in the bottom-right to switch between Customer, Seller, Admin, and Support views.
        </span>
      </div>
      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss development mode banner"
        className="shrink-0 rounded p-0.5 opacity-70 transition-opacity hover:opacity-100"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
