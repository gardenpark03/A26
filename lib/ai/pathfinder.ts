import { anthropic } from "@ai-sdk/anthropic"
import { generateObject } from "ai"
import { z } from "zod"

// Roadmap JSON Schema
export const roadmapSchema = z.object({
  objective: z.object({
    title: z.string().describe("Clear, actionable annual goal title"),
    description: z.string().describe("Detailed description of what this goal means and why it matters"),
  }),
  milestones: z.array(
    z.object({
      title: z.string().describe("Milestone title"),
      description: z.string().describe("What needs to be achieved in this milestone"),
      start_date: z.string().describe("ISO 8601 date (YYYY-MM-DD)"),
      due_date: z.string().describe("ISO 8601 date (YYYY-MM-DD)"),
      order_index: z.number().describe("Sequential order starting from 1"),
    })
  ).min(3).max(8).describe("3-8 milestones breaking down the annual goal"),
  tasks: z.array(
    z.object({
      title: z.string().describe("Specific, actionable task"),
      description: z.string().describe("Details of how to complete this task"),
      milestone_index: z.number().describe("Which milestone this task belongs to (1-based index)"),
      scheduled_date: z.string().describe("ISO 8601 date (YYYY-MM-DD) when this task should be done"),
    })
  ).min(5).describe("At least 5 actionable tasks"),
})

export type Roadmap = z.infer<typeof roadmapSchema>

const SYSTEM_PROMPT = `You are Archive 26 Pathfinder, an AI assistant specialized in transforming natural language goals into structured, actionable roadmaps for the year 2026.

Your responsibilities:
1. Analyze the user's goal and understand their intent, constraints, and desired outcomes
2. Create a clear annual objective (title + description)
3. Break it down into 3-8 realistic milestones (roughly monthly or quarterly)
4. Generate specific, actionable tasks for each milestone (minimum 5 tasks total)

Guidelines:
- All dates must be in 2026
- Milestones should be sequential and time-bound
- Tasks should be concrete actions, not vague intentions
- Distribute tasks evenly across milestones
- Consider realistic timelines and avoid overloading
- Use ISO 8601 date format (YYYY-MM-DD)
- milestone_index in tasks refers to the position in the milestones array (1-based)

Example structure:
- Milestone 1 (Jan-Feb): Foundation phase
- Milestone 2 (Mar-Apr): Building momentum
- Milestone 3 (May-Jun): Mid-year checkpoint
- etc.

Output only valid JSON matching the provided schema.`

export async function generateRoadmap(userGoal: string): Promise<Roadmap> {
  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY 환경 변수가 설정되지 않았습니다. Vercel 환경 변수 설정을 확인하세요.")
  }

  if (!userGoal?.trim()) {
    throw new Error("목표를 입력해주세요.")
  }

  const userPrompt = `User's Goal for 2026:
"${userGoal}"

Generate a comprehensive roadmap with:
1. A clear objective (title + description)
2. 3-8 milestones spanning across 2026
3. Specific tasks for each milestone (ensure at least 5 tasks total)

Consider:
- The goal's scope and complexity
- Realistic time allocation
- Sequential dependencies between milestones
- Actionable, measurable tasks

Return only the structured JSON output.`

  try {
    const result = await generateObject({
      model: anthropic("claude-sonnet-4-5-20250929"),
      schema: roadmapSchema,
      system: SYSTEM_PROMPT,
      prompt: userPrompt,
      temperature: 0.7,
      maxRetries: 2,
    })

    return result.object
  } catch (error: any) {
    console.error("Error generating roadmap:", error)
    
    // 더 자세한 에러 메시지 제공
    if (error.message?.includes("API key")) {
      throw new Error("ANTHROPIC_API_KEY가 설정되지 않았습니다. 환경 변수를 확인하세요.")
    }
    
    if (error.message?.includes("rate limit") || error.status === 429) {
      throw new Error("API 호출 한도에 도달했습니다. 잠시 후 다시 시도하세요.")
    }
    
    if (error.status === 401) {
      throw new Error("API 키가 유효하지 않습니다. ANTHROPIC_API_KEY를 확인하세요.")
    }
    
    // 원본 에러 메시지 포함
    throw new Error(`Failed to generate roadmap from AI: ${error.message || error.toString()}`)
  }
}

