import { redirect } from "next/navigation"
import dynamic from "next/dynamic"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import type { MemoryGraphData, GraphNode, GraphEdge } from "@/lib/memory-graph/types"

// GraphView를 동적 import로 처리 (SSR 비활성화)
const GraphView = dynamic(
  () => import("@/components/memory-graph/graph-view").then(mod => ({ default: mod.GraphView })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-[600px]">
        <div className="animate-pulse text-muted-foreground">
          그래프 로딩 중...
        </div>
      </div>
    ),
  }
)

export default async function MemoryGraphPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // 병렬 쿼리 실행 (필요한 필드만 선택)
  const [goalsRes, milestonesRes, tasksRes, logsRes, projectsRes, resourcesRes] = await Promise.all([
    supabase
      .from("goals")
      .select("id, title, description, year, status")
      .eq("user_id", user.id)
      .limit(50), // 최대 50개로 제한
    supabase
      .from("milestones")
      .select("id, title, description, goal_id, status, due_date")
      .eq("user_id", user.id)
      .limit(150), // 150개로 제한
    supabase
      .from("tasks")
      .select("id, title, description, goal_id, milestone_id, status, priority, scheduled_date")
      .eq("user_id", user.id)
      .limit(300), // 300개로 제한
    supabase
      .from("logs")
      .select("id, title, content, log_date, mood, tags, related_goal_id, related_milestone_id, related_task_id")
      .eq("user_id", user.id)
      .order("log_date", { ascending: false })
      .limit(150), // 150개로 제한
    supabase
      .from("projects")
      .select("id, title, description, color")
      .eq("user_id", user.id)
      .limit(30), // 최대 30개로 제한
    supabase
      .from("project_resources")
      .select("id, title, content, url, project_id, resource_type, tags")
      .eq("user_id", user.id)
      .limit(200), // 200개로 제한
  ])

  const goals = goalsRes.data
  const milestones = milestonesRes.data
  const tasks = tasksRes.data
  const logs = logsRes.data
  const projects = projectsRes.data
  const resources = resourcesRes.data

  // Build graph data
  const nodes: GraphNode[] = []
  const edges: GraphEdge[] = []

  // Add Goals as nodes
  goals?.forEach((goal) => {
    nodes.push({
      id: `goal:${goal.id}`,
      rawId: goal.id,
      type: "goal",
      label: goal.title,
      description: goal.description,
      meta: { year: goal.year, status: goal.status },
    })
  })

  // Add Milestones as nodes + edges to goals
  milestones?.forEach((milestone) => {
    nodes.push({
      id: `ms:${milestone.id}`,
      rawId: milestone.id,
      type: "milestone",
      label: milestone.title,
      description: milestone.description,
      meta: {
        goalId: milestone.goal_id,
        status: milestone.status,
        due_date: milestone.due_date,
      },
    })

    if (milestone.goal_id) {
      edges.push({
        id: `goal:${milestone.goal_id}->ms:${milestone.id}`,
        source: `goal:${milestone.goal_id}`,
        target: `ms:${milestone.id}`,
        type: "goal-milestone",
      })
    }
  })

  // Add Tasks as nodes + edges to goals/milestones
  tasks?.forEach((task) => {
    nodes.push({
      id: `task:${task.id}`,
      rawId: task.id,
      type: "task",
      label: task.title,
      description: task.description,
      meta: {
        goalId: task.goal_id,
        milestoneId: task.milestone_id,
        status: task.status,
        priority: task.priority,
        scheduled_date: task.scheduled_date,
      },
    })

    if (task.goal_id) {
      edges.push({
        id: `goal:${task.goal_id}->task:${task.id}`,
        source: `goal:${task.goal_id}`,
        target: `task:${task.id}`,
        type: "goal-task",
      })
    }

    if (task.milestone_id) {
      edges.push({
        id: `ms:${task.milestone_id}->task:${task.id}`,
        source: `ms:${task.milestone_id}`,
        target: `task:${task.id}`,
        type: "milestone-task",
      })
    }
  })

  // Add Logs as nodes + edges to goals/milestones/tasks
  logs?.forEach((log) => {
    nodes.push({
      id: `log:${log.id}`,
      rawId: log.id,
      type: "log",
      label: log.title || "(제목 없음)",
      description: log.content?.slice(0, 100),
      meta: {
        log_date: log.log_date,
        mood: log.mood,
        tags: log.tags,
      },
    })

    if (log.related_goal_id) {
      edges.push({
        id: `goal:${log.related_goal_id}->log:${log.id}`,
        source: `goal:${log.related_goal_id}`,
        target: `log:${log.id}`,
        type: "goal-log",
      })
    }

    if (log.related_milestone_id) {
      edges.push({
        id: `ms:${log.related_milestone_id}->log:${log.id}`,
        source: `ms:${log.related_milestone_id}`,
        target: `log:${log.id}`,
        type: "milestone-log",
      })
    }

    if (log.related_task_id) {
      edges.push({
        id: `task:${log.related_task_id}->log:${log.id}`,
        source: `task:${log.related_task_id}`,
        target: `log:${log.id}`,
        type: "task-log",
      })
    }
  })

  // Add Projects as nodes
  projects?.forEach((project) => {
    nodes.push({
      id: `proj:${project.id}`,
      rawId: project.id,
      type: "project",
      label: project.title,
      description: project.description,
      meta: { color: project.color },
    })
  })

  // Add Resources as nodes + edges to projects
  resources?.forEach((resource) => {
    nodes.push({
      id: `res:${resource.id}`,
      rawId: resource.id,
      type: "resource",
      label: resource.title || "(제목 없음)",
      description: resource.content?.slice(0, 100) || resource.url,
      meta: {
        projectId: resource.project_id,
        resourceType: resource.resource_type,
        tags: resource.tags,
      },
    })

    if (resource.project_id) {
      edges.push({
        id: `proj:${resource.project_id}->res:${resource.id}`,
        source: `proj:${resource.project_id}`,
        target: `res:${resource.id}`,
        type: "project-resource",
      })
    }
  })

  // Optional: Tag-based edges (resource ↔ log)
  resources?.forEach((resource) => {
    if (!resource.tags || resource.tags.length === 0) return

    let connectionCount = 0
    logs?.some((log) => {
      if (!log.tags || log.tags.length === 0) return false
      if (connectionCount >= 3) return true // Max 3 connections per resource

      const commonTags = resource.tags.filter((tag: string) =>
        log.tags.includes(tag)
      )

      if (commonTags.length > 0) {
        edges.push({
          id: `res:${resource.id}->log:${log.id}:tag`,
          source: `res:${resource.id}`,
          target: `log:${log.id}`,
          type: "resource-log-tag",
          meta: { commonTags },
        })
        connectionCount++
      }

      return false
    })
  })

  const graphData: MemoryGraphData = { nodes, edges }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Memory Graph</h1>
        <p className="text-muted-foreground mt-2">
          목표, 태스크, 기록, 프로젝트가 서로 어떻게 연결되어 있는지 한눈에 확인하세요
        </p>
      </div>

      {/* Graph */}
      <Card>
        <CardContent className="pt-6">
          <GraphView
            data={graphData}
            initialVisibleTypes={["goal", "milestone", "task", "log", "project", "resource"]}
          />
        </CardContent>
      </Card>
    </div>
  )
}

