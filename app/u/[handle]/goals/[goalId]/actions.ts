"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export async function forkGoalPlanAction(params: {
  goalId: string
  sourceHandle: string
}) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "로그인이 필요합니다" }
    }

    // 1. Get source profile
    const { data: sourceProfile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("handle", params.sourceHandle)
      .eq("is_public", true)
      .single()

    if (profileError || !sourceProfile) {
      return { error: "Source profile not found" }
    }

    // 2. Get source goal
    const { data: sourceGoal, error: goalError } = await supabase
      .from("goals")
      .select("*")
      .eq("id", params.goalId)
      .eq("user_id", sourceProfile.id)
      .single()

    if (goalError || !sourceGoal) {
      return { error: "Source goal not found" }
    }

    // Prevent forking own goal
    if (sourceGoal.user_id === user.id) {
      return { error: "자신의 Goal은 Fork할 수 없습니다" }
    }

    // 3. Get source milestones
    const { data: sourceMilestones, error: milestonesFetchError } = await supabase
      .from("milestones")
      .select("*")
      .eq("goal_id", sourceGoal.id)
      .eq("user_id", sourceProfile.id)
      .order("order_index", { ascending: true })

    if (milestonesFetchError) {
      console.error("Error fetching source milestones:", milestonesFetchError)
      // RLS 정책 문제일 수 있지만 계속 진행
    }

    console.log(`Fetched ${sourceMilestones?.length || 0} milestones for fork`)

    // 4. Get source tasks
    const { data: sourceTasks, error: tasksFetchError } = await supabase
      .from("tasks")
      .select("*")
      .eq("goal_id", sourceGoal.id)
      .eq("user_id", sourceProfile.id)

    if (tasksFetchError) {
      console.error("Error fetching source tasks:", tasksFetchError)
      // RLS 정책 문제일 수 있지만 계속 진행
    }

    console.log(`Fetched ${sourceTasks?.length || 0} tasks for fork`)

    // 5. Create new goal (forked)
    const { data: newGoal, error: newGoalError } = await supabase
      .from("goals")
      .insert({
        user_id: user.id,
        title: sourceGoal.title,
        description: sourceGoal.description,
        year: sourceGoal.year,
        status: "active",
        ai_metadata: sourceGoal.ai_metadata,
        forked_from_goal_id: sourceGoal.id,
        forked_from_user_id: sourceProfile.id,
      })
      .select()
      .single()

    if (newGoalError || !newGoal) {
      console.error("Error creating goal:", newGoalError)
      return { error: "Goal 생성 실패" }
    }

    // 6. Create milestone map and copy milestones
    const milestoneIdMap = new Map<string, string>()

    if (sourceMilestones && sourceMilestones.length > 0) {
      console.log(`Creating ${sourceMilestones.length} milestones...`)
      
      const newMilestones = sourceMilestones.map((m) => ({
        user_id: user.id,
        goal_id: newGoal.id,
        title: m.title,
        description: m.description,
        start_date: m.start_date,
        due_date: m.due_date,
        order_index: m.order_index,
        status: "pending" as const,
      }))

      const { data: createdMilestones, error: milestonesError } = await supabase
        .from("milestones")
        .insert(newMilestones)
        .select()

      if (milestonesError) {
        console.error("Error creating milestones:", milestonesError)
        console.error("Milestones data:", newMilestones)
        return { error: `Milestones 생성 실패: ${milestonesError.message}` }
      }

      if (!createdMilestones || createdMilestones.length === 0) {
        console.error("No milestones were created")
        return { error: "Milestones 생성 실패: 생성된 milestone이 없습니다" }
      }

      console.log(`Successfully created ${createdMilestones.length} milestones`)

      // Build milestone ID mapping
      createdMilestones.forEach((newM: any, idx: number) => {
        const oldM = sourceMilestones[idx]
        if (oldM && newM) {
          milestoneIdMap.set(oldM.id, newM.id)
        }
      })
    } else {
      console.log("No milestones to copy")
    }

    // 7. Copy tasks
    if (sourceTasks && sourceTasks.length > 0) {
      console.log(`Creating ${sourceTasks.length} tasks...`)
      
      const newTasks = sourceTasks.map((t) => ({
        user_id: user.id,
        goal_id: newGoal.id,
        milestone_id: t.milestone_id ? milestoneIdMap.get(t.milestone_id) || null : null,
        title: t.title,
        description: t.description,
        scheduled_date: t.scheduled_date,
        due_date: t.due_date,
        status: "todo" as const,
        priority: t.priority || "normal",
        source: "fork" as const,
      }))

      const { data: createdTasks, error: tasksError } = await supabase
        .from("tasks")
        .insert(newTasks)
        .select()

      if (tasksError) {
        console.error("Error creating tasks:", tasksError)
        console.error("Tasks data:", newTasks)
        return { error: `Tasks 생성 실패: ${tasksError.message}` }
      }

      if (!createdTasks || createdTasks.length === 0) {
        console.error("No tasks were created")
        return { error: "Tasks 생성 실패: 생성된 task가 없습니다" }
      }

      console.log(`Successfully created ${createdTasks.length} tasks`)
    } else {
      console.log("No tasks to copy")
    }

    // Success! Redirect to new goal page with success message
    redirect(`/goals/${newGoal.id}?forked=success`)
  } catch (error: any) {
    console.error("Error in forkGoalPlanAction:", error)
    return { error: error.message || "Fork 실패" }
  }
}

