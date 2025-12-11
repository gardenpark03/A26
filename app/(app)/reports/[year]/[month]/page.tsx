import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/reports/stat-card"
import { SummaryCard } from "@/components/reports/summary-card"
import { generateMonthlyReport, type MonthlyStats } from "@/lib/ai/monthly-report"

interface PageProps {
  params: Promise<{
    year: string
    month: string
  }>
}

export default async function MonthlyReportPage({ params }: PageProps) {
  const { year: yearStr, month: monthStr } = await params
  const year = parseInt(yearStr)
  const month = parseInt(monthStr)

  // Validate year and month
  if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
    notFound()
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Calculate date range for the month
  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 0, 23, 59, 59) // Last day of the month
  const startDateStr = startDate.toISOString().split("T")[0]
  const endDateStr = endDate.toISOString().split("T")[0]

  // Fetch tasks data
  const { data: completedTasks } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", user.id)
    .gte("completed_at", startDate.toISOString())
    .lte("completed_at", endDate.toISOString())

  const { data: allTasks } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", user.id)
    .or(`scheduled_date.gte.${startDateStr},scheduled_date.lte.${endDateStr}`)

  const completedTaskCount = completedTasks?.length || 0
  const totalTaskCount = allTasks?.length || 0
  const highPriorityCompletedCount =
    completedTasks?.filter((t) => t.priority === "high").length || 0

  // Fetch logs data
  const { data: logs } = await supabase
    .from("logs")
    .select("*")
    .eq("user_id", user.id)
    .gte("log_date", startDateStr)
    .lte("log_date", endDateStr)
    .order("log_date", { ascending: true })

  // Combine logs content (limit to 3000 chars for AI)
  const logsTextSample = logs
    ?.map((log) => `[${log.log_date}] ${log.title || ""}\n${log.content}`)
    .join("\n\n")
    .slice(0, 3000) || ""

  // Calculate completion rate
  const completionRate =
    totalTaskCount > 0 ? Math.round((completedTaskCount / totalTaskCount) * 100) : 0

  // Prepare stats for AI
  const stats: MonthlyStats = {
    year,
    month,
    completedTaskCount,
    totalTaskCount,
    highPriorityCompletedCount,
    logsTextSample,
  }

  // Check if there's enough data
  const hasEnoughData = completedTaskCount > 0 || (logs && logs.length > 0)

  let report = null
  let error = null

  if (hasEnoughData) {
    try {
      report = await generateMonthlyReport(stats)
    } catch (err: any) {
      console.error("Error generating report:", err)
      error = err.message
    }
  }

  const monthName = new Date(year, month - 1).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Monthly Report</h1>
          <p className="text-muted-foreground mt-2">{monthName}</p>
        </div>
        <Link href="/dashboard">
          <Button variant="outline">← Dashboard</Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="총 태스크"
          value={totalTaskCount}
          icon="📋"
          description="이번 달 예정된 태스크"
        />
        <StatCard
          label="완료한 태스크"
          value={completedTaskCount}
          icon="✅"
          description={`${completionRate}% 달성`}
        />
        <StatCard
          label="우선순위 높음"
          value={highPriorityCompletedCount}
          icon="🔥"
          description="완료된 중요 태스크"
        />
        <StatCard
          label="작성한 기록"
          value={logs?.length || 0}
          icon="📝"
          description="Daily Logs"
        />
      </div>

      {/* No Data Message */}
      {!hasEnoughData && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="text-6xl mb-4">📊</div>
            <p className="text-xl font-semibold mb-2">데이터가 부족합니다</p>
            <p className="text-muted-foreground text-center max-w-md">
              이번 달에는 완료된 태스크나 작성된 기록이 없어서 AI 리포트를 생성할 수 없습니다.
              <br />
              더 많은 활동을 기록하고 다시 확인해보세요!
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

      {/* AI Report */}
      {report && (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🤖</span>
            <h2 className="text-2xl font-bold">AI 분석 리포트</h2>
          </div>

          {/* Month Summary */}
          <SummaryCard
            title="이번 달 요약"
            content={report.monthSummary}
            icon="📝"
            variant="default"
          />

          <div className="grid gap-6 md:grid-cols-2">
            {/* Highlights */}
            <SummaryCard
              title="잘한 점"
              content={report.highlights}
              icon="🌟"
              variant="highlight"
            />

            {/* Challenges */}
            <SummaryCard
              title="개선이 필요한 점"
              content={report.challenges}
              icon="💪"
              variant="challenge"
            />
          </div>

          {/* Next Month Suggestions */}
          <SummaryCard
            title="다음 달 제안"
            content={report.nextMonthSuggestions}
            icon="🎯"
            variant="suggestion"
          />

          {/* Meta Info */}
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span>🤖</span>
                  <span>
                    이 리포트는 Claude AI가 당신의 {completedTaskCount}개 완료
                    태스크와 {logs?.length || 0}개 일일 기록을 분석하여
                    생성했습니다.
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Navigation */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/dashboard" className="flex-1">
              <Button variant="outline" className="w-full">
                대시보드로 돌아가기
              </Button>
            </Link>
            <Link href="/goals" className="flex-1">
              <Button variant="outline" className="w-full">
                목표 관리
              </Button>
            </Link>
            <Link href="/logs" className="flex-1">
              <Button variant="outline" className="w-full">
                일일 기록
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

