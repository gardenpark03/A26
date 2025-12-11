"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { generateRoadmap, type Roadmap } from "@/lib/ai/pathfinder"

/**
 * Generate roadmap from user's natural language goal
 */
export async function generateRoadmapAction(userGoal: string) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "Unauthorized" }
    }

    // Call Claude API to generate roadmap
    const roadmap = await generateRoadmap(userGoal)

    return { success: true, roadmap }
  } catch (error: any) {
    console.error("Error generating roadmap:", error)
    return { error: error.message || "Failed to generate roadmap" }
  }
}

/**
 * Apply generated roadmap to database
 * Inserts goal → milestones → tasks in sequence
 */
export async function applyRoadmapAction(roadmap: Roadmap) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "Unauthorized" }
    }

    // 1. Insert Goal
    const { data: goal, error: goalError } = await supabase
      .from("goals")
      .insert({
        user_id: user.id,
        title: roadmap.objective.title,
        description: roadmap.objective.description,
        year: 2026,
        status: "active",
        ai_metadata: {
          source: "ai_pathfinder",
          generated_at: new Date().toISOString(),
        },
      })
      .select()
      .single()

    if (goalError || !goal) {
      console.error("Error inserting goal:", goalError)
      return { error: "Failed to create goal" }
    }

    // 2. Insert Milestones
    const milestonesToInsert = roadmap.milestones.map((m) => ({
      user_id: user.id,
      goal_id: goal.id,
      title: m.title,
      description: m.description,
      start_date: m.start_date,
      due_date: m.due_date,
      order_index: m.order_index,
      status: "pending" as const,
    }))

    const { data: milestones, error: milestonesError } = await supabase
      .from("milestones")
      .insert(milestonesToInsert)
      .select()
      .order("order_index", { ascending: true })

    if (milestonesError || !milestones) {
      console.error("Error inserting milestones:", milestonesError)
      return { error: "Failed to create milestones" }
    }

    // Create mapping: order_index → milestone_id
    const milestoneMap = new Map<number, string>()
    milestones.forEach((m: any) => {
      milestoneMap.set(m.order_index, m.id)
    })

    // 3. Insert Tasks
    const tasksToInsert = roadmap.tasks.map((t) => {
      const milestoneId = milestoneMap.get(t.milestone_index)
      
      return {
        user_id: user.id,
        goal_id: goal.id,
        milestone_id: milestoneId || null,
        title: t.title,
        description: t.description,
        scheduled_date: t.scheduled_date,
        status: "todo" as const,
        priority: "normal" as const,
        source: "ai" as const,
      }
    })

    const { error: tasksError } = await supabase
      .from("tasks")
      .insert(tasksToInsert)

    if (tasksError) {
      console.error("Error inserting tasks:", tasksError)
      return { error: "Failed to create tasks" }
    }

    // Success! Redirect to goal detail page
    redirect(`/goals/${goal.id}`)
  } catch (error: any) {
    console.error("Error applying roadmap:", error)
    return { error: error.message || "Failed to apply roadmap" }
  }
}

