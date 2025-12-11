import { anthropic } from "@ai-sdk/anthropic"
import { generateObject } from "ai"
import { z } from "zod"

export interface AdvisorContextStats {
  periodLabel: string // e.g., "last_7_days", "last_30_days"
  
  goalsSummary: {
    totalGoals: number
    activeGoals: number
    completedGoals: number
  }

  tasksSummary: {
    totalTasks: number
    completedTasks: number
    overdueTasks: number
    highPriorityOpen: number
  }

  logsSummary: {
    totalLogs: number
    moodsCount: Record<string, number>
  }

  recentLogSnippets: string[]
}

// Advisor Result Schema
const advisorResultSchema = z.object({
  headline: z.string().describe("A single sentence summarizing the user's current status and priority"),
  overallAssessment: z.string().describe("A 3-5 sentence overall assessment of how they're doing"),
  focusAreas: z.array(z.string()).min(3).max(5).describe("3-5 key areas to focus on this week"),
  risksOrWarnings: z.array(z.string()).min(2).max(5).describe("2-5 potential risks or things they might be overlooking"),
  concreteActions: z.array(z.string()).min(3).max(7).describe("3-7 specific actions they can take today or this week"),
  encouragement: z.string().describe("A warm, motivational closing message"),
})

export type AdvisorResult = z.infer<typeof advisorResultSchema>

const SYSTEM_PROMPT = `You are an AI personal advisor and coach for a life OS called Archive 26.

The user is tracking their goals, tasks, and daily logs. You receive:
- Simple numeric stats (goals, tasks, logs)
- Mood distribution from their logs
- A few recent log text snippets

Your job:
1. Understand the user's recent execution rhythm and emotional state
2. Give a short overall assessment (3-5 sentences)
3. Suggest 3-5 focus areas for the upcoming days
4. Point out 2-5 potential risks or things they might be overlooking
5. Suggest 3-7 very concrete actions they can take (today or this week)
6. End with a short encouragement message

Guidelines:
- Be honest but supportive. No toxic positivity.
- If the logs are in Korean, respond in Korean. If they are in English, respond in English.
- Tailor your language to sound like a helpful coach, not a corporate report.
- Focus on actionable insights, not generic advice.
- Be specific when referencing their data patterns.
- Keep a warm, personal tone.

You MUST respond with valid JSON matching the provided schema.`

export async function generateAdvisorReport(
  stats: AdvisorContextStats
): Promise<AdvisorResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not configured")
  }

  const userPrompt = `Here is the recent context for the user.

Period: ${stats.periodLabel}

Goals summary:
- Total goals: ${stats.goalsSummary.totalGoals}
- Active goals: ${stats.goalsSummary.activeGoals}
- Completed goals: ${stats.goalsSummary.completedGoals}

Tasks summary:
- Total tasks: ${stats.tasksSummary.totalTasks}
- Completed tasks: ${stats.tasksSummary.completedTasks}
- Overdue tasks: ${stats.tasksSummary.overdueTasks}
- High priority open tasks: ${stats.tasksSummary.highPriorityOpen}

Logs summary:
- Total logs in period: ${stats.logsSummary.totalLogs}
- Moods distribution: ${JSON.stringify(stats.logsSummary.moodsCount)}

Recent logs (snippets):
${stats.recentLogSnippets.map((snippet, idx) => `---\n[Log ${idx + 1}]\n${snippet}`).join("\n")}
---

Based on this data, generate a comprehensive personal advisor report in Korean (or the language they write in).

Focus on:
1. Their execution patterns
2. Emotional/mental state from logs
3. What they're doing well
4. What needs attention
5. Specific next steps they can take`

  try {
    const result = await generateObject({
      model: anthropic("claude-sonnet-4-5-20250929"),
      schema: advisorResultSchema,
      system: SYSTEM_PROMPT,
      prompt: userPrompt,
      temperature: 0.7,
    })

    return result.object
  } catch (error) {
    console.error("Error generating advisor report:", error)
    throw new Error("Failed to generate advisor report")
  }
}

