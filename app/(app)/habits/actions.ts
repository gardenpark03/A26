"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export async function createHabitAction(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const cadence = formData.get("cadence") as string
  const startDate = formData.get("start_date") as string

  if (!title || !cadence) {
    console.error("Title and cadence are required")
    return
  }

  // Parse days_of_week for weekly habits
  let daysOfWeek = null
  if (cadence === "weekly") {
    const selectedDays: number[] = []
    for (let i = 0; i <= 6; i++) {
      if (formData.get(`day_${i}`) === "on") {
        selectedDays.push(i)
      }
    }
    daysOfWeek = selectedDays.length > 0 ? selectedDays : null
  }

  const { error } = await supabase.from("habits").insert({
    user_id: user.id,
    title,
    description: description || null,
    cadence,
    days_of_week: daysOfWeek,
    start_date: startDate || new Date().toISOString().split("T")[0],
  })

  if (error) {
    console.error("Error creating habit:", error)
    return
  }

  redirect("/habits")
}

export async function toggleHabitCheckinAction(input: {
  habitId: string
  date: string
}) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "Unauthorized" }
    }

    // Verify habit belongs to user
    const { data: habit } = await supabase
      .from("habits")
      .select("*")
      .eq("id", input.habitId)
      .eq("user_id", user.id)
      .single()

    if (!habit) {
      return { error: "Habit not found" }
    }

    // Check if log exists
    const { data: existingLog } = await supabase
      .from("habit_logs")
      .select("*")
      .eq("habit_id", input.habitId)
      .eq("log_date", input.date)
      .single()

    if (existingLog) {
      // Delete log (uncheck)
      const { error } = await supabase
        .from("habit_logs")
        .delete()
        .eq("id", existingLog.id)

      if (error) {
        console.error("Error deleting habit log:", error)
        return { error: "체크인 해제 실패" }
      }
    } else {
      // Create log (check)
      const { error } = await supabase.from("habit_logs").insert({
        habit_id: input.habitId,
        user_id: user.id,
        log_date: input.date,
        status: "done",
      })

      if (error) {
        console.error("Error creating habit log:", error)
        return { error: "체크인 실패" }
      }
    }

    revalidatePath("/habits")
    revalidatePath(`/habits/${input.habitId}`)

    return { success: true }
  } catch (error: any) {
    console.error("Error in toggleHabitCheckinAction:", error)
    return { error: error.message || "Failed to toggle checkin" }
  }
}

