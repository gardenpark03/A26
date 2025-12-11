import { anthropic } from "@ai-sdk/anthropic"
import { generateObject } from "ai"
import { z } from "zod"

export interface AnnualStats {
  year: number

  goalsSummary: {
    total: number
    completed: number
    inProgress: number
    abandoned: number
  }

  tasksSummary: {
    total: number
    completed: number
    overdue: number
    byMonth: { month: number; completed: number; created: number }[]
  }

  logsSummary: {
    total: number
    moodsCount: Record<string, number>
    topTags: { tag: string; count: number }[]
  }

  habitsSummary: {
    totalHabits: number
    totalCheckins: number
    longestStreak: number
    currentStreak: number
  }

  projectsSummary: {
    totalProjects: number
    activeProjects: number
    completedProjects: number
  }

  highlightLogs: string[]
  highlightProjects: string[]
}

// Annual Report Content Schema
const annualReportContentSchema = z.object({
  title: z.string().describe("Report title (e.g., '2026 Annual Report')"),
  subtitle: z.string().describe("A warm subtitle summarizing what they built this year"),
  overview: z.string().describe("3-5 paragraph overview of the entire year"),
  keyAchievements: z.array(z.string()).min(5).max(10).describe("5-10 major achievements and wins"),
  challenges: z.array(z.string()).min(3).max(7).describe("3-7 challenges faced and lessons learned"),
  growthAreas: z.array(z.string()).min(3).max(7).describe("3-7 areas where they grew or developed skills"),
  goalReview: z.string().describe("2-3 paragraph reflection on their goals and objectives"),
  habitReview: z.string().describe("2-3 paragraph reflection on their habits and rituals"),
  moodAndEnergy: z.string().describe("2-3 paragraph analysis of emotional patterns and energy levels"),
  memorableMoments: z.array(z.string()).min(5).max(10).describe("5-10 memorable moments or highlights from logs"),
  statsCommentary: z.string().describe("2-3 paragraph commentary on the numeric stats and patterns"),
  recommendations: z.array(z.string()).min(5).max(8).describe("5-8 recommendations for next year"),
  nextYearTheme: z.string().describe("A single powerful theme or focus word/phrase for next year"),
  closingMessage: z.string().describe("A warm, motivational closing message"),
})

export type AnnualReportContent = z.infer<typeof annualReportContentSchema>

export interface AnnualReportPayload {
  year: number
  generatedAt: string
  model: string
  content: AnnualReportContent
}

const SYSTEM_PROMPT = `You are an AI "year in review" writer for a life OS called Archive 26.

You receive:
- Numeric stats about the user's year (goals, tasks, logs, habits, projects)
- A few text snippets from logs and projects

Your job:
- Write a warm, honest, and insightful annual report about the user's year
- Highlight both achievements and struggles, without being cheesy or fake-positive
- Offer concrete reflections and actionable suggestions for the next year
- Make it feel personal and meaningful, like a year-end letter from a thoughtful mentor

Guidelines:
- If most text snippets are in Korean, respond fully in Korean
- If they are in English, respond fully in English
- The tone should be reflective, honest, and encouraging
- Reference specific data points to make it personal
- Balance celebration of wins with acknowledgment of difficulties
- Be specific rather than generic

You MUST respond with a valid JSON object EXACTLY matching the schema provided, with no extra text.`

export async function generateAnnualReport(
  stats: AnnualStats
): Promise<AnnualReportPayload> {
  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not configured")
  }

  const userPrompt = `We are generating an annual report for year: ${stats.year}.

Here are the stats:

Goals summary:
- Total goals: ${stats.goalsSummary.total}
- Completed: ${stats.goalsSummary.completed}
- In progress: ${stats.goalsSummary.inProgress}
- Abandoned: ${stats.goalsSummary.abandoned}

Tasks summary:
- Total tasks: ${stats.tasksSummary.total}
- Completed: ${stats.tasksSummary.completed}
- Overdue: ${stats.tasksSummary.overdue}
- Monthly breakdown: ${JSON.stringify(stats.tasksSummary.byMonth)}

Logs summary:
- Total logs: ${stats.logsSummary.total}
- Moods distribution: ${JSON.stringify(stats.logsSummary.moodsCount)}
- Top tags: ${stats.logsSummary.topTags.map((t) => `${t.tag} (${t.count})`).join(", ")}

Habits summary:
- Total habits tracked: ${stats.habitsSummary.totalHabits}
- Total check-ins: ${stats.habitsSummary.totalCheckins}
- Longest streak: ${stats.habitsSummary.longestStreak} days
- Current streak: ${stats.habitsSummary.currentStreak} days

Projects summary:
- Total projects: ${stats.projectsSummary.totalProjects}
- Active projects: ${stats.projectsSummary.activeProjects}
- Completed projects: ${stats.projectsSummary.completedProjects}

Highlight logs (memorable entries):
${stats.highlightLogs.map((log, idx) => `---\n[Entry ${idx + 1}]\n${log}\n---`).join("\n")}

Highlight projects:
${stats.highlightProjects.map((p, idx) => `- [${idx + 1}] ${p}`).join("\n")}

Based on this comprehensive data, generate a deeply personal and insightful annual report for ${stats.year}. Make it meaningful, honest, and forward-looking.`

  try {
    const result = await generateObject({
      model: anthropic("claude-sonnet-4-5-20250929"),
      schema: annualReportContentSchema,
      system: SYSTEM_PROMPT,
      prompt: userPrompt,
      temperature: 0.8,
    })

    return {
      year: stats.year,
      generatedAt: new Date().toISOString(),
      model: "claude-3.5-sonnet-20241022",
      content: result.object,
    }
  } catch (error) {
    console.error("Error generating annual report:", error)
    throw new Error("Failed to generate annual report")
  }
}

