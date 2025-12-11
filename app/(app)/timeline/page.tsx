import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TimelineView } from "@/components/timeline/timeline-view"
import { TimelineFilters } from "@/components/timeline/timeline-filters"
import type { TimelineItem } from "@/lib/timeline/types"

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function TimelinePage({ searchParams }: PageProps) {
  const params = await searchParams
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Parse filters
  const year = Number(params.year) || 2026
  const showGoals = params.goals !== "0"
  const showMilestones = params.milestones !== "0"
  const showTasks = params.tasks !== "0"

  // Calculate date range
  const startDateStr = `${year}-01-01`
  const endDateStr = `${year}-12-31`

  // 병렬 쿼리 실행 (필요한 필드만)
  const [goalsRes, milestonesRes, tasksRes] = await Promise.all([
    supabase
      .from("goals")
      .select("id, title, description, status, year")
      .eq("user_id", user.id)
      .eq("year", year),
    supabase
      .from("milestones")
      .select("id, title, description, status, goal_id, start_date, due_date, created_at")
      .eq("user_id", user.id)
      .or(`start_date.gte.${startDateStr},start_date.lte.${endDateStr},due_date.gte.${startDateStr},due_date.lte.${endDateStr}`)
      .limit(200), // 최대 200개
    supabase
      .from("tasks")
      .select("id, title, description, status, priority, goal_id, milestone_id, scheduled_date, due_date, created_at")
      .eq("user_id", user.id)
      .or(`scheduled_date.gte.${startDateStr},scheduled_date.lte.${endDateStr},due_date.gte.${startDateStr},due_date.lte.${endDateStr}`)
      .limit(500), // 최대 500개
  ])

  const goals = goalsRes.data
  const milestones = milestonesRes.data
  const tasks = tasksRes.data

  // Map to TimelineItem
  const timelineItems: TimelineItem[] = []

  // Goals
  if (goals) {
    goals.forEach((goal) => {
      timelineItems.push({
        id: goal.id,
        type: "goal",
        title: goal.title,
        description: goal.description,
        startDate: `${year}-01-01`,
        endDate: `${year}-12-31`,
        status: goal.status,
        goalId: goal.id,
      })
    })
  }

  // Milestones
  if (milestones) {
    milestones.forEach((milestone) => {
      const startDate = milestone.start_date || milestone.due_date || milestone.created_at?.split("T")[0]
      if (startDate) {
        timelineItems.push({
          id: milestone.id,
          type: "milestone",
          title: milestone.title,
          description: milestone.description,
          startDate,
          endDate: milestone.due_date,
          status: milestone.status,
          goalId: milestone.goal_id,
          milestoneId: milestone.id,
        })
      }
    })
  }

  // Tasks
  if (tasks) {
    tasks.forEach((task) => {
      const startDate = task.scheduled_date || task.due_date || task.created_at?.split("T")[0]
      if (startDate) {
        timelineItems.push({
          id: task.id,
          type: "task",
          title: task.title,
          description: task.description,
          startDate,
          endDate: task.due_date,
          status: task.status,
          goalId: task.goal_id,
          milestoneId: task.milestone_id,
        })
      }
    })
  }

  // Sort by date
  timelineItems.sort((a, b) => a.startDate.localeCompare(b.startDate))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Timeline</h1>
        <p className="text-muted-foreground mt-2">
          당신의 목표, 마일스톤, 태스크를 한눈에 보는 {year}년 타임라인
        </p>
      </div>

      {/* Filters */}
      <TimelineFilters
        year={year}
        showGoals={showGoals}
        showMilestones={showMilestones}
        showTasks={showTasks}
      />

      {/* Timeline */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{year} Timeline</CardTitle>
              <CardDescription>
                {timelineItems.length}개 항목 (Goals: {goals?.length || 0} · Milestones:{" "}
                {milestones?.length || 0} · Tasks: {tasks?.length || 0})
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <TimelineView
            items={timelineItems}
            year={year}
            showGoals={showGoals}
            showMilestones={showMilestones}
            showTasks={showTasks}
          />
        </CardContent>
      </Card>

      {/* Legend */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-500" />
              <span className="text-muted-foreground">Goals</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-purple-500" />
              <span className="text-muted-foreground">Milestones</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-muted-foreground">Tasks</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

