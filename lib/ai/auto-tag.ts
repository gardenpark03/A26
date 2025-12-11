import { anthropic } from "@ai-sdk/anthropic"
import { generateObject } from "ai"
import { z } from "zod"

export interface AutoTagInput {
  title?: string | null
  content: string
  resourceType?: string // doc/link/code/log etc
}

// Tag schema for structured output
const tagSchema = z.object({
  tags: z.array(z.string()).min(3).max(7).describe("3-7 short topic tags (1-3 words each)"),
})

const SYSTEM_PROMPT = `You are an AI assistant for a productivity OS called Archive 26.

Your task:
Given user-written text (logs, project notes, code snippets, or resources), generate 3 to 7 short topic tags that best summarize the content.

Rules:
- Tags must be short (1–3 words maximum)
- No hashtags (#) or special characters
- No emojis
- Use lowercase
- Avoid duplicates
- Focus on:
  * Main topics and themes
  * Key concepts or technologies
  * Activity types (e.g., "planning", "coding", "reflection")
  * Emotional themes (e.g., "motivation", "struggle", "breakthrough")
- Prefer specific over generic tags
- Use English for technical terms, Korean for general concepts

Return ONLY a valid JSON object with a "tags" array.`

export async function generateTagsAI(input: AutoTagInput): Promise<string[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not configured")
  }

  const userPrompt = `Title: ${input.title || "(no title)"}
Type: ${input.resourceType || "general"}

Content:
---
${input.content.slice(0, 2000)} ${input.content.length > 2000 ? "..." : ""}
---

Generate relevant tags for this content.`

  try {
    const result = await generateObject({
      model: anthropic("claude-sonnet-4-5-20250929"),
      schema: tagSchema,
      system: SYSTEM_PROMPT,
      prompt: userPrompt,
      temperature: 0.5,
    })

    return result.object.tags
  } catch (error) {
    console.error("Error generating tags:", error)
    throw new Error("Failed to generate tags")
  }
}

