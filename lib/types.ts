// Database Types
export type GoalStatus = 'active' | 'paused' | 'completed' | 'archived'
export type MilestoneStatus = 'pending' | 'in_progress' | 'completed'
export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'blocked'
export type TaskPriority = 'low' | 'normal' | 'high'
export type TaskSource = 'ai' | 'manual' | 'fork'
export type LogMood = 'very_bad' | 'bad' | 'neutral' | 'good' | 'very_good'
export type LogVisibility = 'private' | 'public'

export interface Profile {
  id: string
  username: string | null
  full_name: string | null
  avatar_url: string | null
  timezone: string
  onboarding_completed_at: string | null
  created_at: string
  updated_at: string
}

export interface Goal {
  id: string
  user_id: string
  title: string
  description: string | null
  year: number
  status: GoalStatus
  ai_metadata: any | null
  created_at: string
  updated_at: string
  archived_at: string | null
}

export interface Milestone {
  id: string
  user_id: string
  goal_id: string
  title: string
  description: string | null
  start_date: string | null
  due_date: string | null
  order_index: number | null
  status: MilestoneStatus
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  user_id: string
  goal_id: string | null
  milestone_id: string | null
  title: string
  description: string | null
  scheduled_date: string | null
  due_date: string | null
  status: TaskStatus
  priority: TaskPriority
  source: TaskSource
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface Log {
  id: string
  user_id: string
  title: string | null
  content: string
  log_date: string
  mood: LogMood | null
  visibility: LogVisibility
  related_goal_id: string | null
  related_milestone_id: string | null
  related_task_id: string | null
  ai_summary: any | null
  created_at: string
  updated_at: string
}

