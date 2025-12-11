import { anthropic } from "@ai-sdk/anthropic"
import { generateText } from "ai"

export interface LogEditOptions {
  tone?: "retrospective" | "casual" | "motivational"
  language?: "ko" | "en"
}

const SYSTEM_PROMPT = `You are an assistant for a life journaling app called Archive 26.

Your job:
- Take the user's raw daily log text and rewrite it into a more polished, reflective journal entry
- Keep the original meaning and all facts, but improve structure, clarity, and narrative flow
- Use a warm, honest tone that feels like an end-of-day reflection
- Do NOT add fictional events or information; only reorganize and clarify what the user actually wrote
- Add emotional depth and introspection where appropriate
- If the user writes in Korean, respond in Korean. If they write in English, respond in English
- Output plain text only (no markdown, no bullet points), as one or a few well-structured paragraphs

Guidelines:
- Maintain first-person perspective
- Keep the original sentiment and emotions
- Improve sentence flow and transitions
- Add reflective depth without changing facts
- Make it feel like a thoughtful journal entry, not a report`

export async function refineLogWithAI(input: {
  title?: string | null
  content: string
  logDate?: string | null
  options?: LogEditOptions
}): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not configured")
  }

  const tone = input.options?.tone || "retrospective"
  const language = input.options?.language || "ko"

  const toneInstructions = {
    retrospective: "Write in a thoughtful, reflective tone as if looking back on the day with wisdom",
    casual: "Write in a friendly, conversational tone as if talking to a close friend",
    motivational: "Write in an encouraging, forward-looking tone that emphasizes growth and learning",
  }

  const dateStr = input.logDate
    ? new Date(input.logDate).toLocaleDateString(language === "ko" ? "ko-KR" : "en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "long",
      })
    : "unknown date"

  const userPrompt = `[Daily log metadata]
Title: ${input.title || "(no title)"}
Date: ${dateStr}

[Raw content]
${input.content}

---

Tone preference: ${toneInstructions[tone]}
Language: ${language === "ko" ? "Korean" : "English"}

Please rewrite this as a more polished, reflective journal entry. Keep all the original facts and emotions, but make it read beautifully.`

  try {
    const result = await generateText({
      model: anthropic("claude-sonnet-4-5-20250929"),
      system: SYSTEM_PROMPT,
      prompt: userPrompt,
      temperature: 0.7,
    })

    return result.text.trim()
  } catch (error) {
    console.error("Error refining log:", error)
    throw new Error("Failed to refine log with AI")
  }
}
