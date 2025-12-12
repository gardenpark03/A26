import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TaskItem } from "@/components/dashboard/task-item"
import { ProgressBar } from "@/components/dashboard/progress-bar"
import { QuickMemo } from "@/components/dashboard/quick-memo"
import { CommitGraph, type DayActivity } from "@/components/dashboard/commit-graph"
import { MoodLegend } from "@/components/dashboard/mood-legend"
import { ALL_WIDGETS, type WidgetType, type DashboardWidget } from "@/lib/dashboard/widgets"
import type { Task, Log, LogMood } from "@/lib/types"

async function toggleTask(taskId: string, completed: boolean) {
  "use server"

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Unauthorized" }
  }

  const { error } = await supabase
    .from("tasks")
    .update({
      status: completed ? "done" : "todo",
      completed_at: completed ? new Date().toISOString() : null,
    })
    .eq("id", taskId)
    .eq("user_id", user.id)

  if (error) {
    console.error("Error toggling task:", error)
    return { error: error.message }
  }

  return { success: true }
}

async function saveQuickMemo(content: string) {
  "use server"

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Unauthorized" }
  }

  // profiles 테이블의 quick_memo_content에 저장
  const { error } = await supabase
    .from("profiles")
    .update({
      quick_memo_content: content,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)

  if (error) {
    console.error("Error saving quick memo:", error)
    return { error: error.message }
  }

  return { success: true }
}

async function getOrCreateProfile(userId: string, userEmail: string) {
  const supabase = await createClient()

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, full_name, username, quick_memo_content")
    .eq("id", userId)
    .single()

  if (profile) {
    return profile
  }

  if (profileError?.code === "PGRST116") {
    const username = userEmail.split("@")[0]
    const { data: newProfile, error: insertError } = await supabase
      .from("profiles")
      .insert({
        id: userId,
        username,
        full_name: username,
      })
      .select("id, full_name, username, quick_memo_content")
      .single()

    if (insertError) {
      return null
    }

    return newProfile
  }

  return null
}

function calculateActivityData(logs: Log[]): DayActivity[] {
  const dateMap = new Map<string, { logs: Log[]; moods: LogMood[] }>()

  logs.forEach((log) => {
    const dateStr = log.log_date
    if (!dateMap.has(dateStr)) {
      dateMap.set(dateStr, { logs: [], moods: [] })
    }
    const entry = dateMap.get(dateStr)!
    entry.logs.push(log)
    if (log.mood) {
      entry.moods.push(log.mood)
    }
  })

  const activities: DayActivity[] = []

  dateMap.forEach((value, date) => {
    const count = value.logs.length
    let mood: LogMood | null = null

    if (value.moods.length > 0) {
      const moodScores: Record<LogMood, number> = {
        very_bad: -2,
        bad: -1,
        neutral: 0,
        good: 1,
        very_good: 2,
      }

      const totalScore = value.moods.reduce((sum, m) => sum + moodScores[m], 0)
      const avgScore = totalScore / value.moods.length

      if (avgScore <= -1.5) mood = "very_bad"
      else if (avgScore <= -0.5) mood = "bad"
      else if (avgScore <= 0.5) mood = "neutral"
      else if (avgScore <= 1.5) mood = "good"
      else mood = "very_good"
    }

    activities.push({ date, count, mood })
  })

  return activities
}

