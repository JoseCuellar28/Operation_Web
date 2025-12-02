"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const isDark = theme === "dark"

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative inline-flex items-center w-14 h-7 rounded-full transition-colors duration-300"
      style={{
        backgroundColor: isDark ? "oklch(0.3 0.02 240)" : "oklch(0.92 0.01 240)",
      }}
      aria-label="Toggle theme"
    >
      {/* Slider background */}
      <div className="relative w-full h-full flex items-center">
        {/* Circle toggle */}
        <div
          className={`absolute w-6 h-6 rounded-full transition-all duration-300 flex items-center justify-center shadow-md ${
            isDark ? "translate-x-7 bg-slate-700" : "translate-x-0.5 bg-white"
          }`}
        >
          {isDark ? <Moon className="w-3.5 h-3.5 text-yellow-300" /> : <Sun className="w-3.5 h-3.5 text-yellow-500" />}
        </div>
      </div>
    </button>
  )
}
