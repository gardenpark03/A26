"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { generateProjectSummary } from "@/lib/ai/project-summary"
import { generateTagsAI } from "@/lib/ai/auto-tag"

export async function generateProjectSummaryAction(projectId: string) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "Unauthorized" }
    }

    // 1. Fetch project (with user verification)
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .eq("user_id", user.id)
      .single()

    if (projectError || !project) {
      return { error: "Project not found or unauthorized" }
    }

    // 2. Fetch project resources
    const { data: resources } = await supabase
      .from("project_resources")
      .select("*")
      .eq("project_id", projectId)
      .eq("user_id", user.id)

    if (!resources || resources.length === 0) {
      return { error: "이 프로젝트에는 리소스가 없습니다. 먼저 리소스를 추가해주세요." }
    }

    // 3. Build input for AI
    const input = {
      projectTitle: project.title,
      projectDescription: project.description,
      resources: resources.map((r) => ({
        id: r.id,
        title: r.title,
        resourceType: r.resource_type,
        contentSnippet: r.content?.slice(0, 300),
        url: r.url,
        tags: r.tags,
      })),
    }

    // 4. Generate summary with AI
    const summaryPayload = await generateProjectSummary(input)

    // 5. Update project with summary
    const { error: updateError } = await supabase
      .from("projects")
      .update({
        ai_summary: summaryPayload,
      })
      .eq("id", projectId)
      .eq("user_id", user.id)

    if (updateError) {
      console.error("Error updating project summary:", updateError)
      return { error: "Failed to save summary" }
    }

    // Revalidate the page
    revalidatePath(`/workspace/${projectId}`)

    return { success: true, summary: summaryPayload }
  } catch (error: any) {
    console.error("Error in generateProjectSummaryAction:", error)
    return { error: error.message || "Failed to generate summary" }
  }
}

export async function regenerateResourceTags(resourceId: string) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "Unauthorized" }
    }

    // 1. Fetch the resource (with user verification)
    const { data: resource, error: fetchError } = await supabase
      .from("project_resources")
      .select("*")
      .eq("id", resourceId)
      .eq("user_id", user.id)
      .single()

    if (fetchError || !resource) {
      return { error: "Resource not found or unauthorized" }
    }

    // 2. Generate tags with AI
    const tags = await generateTagsAI({
      title: resource.title,
      content: resource.content || resource.url || "",
      resourceType: resource.resource_type,
    })

    // 3. Update the resource with new tags
    const { error: updateError } = await supabase
      .from("project_resources")
      .update({
        tags: tags,
      })
      .eq("id", resourceId)
      .eq("user_id", user.id)

    if (updateError) {
      console.error("Error updating resource tags:", updateError)
      return { error: "Failed to update tags" }
    }

    // Revalidate the page
    revalidatePath(`/workspace/${resource.project_id}`)

    return { success: true, tags }
  } catch (error: any) {
    console.error("Error in regenerateResourceTags:", error)
    return { error: error.message || "Failed to generate tags" }
  }
}
