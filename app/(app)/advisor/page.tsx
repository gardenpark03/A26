import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function AdvisorPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Calculate date ranges
  const today = new Date()
  const sevenDaysAgo = new Date(today)
  sevenDaysAgo.setDate(today.getDate() - 7)
  const thirtyDaysAgo = new Date(today)
  thirtyDaysAgo.setDate(today.getDate() - 30)

  const todayStr = today.toISOString().split("T")[0]
  const sevenDaysAgoStr = sevenDaysAgo.toISOString().split("T")[0]
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split("T")[0]

  // 병렬 쿼리 실행 (필요한 필드만)
  const [goalsRes, tasksRes, logsRes] = await Promise.all([
    supabase
      .from("goals")
      .select("id, status")
      .eq("user_id", user.id),
    supabase
      .from("tasks")
      .select("id, status, priority, due_date, created_at, scheduled_date")
      .eq("user_id", user.id)
      .or(`created_at.gte.${thirtyDaysAgoStr},scheduled_date.gte.${thirtyDaysAgoStr}`)
      .limit(200), // 최대 200개
    supabase
      .from("logs")
      .select("id, title, content, log_date, mood")
      .eq("user_id", user.id)
      .gte("log_date", sevenDaysAgoStr)
      .lte("log_date", todayStr)
      .order("log_date", { ascending: false })
      .limit(50), // 최대 50개
  ])

  const allGoals = goalsRes.data || []
  const allTasks = tasksRes.data || []
  const recentLogs = logsRes.data || []

  const totalGoals = allGoals.length
  const activeGoals = allGoals.filter((g) => g.status === "active").length
  const completedGoals = allGoals.filter((g) => g.status === "completed").length

  const totalTasks = allTasks.length
  const completedTasks = allTasks.filter((t) => t.status === "done").length
  const overdueTasks = allTasks.filter(
    (t) => t.due_date && new Date(t.due_date) < today && t.status !== "done"
  ).length
  const highPriorityOpen = allTasks.filter(
    (t) => t.priority === "high" && t.status !== "done"
  ).length

  const totalLogs = recentLogs.length

  // Check if there's enough data
  const hasEnoughData = totalGoals > 0 || totalTasks > 0 || totalLogs > 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Personal Advisor</h1>
        <p className="text-muted-foreground mt-2">
          최근 일주일 동안의 목표, 태스크, 기록 데이터를 기반으로 코칭 리포트를 생성합니다
        </p>
        <p className="text-sm text-amber-600 mt-2">
          ⚡ 성능 최적화: AI 리포트는 버튼 클릭 시에만 생성됩니다
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">활성 목표</CardTitle>
            <span className="text-2xl">🎯</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeGoals}</div>
            <p className="text-xs text-muted-foreground">
              전체 {totalGoals}개 중
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">완료한 태스크</CardTitle>
            <span className="text-2xl">✅</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTasks}</div>
            <p className="text-xs text-muted-foreground">
              전체 {totalTasks}개 중
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">밀린 작업</CardTitle>
            <span className="text-2xl">⏰</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {overdueTasks}
            </div>
            <p className="text-xs text-muted-foreground">
              주의 필요
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">최근 기록</CardTitle>
            <span className="text-2xl">📝</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLogs}</div>
            <p className="text-xs text-muted-foreground">
              지난 7일간
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Placeholder for future on-demand advisor */}
      {!hasEnoughData ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="text-6xl mb-4">📊</div>
            <p className="text-xl font-semibold mb-2">데이터가 부족합니다</p>
            <p className="text-muted-foreground text-center max-w-md">
              목표를 설정하고, 태스크를 생성하고, 일일 기록을 작성하면
              <br />
              AI가 당신의 상태를 분석하여 맞춤형 조언을 드립니다
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="text-6xl mb-4">🤖</div>
            <p className="text-xl font-semibold mb-2">AI 코칭 리포트</p>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              AI 분석 기능은 버튼 클릭 방식으로 구현 예정입니다
            </p>
            <p className="text-sm text-muted-foreground">
              통계 데이터: 목표 {totalGoals}개 / 태스크 {totalTasks}개 / 기록 {totalLogs}개
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

