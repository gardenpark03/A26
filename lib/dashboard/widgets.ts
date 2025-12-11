export type WidgetType =
  | "year_progress"
  | "today_tasks"
  | "activity_mood"
  | "quick_memo"

export interface WidgetDefinition {
  type: WidgetType
  label: string
  description: string
  defaultEnabled: boolean
}

export const ALL_WIDGETS: WidgetDefinition[] = [
  {
    type: "year_progress",
    label: "Year Progress",
    description: "2026년 진행률을 확인하세요",
    defaultEnabled: true,
  },
  {
    type: "today_tasks",
    label: "Today's Tasks",
    description: "오늘 완료해야 할 작업 목록",
    defaultEnabled: true,
  },
  {
    type: "activity_mood",
    label: "Activity & Mood",
    description: "최근 12주간의 활동 기록 히트맵",
    defaultEnabled: true,
  },
  {
    type: "quick_memo",
    label: "Quick Memo",
    description: "빠른 메모 작성",
    defaultEnabled: true,
  },
]

export interface DashboardWidget {
  id: string
  user_id: string
  widget_type: WidgetType
  is_enabled: boolean
  sort_order: number
  config: any | null
  created_at: string
  updated_at: string
}

