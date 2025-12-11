export type ShowcaseItemType = "goal" | "log" | "project"

export interface ShowcaseItemResolved {
  id: string
  type: ShowcaseItemType
  title: string
  description?: string | null
  isPinned: boolean
  orderIndex: number
  meta?: {
    year?: number
    date?: string
    status?: string
    tags?: string[]
  }
}

export interface ShowcaseItem {
  id: string
  user_id: string
  item_type: ShowcaseItemType
  item_id: string
  title_override: string | null
  description_override: string | null
  order_index: number
  is_pinned: boolean
  created_at: string
  updated_at: string
}