async function getWidgetSettings(userId: string): Promise<DashboardWidget[]> {
  const supabase = await createClient()

  const { data: widgets } = await supabase
    .from("dashboard_widgets")
    .select("*")
    .eq("user_id", userId)
    .order("sort_order", { ascending: true })

  if (widgets && widgets.length > 0) {
    return widgets as DashboardWidget[]
  }

  // Return default widgets (not saved to DB yet)
  return ALL_WIDGETS.map((w, idx) => ({
    id: `default-${w.type}`,
    user_id: userId,
    widget_type: w.type,
    is_enabled: w.defaultEnabled,
    sort_order: idx,
    config: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }))
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const today = new Date().toISOString().split("T")[0]
  const todayDate = new Date()
  const startDate = new Date(todayDate)
  startDate.setDate(todayDate.getDate() - 83)
  const startDateStr = startDate.toISOString().split("T")[0]

  // 병렬 쿼리 실행 (4개 쿼리를 동시에)
  const [profile, widgetSettings, tasksRes, activityLogsRes] = await Promise.all([
    getOrCreateProfile(user.id, user.email || ""),
    getWidgetSettings(user.id),
    supabase
      .from("tasks")
      .select("id, title, status, priority, scheduled_date, goal_id, milestone_id, created_at")
      .eq("user_id", user.id)
      .eq("scheduled_date", today)
      .order("priority", { ascending: false })
      .order("created_at", { ascending: true })
      .limit(50), // 최대 50개로 제한
    supabase
      .from("logs")
      .select("log_date, mood")
      .eq("user_id", user.id)
      .gte("log_date", startDateStr)
      .lte("log_date", today)
      .limit(200), // 최대 200개로 제한
  ])

  const enabledWidgets = widgetSettings.filter((w) => w.is_enabled)
  const todayTasks = (tasksRes.data as Task[]) || []
  const completedTasks = todayTasks.filter((task) => task.status === "done").length
  const totalTasks = todayTasks.length
  const activityData = calculateActivityData((activityLogsRes.data as Log[]) || [])

  // Widget rendering function
  const renderWidget = (widgetType: WidgetType) => {
    switch (widgetType) {
      case "year_progress":
        return <ProgressBar key="year_progress" year={2026} />

      case "today_tasks":
        return (
          <Card key="today_tasks" className="bg-brand-mist/20 border-brand-mist/20 shadow-none">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-brand-ink">Today's Tasks</CardTitle>
                  <CardDescription>
                    오늘 완료해야 할 작업들 ({completedTasks}/{totalTasks} 완료)
                  </CardDescription>
                </div>
                {totalTasks > 0 && (
                  <div className="text-right">
                    <div className="text-2xl font-bold text-brand-ink">
                      {Math.round((completedTasks / totalTasks) * 100)}%
                    </div>
                    <div className="text-xs text-muted-foreground">완료율</div>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {todayTasks.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-2">
                    오늘 예정된 작업이 없습니다
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <a href="/goals" className="text-primary hover:underline">
                      목표 페이지
                    </a>
                    에서 새로운 작업을 추가해보세요
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {todayTasks.map((task) => (
                    <TaskItem key={task.id} task={task} onToggle={toggleTask} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )

      case "activity_mood":
        return (
          <Card key="activity_mood" className="bg-brand-cloud/60 border-white shadow-sm">
            <CardHeader>
              <CardTitle>Activity & Mood Tracker</CardTitle>
              <CardDescription>
                최근 12주간의 활동 기록 (로그 작성 패턴 + 기분 추이)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <CommitGraph days={activityData} />
              <MoodLegend />
            </CardContent>
          </Card>
        )

      case "quick_memo":
        return (
          <Card key="quick_memo" className="bg-brand-peach/20 border-brand-peach/30 shadow-none">
            <QuickMemo 
              onSave={saveQuickMemo} 
              initialContent={profile?.quick_memo_content || ""}
            />
          </Card>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {profile?.full_name || profile?.username || "User"}!
          </h1>
          <p className="text-muted-foreground mt-1">
            {new Date().toLocaleDateString("ko-KR", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <Link href="/dashboard/customize">
          <Button variant="outline" size="sm">
            ⚙️ 커스터마이즈
          </Button>
        </Link>
      </div>

      {/* Dynamic Widgets */}
      <div className="grid grid-cols-1 gap-6">
        {enabledWidgets.map((widget) => renderWidget(widget.widget_type))}
      </div>

      {/* Empty State */}
      {enabledWidgets.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="text-6xl mb-4">🎨</div>
            <p className="text-xl font-semibold mb-2">위젯이 비어있습니다</p>
            <p className="text-muted-foreground mb-6">
              대시보드를 커스터마이즈하여 위젯을 추가해보세요
            </p>
            <Link href="/dashboard/customize">
              <Button>커스터마이즈하기</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
