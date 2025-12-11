"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export async function updateProfileAction(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  // Extract form data
  const full_name = formData.get("full_name") as string | null
  const handle = formData.get("handle") as string | null
  const bio = formData.get("bio") as string | null
  const avatar_url = formData.get("avatar_url") as string | null
  const timezone = formData.get("timezone") as string | null
  const year_theme = formData.get("year_theme") as string | null
  const main_focus = formData.get("main_focus") as string | null
  const work_style = formData.get("work_style") as string | null
  const week_start = formData.get("week_start") as string | null
  const language = formData.get("language") as string | null
  const theme_preference = formData.get("theme_preference") as string | null
  const is_public = formData.get("is_public") === "on"

  // Check if handle is already taken by another user
  if (handle && handle.trim()) {
    const { data: existingUser } = await supabase
      .from("profiles")
      .select("id")
      .eq("handle", handle.trim())
      .neq("id", user.id)
      .single()

    if (existingUser) {
      throw new Error("이 핸들은 이미 사용 중입니다")
    }
  }

  // Update profile
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: full_name?.trim() || null,
      handle: handle?.trim() || null,
      bio: bio?.trim() || null,
      avatar_url: avatar_url || null,
      timezone: timezone || "Asia/Seoul",
      year_theme: year_theme?.trim() || null,
      main_focus: main_focus?.trim() || null,
      work_style: work_style || null,
      week_start: week_start || "monday",
      language: language || "ko",
      theme_preference: theme_preference || "system",
      is_public,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)

  if (error) {
    console.error("Error updating profile:", error)
    throw new Error(`프로필 업데이트 실패: ${error.message}`)
  }

  // 헤더가 모든 페이지에 있으므로 모든 경로 revalidate
  revalidatePath("/", "layout")
  revalidatePath("/settings/profile")
  revalidatePath("/showcase")
}

