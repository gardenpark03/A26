export type GraphNodeType =
  | "goal"
  | "milestone"
  | "task"
  | "log"
  | "project"
  | "resource"

export interface GraphNode {
  id: string // global unique: e.g. "goal:uuid", "task:uuid"
  rawId: string // 실제 DB id (uuid)
  type: GraphNodeType
  label: string
  description?: string | null
  meta?: Record<string, any>
}

export interface GraphEdge {
  id: string
  source: string // node.id
  target: string // node.id
  type: string // e.g. "goal-milestone", "goal-task", "task-log", "project-resource"
  meta?: Record<string, any>
}

export interface MemoryGraphData {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

