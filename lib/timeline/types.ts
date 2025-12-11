export type TimelineItemType = "goal" | "milestone" | "task"

export interface TimelineItem {
  id: string
  type: TimelineItemType
  title: string
  description?: string | null
  startDate: string // ISO date string: 'YYYY-MM-DD'
  endDate?: string | null // optional
  status?: string | null
  goalId?: string | null
  milestoneId?: string | null
}

