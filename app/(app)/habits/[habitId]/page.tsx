import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { HabitCheckinButton } from "@/components/habits/habit-checkin-button"
import { HabitHistoryStrip } from "@/components/habits/habit-history-strip"
import { toggleHabitCheckinAction } from "../actions"

interface PageProps {
  params: Promise<{
    habitId: string
  }>
}

export default async function HabitDetailPage({ params }: PageProps) {
  const { habitId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Fetch habit
  const { data: habit, error } = await supabase
    .from("habits")
    .select("*")
    .eq("id", habitId)
    .eq("user_id", user.id)
    .single()

  if (error || !habit) {
    notFound()
  }

  const today = new Date().toISOString().split("T")[0]

  // Fetch logs (last 90 days)
  const ninetyDaysAgo = new Date()
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)
  const ninetyDaysAgoStr = ninetyDaysAgo.toISOString().split("T")[0]

  const { data: logs } = await supabase
    .from("habit_logs")
    .select("*")
    .eq("habit_id", habitId)
    .gte("log_date", ninetyDaysAgoStr)
    .lte("log_date", today)
    .order("log_date", { ascending: false })

  const logsMap = new Map<string, string>()
  logs?.forEach((log) => {
    logsMap.set(log.log_date, log.status)
  })

  // Calculate stats
  const totalCompletions = logs?.filter((l) => l.status === "done").length || 0

  // Last 30 days completions
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split("T")[0]

  const last30DaysCompletions =
    logs?.filter((l) => l.status === "done" && l.log_date >= thirtyDaysAgoStr)
      .length || 0

  // Calculate streak
  let streak = 0
  const checkDate = new Date(today)

  for (let i = 0; i < 365; i++) {
    const dateStr = checkDate.toISOString().split("T")[0]
    if (logsMap.get(dateStr) === "done") {
      streak++
      checkDate.setDate(checkDate.getDate() - 1)
    } else {
      break
    }
  }

  // Build history for strip (last 90 days)
  const historyDays: { date: string; status: "none" | "done" | "skipped" }[] = []
  for (let i = 89; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split("T")[0]
    const status = logsMap.get(dateStr) === "done" ? "done" : "none"
    historyDays.push({ date: dateStr, status })
  }

  const todayStatus = logsMap.get(today) === "done" ? "done" : "none"

  const dayNames = ["일", "월", "화", "수", "목", "금", "토"]

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div>
        <Link href="/habits">
          <Button variant="ghost" size="sm">
            ← Back to Habits
          </Button>
        </Link>
      </div>

      {/* Habit Header */}
      <div>
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              {habit.title}
            </h1>
            {habit.description && (
              <p className="text-muted-foreground">{habit.description}</p>
            )}
          </div>
          <HabitCheckinButton
            habitId={habitId}
            date={today}
            initialStatus={todayStatus}
            onToggle={toggleHabitCheckinAction}
          />
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="secondary">
            {habit.cadence === "daily" ? "매일" : "매주"}
          </Badge>
          {habit.cadence === "weekly" && habit.days_of_week && (
            <span className="text-sm text-muted-foreground">
              {habit.days_of_week.map((d: number) => dayNames[d]).join(", ")}
            </span>
          )}
          {habit.start_date && (
            <span className="text-sm text-muted-foreground">
              시작: {new Date(habit.start_date).toLocaleDateString("ko-KR")}
            </span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 완료 횟수</CardTitle>
            <span className="text-2xl">✅</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCompletions}</div>
            <p className="text-xs text-muted-foreground">전체 기간</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">최근 30일</CardTitle>
            <span className="text-2xl">📅</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{last30DaysCompletions}</div>
            <p className="text-xs text-muted-foreground">
              {habit.cadence === "daily" && `${Math.round((last30DaysCompletions / 30) * 100)}% 달성`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">연속 기록</CardTitle>
            <span className="text-2xl">🔥</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{streak}</div>
            <p className="text-xs text-muted-foreground">일 연속</p>
          </CardContent>
        </Card>
      </div>

      {/* History */}
      <Card>
        <CardHeader>
          <CardTitle>히스토리</CardTitle>
          <CardDescription>최근 90일간의 완료 기록</CardDescription>
        </CardHeader>
        <CardContent>
          <HabitHistoryStrip days={historyDays} />
          <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm bg-emerald-500" />
              <span>완료</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm bg-muted" />
              <span>미완료</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Logs */}
      {logs && logs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>최근 완료 기록</CardTitle>
            <CardDescription>최근 20개 항목</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {logs.slice(0, 20).map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-2 rounded-lg border"
                >
                  <span className="text-sm">
                    {new Date(log.log_date).toLocaleDateString("ko-KR", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      weekday: "short",
                    })}
                  </span>
                  <Badge
                    variant={log.status === "done" ? "default" : "secondary"}
                    className={log.status === "done" ? "bg-green-600" : ""}
                  >
                    {log.status === "done" ? "✓ 완료" : log.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

