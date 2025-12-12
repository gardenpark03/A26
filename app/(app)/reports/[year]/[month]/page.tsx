import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/reports/stat-card"
import { Lock, Sparkles } from "lucide-react"

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
  const endDate = new Date(year, month, 0, 23, 59, 59)
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

  // Calculate completion rate
  const completionRate =
    totalTaskCount > 0 ? Math.round((completedTaskCount / totalTaskCount) * 100) : 0

  // AI Reporting is currently disabled / Premium only
  const hasEnoughData = completedTaskCount > 0 || (logs && logs.length > 0)

  const monthName = new Date(year, month - 1).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
  })

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <span className="text-sm font-semibold text-primary uppercase tracking-wider">Analytics</span>
          </div>
          <h1 className="text-page-title">Monthly Report</h1>
          <p className="text-body mt-1">{monthName}의 기록과 성장 데이터입니다.</p>
        </div>
        <Link href="/dashboard">
          <Button variant="outline" size="sm">← Back</Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Tasks"
          value={totalTaskCount}
          icon="📋"
          description="예정된 작업"
        />
        <StatCard
          label="Completed"
          value={completedTaskCount}
          icon="✅"
          description={`${completionRate}% 완료율`}
        />
        <StatCard
          label="Focus Work"
          value={highPriorityCompletedCount}
          icon="🔥"
          description="중요 목표 달성"
        />
        <StatCard
          label="Daily Logs"
          value={logs?.length || 0}
          icon="📝"
          description="기록된 하루"
        />
      </div>

      {/* Premium Feature Block (AI Analysis) */}
      <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-1">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
        <Card className="border-0 bg-background/60 backdrop-blur-sm shadow-none">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                    <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                    Unlock AI Analysis
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
                    AI가 당신의 한 달을 분석하여 의미 있는 패턴과 성장 포인트를 찾아줍니다.<br/>
                    Premium 플랜에서 더 깊은 통찰력을 얻으세요.
                </p>
                <div className="flex gap-3 pt-4">
                    <Button className="shadow-lg shadow-primary/20">
                        <Lock className="w-4 h-4 mr-2" />
                        Upgrade to Premium
                    </Button>
                    <Button variant="outline">Learn More</Button>
                </div>
            </CardContent>
        </Card>
      </div>

      {/* Navigation */}
      <div className="flex justify-end pt-4">
         <div className="text-xs text-muted-foreground">
            Archive 26 • Life OS v2.0
         </div>
      </div>
    </div>
  )
}
