"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import type { TimelineItem } from "@/lib/timeline/types"

interface TimelineViewProps {
  items: TimelineItem[]
  year: number
  showGoals: boolean
  showMilestones: boolean
  showTasks: boolean
}

export function TimelineView({
  items,
  year,
  showGoals,
  showMilestones,
  showTasks,
}: TimelineViewProps) {
  const [hoveredItem, setHoveredItem] = useState<TimelineItem | null>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  // Filter items by type
  const filteredItems = items.filter((item) => {
    if (item.type === "goal" && !showGoals) return false
    if (item.type === "milestone" && !showMilestones) return false
    if (item.type === "task" && !showTasks) return false
    return true
  })

  // Group by type
  const goals = filteredItems.filter((i) => i.type === "goal")
  const milestones = filteredItems.filter((i) => i.type === "milestone")
  const tasks = filteredItems.filter((i) => i.type === "task")

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ]

  const getItemPosition = (dateStr: string) => {
    const date = new Date(dateStr)
    const month = date.getMonth()
    const day = date.getDate()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    
    // Calculate position as percentage within the year
    const monthProgress = (day / daysInMonth) * (100 / 12)
    const position = (month / 12) * 100 + monthProgress
    
    return Math.min(Math.max(position, 0), 100)
  }

  const getItemWidth = (item: TimelineItem) => {
    if (!item.endDate || item.startDate === item.endDate) return 2 // Minimum width

    const start = new Date(item.startDate)
    const end = new Date(item.endDate)
    const diffDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    const yearDays = new Date(year, 11, 31).getDate() === 31 ? 365 : 366
    
    return Math.max((diffDays / yearDays) * 100, 2)
  }

  const handleMouseEnter = (item: TimelineItem, e: React.MouseEvent) => {
    setHoveredItem(item)
    setMousePos({ x: e.clientX, y: e.clientY })
  }

  const handleMouseLeave = () => {
    setHoveredItem(null)
  }

  const typeStyles = {
    goal: "bg-blue-500 hover:bg-blue-600",
    milestone: "bg-purple-500 hover:bg-purple-600",
    task: "bg-green-500 hover:bg-green-600",
  }

  const typeLabels = {
    goal: "🎯 Goal",
    milestone: "📍 Milestone",
    task: "✅ Task",
  }

  return (
    <div className="space-y-6">
      {/* Month Headers */}
      <div className="relative">
        <div className="flex border-b pb-2">
          {months.map((month, idx) => (
            <div
              key={idx}
              className="flex-1 text-center text-xs font-semibold text-muted-foreground min-w-[80px]"
            >
              {month}
            </div>
          ))}
        </div>
      </div>

      {/* Timeline Lanes */}
      <div className="space-y-8 overflow-x-auto pb-4">
        {/* Goals Lane */}
        {showGoals && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-semibold">🎯 Goals</span>
              <Badge variant="secondary" className="text-xs">
                {goals.length}
              </Badge>
            </div>
            <div className="relative h-12 bg-muted/20 rounded-lg">
              {goals.map((item) => {
                const left = getItemPosition(item.startDate)
                const width = getItemWidth(item)

                return (
                  <div
                    key={item.id}
                    className={`absolute top-1 h-10 rounded-md ${typeStyles.goal} cursor-pointer transition-all shadow-sm`}
                    style={{
                      left: `${left}%`,
                      width: `${width}%`,
                      minWidth: "60px",
                    }}
                    onMouseEnter={(e) => handleMouseEnter(item, e)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <div className="h-full flex items-center justify-center px-2">
                      <p className="text-xs text-white font-medium truncate">
                        {item.title}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Milestones Lane */}
        {showMilestones && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-semibold">📍 Milestones</span>
              <Badge variant="secondary" className="text-xs">
                {milestones.length}
              </Badge>
            </div>
            <div className="relative h-12 bg-muted/20 rounded-lg">
              {milestones.map((item) => {
                const left = getItemPosition(item.startDate)
                const width = getItemWidth(item)

                return (
                  <div
                    key={item.id}
                    className={`absolute top-1 h-10 rounded-md ${typeStyles.milestone} cursor-pointer transition-all shadow-sm`}
                    style={{
                      left: `${left}%`,
                      width: `${width}%`,
                      minWidth: "50px",
                    }}
                    onMouseEnter={(e) => handleMouseEnter(item, e)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <div className="h-full flex items-center justify-center px-2">
                      <p className="text-xs text-white font-medium truncate">
                        {item.title}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Tasks Lane */}
        {showTasks && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-semibold">✅ Tasks</span>
              <Badge variant="secondary" className="text-xs">
                {tasks.length}
              </Badge>
            </div>
            <div className="relative h-16 bg-muted/20 rounded-lg">
              {tasks.map((item, idx) => {
                const left = getItemPosition(item.startDate)

                return (
                  <div
                    key={item.id}
                    className={`absolute w-2 h-2 rounded-full ${typeStyles.task.split(" ")[0]} cursor-pointer transition-all`}
                    style={{
                      left: `${left}%`,
                      top: `${(idx % 6) * 8 + 4}px`,
                    }}
                    onMouseEnter={(e) => handleMouseEnter(item, e)}
                    onMouseLeave={handleMouseLeave}
                  />
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            선택한 필터에 해당하는 항목이 없습니다
          </p>
        </div>
      )}

      {/* Tooltip */}
      {hoveredItem && (
        <div
          className="fixed z-50 px-3 py-2 bg-popover text-popover-foreground text-sm rounded-lg shadow-lg border pointer-events-none max-w-xs"
          style={{
            left: mousePos.x + 10,
            top: mousePos.y + 10,
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="secondary" className="text-xs">
              {typeLabels[hoveredItem.type]}
            </Badge>
            {hoveredItem.status && (
              <Badge variant="outline" className="text-xs">
                {hoveredItem.status}
              </Badge>
            )}
          </div>
          <p className="font-semibold">{hoveredItem.title}</p>
          <div className="text-xs text-muted-foreground mt-1">
            {new Date(hoveredItem.startDate).toLocaleDateString("ko-KR")}
            {hoveredItem.endDate && hoveredItem.endDate !== hoveredItem.startDate && (
              <>
                {" → "}
                {new Date(hoveredItem.endDate).toLocaleDateString("ko-KR")}
              </>
            )}
          </div>
          {hoveredItem.description && (
            <p className="text-xs mt-2 line-clamp-2">{hoveredItem.description}</p>
          )}
        </div>
      )}
    </div>
  )
}

