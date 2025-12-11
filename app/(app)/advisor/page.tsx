import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AdvisorView } from "@/components/advisor/advisor-view"
import { generateAdvisorReport, type AdvisorContextStats } from "@/lib/ai/advisor"

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

  // Fetch Goals
  const { data: allGoals } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", user.id)

  const totalGoals = allGoals?.length || 0
  const activeGoals = allGoals?.filter((g) => g.status === "active").length || 0
  const completedGoals = allGoals?.filter((g) => g.status === "completed").length || 0

  // Fetch Tasks (last 30 days)
  const { data: allTasks } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", user.id)
    .or(`created_at.gte.${thirtyDaysAgoStr},scheduled_date.gte.${thirtyDaysAgoStr}`)

  const totalTasks = allTasks?.length || 0
  const completedTasks = allTasks?.filter((t) => t.status === "done").length || 0
  const overdueTasks =
    allTasks?.filter(
      (t) =>
        t.due_date &&
        new Date(t.due_date) < today &&
        t.status !== "done"
    ).length || 0
  const highPriorityOpen =
    allTasks?.filter((t) => t.priority === "high" && t.status !== "done").length || 0

  // Fetch Logs (last 7 days)
  const { data: recentLogs } = await supabase
    .from("logs")
    .select("*")
    .eq("user_id", user.id)
    .gte("log_date", sevenDaysAgoStr)
    .lte("log_date", todayStr)
    .order("log_date", { ascending: false })

  const totalLogs = recentLogs?.length || 0

  // Count moods
  const moodsCount: Record<string, number> = {}
  recentLogs?.forEach((log) => {
    if (log.mood) {
      moodsCount[log.mood] = (moodsCount[log.mood] || 0) + 1
    }
  })

  // Get recent log snippets
  const recentLogSnippets = recentLogs
    ?.slice(0, 5)
    .map((log) => {
      const date = new Date(log.log_date).toLocaleDateString("ko-KR")
      const content = log.content.slice(0, 150)
      return `[${date}] ${log.title || "(제목 없음)"}\n${content}${log.content.length > 150 ? "..." : ""}`
    }) || []

  // Build context stats
  const stats: AdvisorContextStats = {
    periodLabel: "last_7_days",
    goalsSummary: {
      totalGoals,
      activeGoals,
      completedGoals,
    },
    tasksSummary: {
      totalTasks,
      completedTasks,
      overdueTasks,
      highPriorityOpen,
    },
    logsSummary: {
      totalLogs,
      moodsCount,
    },
    recentLogSnippets,
  }

  // Check if there's enough data
  const hasEnoughData = totalGoals > 0 || totalTasks > 0 || totalLogs > 0

  let advisorResult = null
  let error = null

  if (hasEnoughData) {
    try {
      advisorResult = await generateAdvisorReport(stats)
    } catch (err: any) {
      console.error("Error generating advisor report:", err)
      error = err.message
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Personal Advisor</h1>
        <p className="text-muted-foreground mt-2">
          최근 일주일 동안의 목표, 태스크, 기록 데이터를 기반으로 코칭 리포트를 생성합니다
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

      {/* No Data Message */}
      {!hasEnoughData && (
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
      )}

      {/* Error Message */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="font-semibold text-destructive">
                  리포트 생성 중 오류가 발생했습니다
                </p>
                <p className="text-sm text-muted-foreground mt-1">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Advisor Report */}
      {advisorResult && (
        <div>
          <div className="flex items-center gap-2 mb-6">
            <span className="text-2xl">🤖</span>
            <h2 className="text-2xl font-bold">AI 코칭 리포트</h2>
          </div>
          <AdvisorView result={advisorResult} />
        </div>
      )}
    </div>
  )
}

