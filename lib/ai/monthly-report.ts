import { anthropic } from "@ai-sdk/anthropic"
import { generateObject } from "ai"
import { z } from "zod"

// Monthly Stats Type
export type MonthlyStats = {
  year: number
  month: number
  completedTaskCount: number
  totalTaskCount: number
  highPriorityCompletedCount: number
  logsTextSample: string
}

// Monthly Report Result Schema
export const monthlyReportSchema = z.object({
  monthSummary: z.string().describe("A 3-6 sentence summary of how this month went for the user"),
  highlights: z.array(z.string()).min(3).max(5).describe("3-5 bullet points of what went well"),
  challenges: z.array(z.string()).min(3).max(5).describe("3-5 bullet points of difficulties or patterns to watch"),
  nextMonthSuggestions: z.array(z.string()).min(3).max(5).describe("3-5 practical suggestions for next month"),
})

export type MonthlyReportResult = z.infer<typeof monthlyReportSchema>

const SYSTEM_PROMPT = `You are Archive 26, an AI life coach that analyzes a user's month based on their task completion stats and daily logs.

Your job:
1. Summarize how this month went for the user based on their task completion and log entries
2. Highlight what went well - be specific and celebrate their wins
3. Point out key challenges or patterns they should be aware of
4. Suggest 3-5 concrete focus areas or actions for next month

Guidelines:
- Be supportive, practical, and concise
- Use a warm, encouraging tone
- Focus on actionable insights, not generic advice
- Reference specific patterns from their data when possible
- Keep each bullet point to 1-2 sentences
- Respond in Korean for better connection with the user

You MUST respond with valid JSON matching the provided schema.`

export async function generateMonthlyReport(
  stats: MonthlyStats
): Promise<MonthlyReportResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not configured")
  }

  const monthName = new Date(stats.year, stats.month - 1).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
  })

  const completionRate = stats.totalTaskCount > 0
    ? Math.round((stats.completedTaskCount / stats.totalTaskCount) * 100)
    : 0

  const userPrompt = `Here is the monthly data for the user:

Period: ${monthName}

Task Statistics:
- Total tasks: ${stats.totalTaskCount}
- Completed tasks: ${stats.completedTaskCount}
- Completion rate: ${completionRate}%
- High priority tasks completed: ${stats.highPriorityCompletedCount}

Daily Logs Sample:
---
${stats.logsTextSample || "사용자가 이번 달에 작성한 일일 기록이 없습니다."}
---

Based on this data, generate a comprehensive monthly report in Korean:

1. monthSummary: Write a warm, personal summary (3-6 sentences) analyzing:
   - Overall progress and effort
   - Task completion patterns
   - Emotional/mental state from logs
   - General momentum

2. highlights: List 3-5 specific wins or positive patterns:
   - Specific accomplishments
   - Good habits formed
   - Challenges overcome
   - Positive mindset shifts

3. challenges: List 3-5 areas that need attention:
   - Patterns of difficulty
   - Incomplete or delayed tasks
   - Emotional struggles from logs
   - Potential blockers

4. nextMonthSuggestions: Provide 3-5 actionable suggestions:
   - Specific habits to build
   - Areas to focus on
   - Strategies to try
   - Goals to prioritize

Make it personal and insightful based on their actual data.`

  try {
    const result = await generateObject({
      model: anthropic("claude-sonnet-4-5-20250929"),
      schema: monthlyReportSchema,
      system: SYSTEM_PROMPT,
      prompt: userPrompt,
      temperature: 0.7,
    })

    return result.object
  } catch (error) {
    console.error("Error generating monthly report:", error)
    throw new Error("Failed to generate monthly report")
  }
}

