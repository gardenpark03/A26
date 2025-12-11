"use client"

import { useState } from "react"

export type DayActivity = {
  date: string // YYYY-MM-DD
  count: number
  mood: 'very_bad' | 'bad' | 'neutral' | 'good' | 'very_good' | null
}

interface CommitGraphProps {
  days: DayActivity[]
}

const moodColors: Record<string, string> = {
  very_bad: "bg-red-900 dark:bg-red-800",
  bad: "bg-red-500 dark:bg-red-600",
  neutral: "bg-gray-400 dark:bg-gray-500",
  good: "bg-emerald-500 dark:bg-emerald-600",
  very_good: "bg-emerald-700 dark:bg-emerald-800",
}

const moodEmojis: Record<string, string> = {
  very_bad: "😢",
  bad: "😟",
  neutral: "😐",
  good: "😊",
  very_good: "😄",
}

export function CommitGraph({ days }: CommitGraphProps) {
  const [hoveredDay, setHoveredDay] = useState<DayActivity | null>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  // Create a map for quick lookup
  const dayMap = new Map<string, DayActivity>()
  days.forEach((day) => {
    dayMap.set(day.date, day)
  })

  // Calculate 12 weeks from today
  const today = new Date()
  const startDate = new Date(today)
  startDate.setDate(today.getDate() - 83) // 84 days including today

  // Generate all dates for 12 weeks
  const allDates: Date[] = []
  for (let i = 0; i < 84; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    allDates.push(date)
  }

  // Group by weeks (columns) and days (rows)
  const weeks: Date[][] = []
  let currentWeek: Date[] = []

  // Start from the beginning of the week
  const firstDate = allDates[0]
  const firstDay = firstDate.getDay() // 0 = Sunday, 1 = Monday, etc.
  
  // Fill empty cells before first date to align with day of week
  for (let i = 0; i < firstDay; i++) {
    currentWeek.push(new Date(0)) // Placeholder
  }

  allDates.forEach((date) => {
    currentWeek.push(date)
    
    if (currentWeek.length === 7) {
      weeks.push(currentWeek)
      currentWeek = []
    }
  })

  // Add remaining days
  if (currentWeek.length > 0) {
    // Fill rest of week with placeholders
    while (currentWeek.length < 7) {
      currentWeek.push(new Date(0))
    }
    weeks.push(currentWeek)
  }

  const getCellColor = (date: Date) => {
    if (date.getTime() === 0) return "bg-transparent" // Placeholder

    const dateStr = date.toISOString().split("T")[0]
    const activity = dayMap.get(dateStr)

    if (!activity || activity.count === 0) {
      return "bg-muted/30 border border-muted"
    }

    if (activity.mood) {
      // Base color from mood
      const baseColor = moodColors[activity.mood]
      
      // Adjust opacity based on count
      if (activity.count === 1) {
        return `${baseColor} opacity-60`
      } else if (activity.count === 2) {
        return `${baseColor} opacity-80`
      } else {
        return baseColor
      }
    }

    // No mood, just show count-based green
    if (activity.count === 1) {
      return "bg-emerald-300 dark:bg-emerald-700"
    } else if (activity.count === 2) {
      return "bg-emerald-500 dark:bg-emerald-600"
    } else {
      return "bg-emerald-700 dark:bg-emerald-500"
    }
  }

  const handleMouseEnter = (date: Date, e: React.MouseEvent) => {
    if (date.getTime() === 0) return

    const dateStr = date.toISOString().split("T")[0]
    const activity = dayMap.get(dateStr)

    if (activity) {
      setHoveredDay(activity)
      setMousePos({ x: e.clientX, y: e.clientY })
    } else {
      setHoveredDay({
        date: dateStr,
        count: 0,
        mood: null,
      })
      setMousePos({ x: e.clientX, y: e.clientY })
    }
  }

  const handleMouseLeave = () => {
    setHoveredDay(null)
  }

  const dayLabels = ["일", "월", "화", "수", "목", "금", "토"]

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {/* Day labels */}
        <div className="flex flex-col gap-1 text-xs text-muted-foreground pt-6">
          {dayLabels.map((label, i) => (
            <div key={i} className="h-3 md:h-4 flex items-center">
              {i % 2 === 1 && label}
            </div>
          ))}
        </div>

        {/* Graph grid */}
        <div className="flex-1 overflow-x-auto">
          <div className="inline-flex gap-1">
            {weeks.map((week, weekIdx) => (
              <div key={weekIdx} className="flex flex-col gap-1">
                {week.map((date, dayIdx) => {
                  const isPlaceholder = date.getTime() === 0

                  return (
                    <div
                      key={dayIdx}
                      className={`w-3 h-3 md:w-4 md:h-4 rounded-sm transition-all cursor-pointer ${
                        isPlaceholder ? "" : getCellColor(date)
                      }`}
                      onMouseEnter={(e) => !isPlaceholder && handleMouseEnter(date, e)}
                      onMouseLeave={handleMouseLeave}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {hoveredDay && (
        <div
          className="fixed z-50 px-3 py-2 bg-popover text-popover-foreground text-sm rounded-lg shadow-lg border pointer-events-none"
          style={{
            left: mousePos.x + 10,
            top: mousePos.y + 10,
          }}
        >
          <p className="font-medium">
            {new Date(hoveredDay.date).toLocaleDateString("ko-KR", {
              month: "short",
              day: "numeric",
              weekday: "short",
            })}
          </p>
          <p className="text-xs text-muted-foreground">
            {hoveredDay.count > 0 ? (
              <>
                {hoveredDay.count}개 로그
                {hoveredDay.mood && (
                  <> · {moodEmojis[hoveredDay.mood]}</>
                )}
              </>
            ) : (
              "기록 없음"
            )}
          </p>
        </div>
      )}
    </div>
  )
}

