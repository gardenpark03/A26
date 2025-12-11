"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { refineLogWithAI } from "@/lib/ai/log-editor"
import { generateTagsAI } from "@/lib/ai/auto-tag"

export async function regenerateLogTags(logId: string) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "Unauthorized" }
    }

    // 1. Fetch the log (with user verification)
    const { data: log, error: fetchError } = await supabase
      .from("logs")
      .select("*")
      .eq("id", logId)
      .eq("user_id", user.id)
      .single()

    if (fetchError || !log) {
      return { error: "Log not found or unauthorized" }
    }

    // 2. Generate tags with AI
    const tags = await generateTagsAI({
      title: log.title,
      content: log.content,
      resourceType: "log",
    })

    // 3. Update the log with new tags
    const { error: updateError } = await supabase
      .from("logs")
      .update({
        tags: tags,
      })
      .eq("id", logId)
      .eq("user_id", user.id)

    if (updateError) {
      console.error("Error updating tags:", updateError)
      return { error: "Failed to update tags" }
    }

    // Revalidate the page
    revalidatePath(`/logs/${logId}`)

    return { success: true, tags }
  } catch (error: any) {
    console.error("Error in regenerateLogTags:", error)
    return { error: error.message || "Failed to generate tags" }
  }
}

export async function refineLogAction(logId: string) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "Unauthorized" }
    }

    // 1. Fetch the log (with user verification)
    const { data: log, error: fetchError } = await supabase
      .from("logs")
      .select("*")
      .eq("id", logId)
      .eq("user_id", user.id)
      .single()

    if (fetchError || !log) {
      return { error: "Log not found or unauthorized" }
    }

    // 2. Call AI to refine the content
    const refinedContent = await refineLogWithAI({
      title: log.title,
      content: log.content,
      logDate: log.log_date,
      options: {
        tone: "retrospective",
        language: "ko",
      },
    })

    // 3. Update the log with AI refined content
    const { error: updateError } = await supabase
      .from("logs")
      .update({
        ai_refined_content: refinedContent,
        ai_last_edited_at: new Date().toISOString(),
      })
      .eq("id", logId)
      .eq("user_id", user.id)

    if (updateError) {
      console.error("Error updating log:", updateError)
      return { error: "Failed to save refined content" }
    }

    // Revalidate the page
    revalidatePath(`/logs/${logId}`)

    return { success: true, refinedContent }
  } catch (error: any) {
    console.error("Error in refineLogAction:", error)
    return { error: error.message || "Failed to refine log" }
  }
}

