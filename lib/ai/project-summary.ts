import { anthropic } from "@ai-sdk/anthropic"
import { generateObject } from "ai"
import { z } from "zod"

export interface ProjectSummaryInput {
  projectTitle: string
  projectDescription?: string | null
  resources: {
    id: string
    title: string | null
    resourceType: string
    contentSnippet?: string | null
    url?: string | null
    tags?: string[] | null
  }[]
}

// Project Summary Schema
const projectSummarySchema = z.object({
  headline: z.string().describe("One sentence summary of what this project is about"),
  overview: z.string().describe("A 2-4 paragraph overview describing the project's purpose and scope"),
  currentStatus: z.string().describe("Current progress and trajectory of the project"),
  recentProgress: z.array(z.string()).min(2).max(5).describe("2-5 recent achievements or progress highlights"),
  risks: z.array(z.string()).min(2).max(5).describe("2-5 potential risks, gaps, or blockers"),
  nextActions: z.array(z.string()).min(3).max(7).describe("3-7 concrete next steps"),
})

export type ProjectSummary = z.infer<typeof projectSummarySchema>

export interface ProjectSummaryPayload {
  lastGeneratedAt: string
  model: string
  summary: ProjectSummary
}

const SYSTEM_PROMPT = `You are an AI project coach for a productivity OS called Archive 26.

You will receive:
- A project title and description
- A list of related resources: docs, links, code snippets, etc.

Your job:
1. Understand what this project is about and what the user is trying to achieve
2. Summarize the project as if you are writing a short briefing for the user
3. Describe the current status and trajectory based on available information
4. Extract recent progress highlights (what seems to have moved forward)
5. Point out 2-5 key risks, gaps, or unanswered questions
6. Suggest 3-7 concrete next actions the user can take

Guidelines:
- Be supportive, practical, not overly formal
- If the content is mostly in Korean, respond in Korean. If it's in English, respond in English
- Focus on actionable insights
- Be specific when referencing their resources
- Keep sections concise but insightful

You MUST output strictly JSON following the schema provided, with no additional text.`

export async function generateProjectSummary(
  input: ProjectSummaryInput
): Promise<ProjectSummaryPayload> {
  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not configured")
  }

  const userPrompt = `Project title:
${input.projectTitle}

Project description:
${input.projectDescription || "(no description provided)"}

Resources (${input.resources.length} items):
${input.resources
  .map(
    (r, idx) => `
---
[Resource ${idx + 1}]
Type: ${r.resourceType}
Title: ${r.title || "(untitled)"}
Tags: ${r.tags?.join(", ") || "none"}
${r.url ? `URL: ${r.url}` : ""}
${r.contentSnippet ? `Content:\n${r.contentSnippet}` : ""}
---
`
  )
  .join("\n")}

Now generate a comprehensive project briefing as JSON with the following fields:
- headline: One sentence summary
- overview: 2-4 paragraphs about the project
- currentStatus: Current progress assessment
- recentProgress: 2-5 bullet points of what's been done
- risks: 2-5 potential issues or gaps
- nextActions: 3-7 specific next steps`

  try {
    const result = await generateObject({
      model: anthropic("claude-3-5-sonnet-20241022"),
      schema: projectSummarySchema,
      system: SYSTEM_PROMPT,
      prompt: userPrompt,
      temperature: 0.7,
    })

    return {
      lastGeneratedAt: new Date().toISOString(),
      model: "claude-3.5-sonnet-20241022",
      summary: result.object,
    }
  } catch (error) {
    console.error("Error generating project summary:", error)
    throw new Error("Failed to generate project summary")
  }
}

