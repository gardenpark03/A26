"use client"

import { useState } from "react"

interface HabitHistoryStripProps {
  days: {
    date: string
    status: "none" | "done" | "skipped"
  }[]
}

export function HabitHistoryStrip({ days }: HabitHistoryStripProps) {
  const [hoveredDay, setHoveredDay] = useState<{
    date: string
    status: string
  } | null>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  const handleMouseEnter = (
    day: { date: string; status: string },
    e: React.MouseEvent
  ) => {
    setHoveredDay(day)
    setMousePos({ x: e.clientX, y: e.clientY })
  }

  const handleMouseLeave = () => {
    setHoveredDay(null)
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-1 flex-wrap">
        {days.map((day) => (
          <div
            key={day.date}
            className={`w-3 h-3 rounded-sm cursor-pointer transition-all ${
              day.status === "done"
                ? "bg-emerald-500 hover:bg-emerald-600"
                : day.status === "skipped"
                ? "bg-gray-400 hover:bg-gray-500"
                : "bg-muted hover:bg-muted/80"
            }`}
            onMouseEnter={(e) => handleMouseEnter(day, e)}
            onMouseLeave={handleMouseLeave}
          />
        ))}
      </div>

      {/* Tooltip */}
      {hoveredDay && (
        <div
          className="fixed z-50 px-3 py-2 bg-popover text-popover-foreground text-xs rounded-lg shadow-lg border pointer-events-none"
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
          <p className="text-muted-foreground">
            {hoveredDay.status === "done"
              ? "✓ 완료"
              : hoveredDay.status === "skipped"
              ? "건너뜀"
              : "미완료"}
          </p>
        </div>
      )}
    </div>
  )
}

