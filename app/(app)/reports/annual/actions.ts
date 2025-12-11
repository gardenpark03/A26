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

    // Fetch Goals
    const { data: allGoals } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", user.id)
      .eq("year", year)

    const goalsSummary = {
      total: allGoals?.length || 0,
      completed: allGoals?.filter((g) => g.status === "completed").length || 0,
      inProgress: allGoals?.filter((g) => g.status === "active" || g.status === "in_progress").length || 0,
      abandoned: allGoals?.filter((g) => g.status === "archived" || g.status === "paused").length || 0,
    }

    // Fetch Tasks
    const { data: allTasks } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id)
      .or(`scheduled_date.gte.${fromDate},scheduled_date.lte.${toDate},created_at.gte.${fromDate}T00:00:00,created_at.lte.${toDate}T23:59:59`)

    const completedTasks = allTasks?.filter((t) => t.status === "done").length || 0
    const overdueTasks =
      allTasks?.filter(
        (t) => t.due_date && new Date(t.due_date) < new Date() && t.status !== "done"
      ).length || 0

    // Tasks by month
    const tasksByMonth: { month: number; completed: number; created: number }[] = []
    for (let m = 1; m <= 12; m++) {
      const monthTasks = allTasks?.filter((t) => {
        const createdMonth = new Date(t.created_at).getMonth() + 1
        return createdMonth === m
      }) || []
      const completedInMonth = monthTasks.filter((t) => t.status === "done").length

      tasksByMonth.push({
        month: m,
        completed: completedInMonth,
        created: monthTasks.length,
      })
    }

    const tasksSummary = {
      total: allTasks?.length || 0,
      completed: completedTasks,
      overdue: overdueTasks,
      byMonth: tasksByMonth,
    }

    // Fetch Logs
    const { data: allLogs } = await supabase
      .from("logs")
      .select("*")
      .eq("user_id", user.id)
      .gte("log_date", fromDate)
      .lte("log_date", toDate)
      .order("log_date", { ascending: false })

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

    // Fetch Habits
    const { data: allHabits } = await supabase
      .from("habits")
      .select("*")
      .eq("user_id", user.id)

    const { data: allHabitLogs } = await supabase
      .from("habit_logs")
      .select("*")
      .eq("user_id", user.id)
      .gte("log_date", fromDate)
      .lte("log_date", toDate)

    const habitsSummary = {
      totalHabits: allHabits?.length || 0,
      totalCheckins: allHabitLogs?.length || 0,
      longestStreak: 0, // Simplified for v1
      currentStreak: 0, // Simplified for v1
    }

    // Fetch Projects
    const { data: allProjects } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", user.id)

    const highlightProjects =
      allProjects?.map((p) => `${p.title}${p.description ? ` - ${p.description.slice(0, 80)}` : ""}`).slice(0, 5) || []

    const projectsSummary = {
      totalProjects: allProjects?.length || 0,
      activeProjects: allProjects?.length || 0,
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

