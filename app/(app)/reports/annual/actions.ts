"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { generateAnnualReport, type AnnualStats } from "@/lib/ai/annual-report"

export async function generateAnnualReportAction(year: number) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "Unauthorized" }
    }

    // Date range for the year
    const fromDate = `${year}-01-01`
    const toDate = `${year}-12-31`

    // 병렬 쿼리 실행 (필요한 필드만)
    const [goalsRes, tasksRes, logsRes] = await Promise.all([
      supabase
        .from("goals")
        .select("id, status, title")
        .eq("user_id", user.id)
        .eq("year", year),
      supabase
        .from("tasks")
        .select("id, status, due_date, created_at, scheduled_date, title")
        .eq("user_id", user.id)
        .or(`scheduled_date.gte.${fromDate},scheduled_date.lte.${toDate},created_at.gte.${fromDate}T00:00:00,created_at.lte.${toDate}T23:59:59`)
        .limit(2000), // 최대 2000개
      supabase
        .from("logs")
        .select("id, mood, tags, log_date, content, title")
        .eq("user_id", user.id)
        .gte("log_date", fromDate)
        .lte("log_date", toDate)
        .order("log_date", { ascending: false })
        .limit(1000), // 최대 1000개
    ])

    const allGoals = goalsRes.data || []
    const allTasks = tasksRes.data || []
    const allLogs = logsRes.data || []

    const goalsSummary = {
      total: allGoals.length,
      completed: allGoals.filter((g) => g.status === "completed").length,
      inProgress: allGoals.filter((g) => g.status === "active" || g.status === "in_progress").length,
      abandoned: allGoals.filter((g) => g.status === "archived" || g.status === "paused").length,
    }

    const completedTasks = allTasks.filter((t) => t.status === "done").length
    const overdueTasks = allTasks.filter(
      (t) => t.due_date && new Date(t.due_date) < new Date() && t.status !== "done"
    ).length

    // Tasks by month
    const tasksByMonth: { month: number; completed: number; created: number }[] = []
    for (let m = 1; m <= 12; m++) {
      const monthTasks = allTasks.filter((t) => {
        const createdMonth = new Date(t.created_at).getMonth() + 1
        return createdMonth === m
      })
      const completedInMonth = monthTasks.filter((t) => t.status === "done").length

      tasksByMonth.push({
        month: m,
        completed: completedInMonth,
        created: monthTasks.length,
      })
    }

    const tasksSummary = {
      total: allTasks.length,
      completed: completedTasks,
      overdue: overdueTasks,
      byMonth: tasksByMonth,
    }

    const moodsCount: Record<string, number> = {}
    allLogs?.forEach((log) => {
      if (log.mood) {
        moodsCount[log.mood] = (moodsCount[log.mood] || 0) + 1
      }
    })

    // Top tags
    const tagsMap = new Map<string, number>()
    allLogs?.forEach((log) => {
      if (log.tags && Array.isArray(log.tags)) {
        log.tags.forEach((tag: string) => {
          tagsMap.set(tag, (tagsMap.get(tag) || 0) + 1)
        })
      }
    })
    const topTags = Array.from(tagsMap.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Highlight logs (longest or most meaningful)
    const highlightLogs =
      allLogs
        ?.filter((log) => log.content && log.content.length > 100)
        .slice(0, 5)
        .map((log) => {
          const date = new Date(log.log_date).toLocaleDateString("ko-KR")
          return `[${date}] ${log.title || ""}\n${log.content.slice(0, 200)}${log.content.length > 200 ? "..." : ""}`
        }) || []

    const logsSummary = {
      total: allLogs?.length || 0,
      moodsCount,
      topTags,
    }

    // 추가 데이터 병렬 조회 (habits, projects)
    const [habitsRes, habitLogsRes, projectsRes] = await Promise.all([
      supabase
        .from("habits")
        .select("id")
        .eq("user_id", user.id),
      supabase
        .from("habit_logs")
        .select("id, log_date")
        .eq("user_id", user.id)
        .gte("log_date", fromDate)
        .lte("log_date", toDate),
      supabase
        .from("projects")
        .select("id, title, description")
        .eq("user_id", user.id)
        .limit(50), // 최대 50개
    ])

    const allHabits = habitsRes.data || []
    const allHabitLogs = habitLogsRes.data || []
    const allProjects = projectsRes.data || []

    const habitsSummary = {
      totalHabits: allHabits.length,
      totalCheckins: allHabitLogs.length,
      longestStreak: 0, // Simplified for v1
      currentStreak: 0, // Simplified for v1
    }

    const highlightProjects = allProjects
      .map((p) => `${p.title}${p.description ? ` - ${p.description.slice(0, 80)}` : ""}`)
      .slice(0, 5)

    const projectsSummary = {
      totalProjects: allProjects.length,
      activeProjects: allProjects.length,
      completedProjects: 0, // Simplified for v1
    }

    // Build AnnualStats
    const stats: AnnualStats = {
      year,
      goalsSummary,
      tasksSummary,
      logsSummary,
      habitsSummary,
      projectsSummary,
      highlightLogs,
      highlightProjects,
    }

    // Generate report with AI
    const reportPayload = await generateAnnualReport(stats)

    // Save to database (upsert)
    const { error: upsertError } = await supabase
      .from("annual_reports")
      .upsert(
        {
          user_id: user.id,
          year,
          report: reportPayload,
        },
        {
          onConflict: "user_id,year",
        }
      )

    if (upsertError) {
      console.error("Error saving annual report:", upsertError)
      return { error: "리포트 저장 실패" }
    }

    revalidatePath(`/reports/annual`)
    return { success: true }
  } catch (error: any) {
    console.error("Error in generateAnnualReportAction:", error)
    return { error: error.message || "Failed to generate report" }
  }
}

