"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export async function updateShowcaseProfile(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    console.error("Unauthorized")
    return
  }

  const handle = formData.get("handle") as string
  const bio = formData.get("bio") as string
  const isPublic = formData.get("is_public") === "on"

  // Check if handle is already taken by another user
  if (handle) {
    const { data: existingUser } = await supabase
      .from("profiles")
      .select("id")
      .eq("handle", handle)
      .neq("id", user.id)
      .single()

    if (existingUser) {
      console.error("이 핸들은 이미 사용 중입니다")
      return
    }
  }

  // Update profile
  const { error } = await supabase
    .from("profiles")
    .update({
      handle: handle || null,
      bio: bio || null,
      is_public: isPublic,
    })
    .eq("id", user.id)

  if (error) {
    console.error("Error updating profile:", error)
    return
  }

  revalidatePath("/showcase")
}

export async function addShowcaseItem(
  itemType: string,
  itemId: string
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "Unauthorized" }
    }

    // Get current max order_index
    const { data: maxItem } = await supabase
      .from("showcase_items")
      .select("order_index")
      .eq("user_id", user.id)
      .order("order_index", { ascending: false })
      .limit(1)
      .single()

    const nextOrder = (maxItem?.order_index ?? -1) + 1

    // Insert new showcase item
    const { error } = await supabase
      .from("showcase_items")
      .insert({
        user_id: user.id,
        item_type: itemType,
        item_id: itemId,
        order_index: nextOrder,
      })

    if (error) {
      console.error("Error adding showcase item:", error)
      return { error: "추가 실패" }
    }

    revalidatePath("/showcase")
    return { success: true }
  } catch (error: any) {
    return { error: error.message || "Failed to add item" }
  }
}

export async function removeShowcaseItem(showcaseItemId: string) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "Unauthorized" }
    }

    const { error } = await supabase
      .from("showcase_items")
      .delete()
      .eq("id", showcaseItemId)
      .eq("user_id", user.id)

    if (error) {
      console.error("Error removing showcase item:", error)
      return { error: "제거 실패" }
    }

    revalidatePath("/showcase")
    return { success: true }
  } catch (error: any) {
    return { error: error.message || "Failed to remove item" }
  }
}

export async function updateShowcaseItemOrder(
  showcaseItemId: string,
  direction: "up" | "down"
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "Unauthorized" }
    }

    // Get all items for reordering
    const { data: items } = await supabase
      .from("showcase_items")
      .select("*")
      .eq("user_id", user.id)
      .order("order_index", { ascending: true })

    if (!items) return { error: "Items not found" }

    const currentIndex = items.findIndex((item) => item.id === showcaseItemId)
    if (currentIndex === -1) return { error: "Item not found" }

    const newIndex =
      direction === "up" ? currentIndex - 1 : currentIndex + 1

    if (newIndex < 0 || newIndex >= items.length) {
      return { error: "Cannot move further" }
    }

    // Swap order_index
    const item1 = items[currentIndex]
    const item2 = items[newIndex]

    await supabase
      .from("showcase_items")
      .update({ order_index: item2.order_index })
      .eq("id", item1.id)

    await supabase
      .from("showcase_items")
      .update({ order_index: item1.order_index })
      .eq("id", item2.id)

    revalidatePath("/showcase")
    return { success: true }
  } catch (error: any) {
    return { error: error.message || "Failed to update order" }
  }
}

export async function toggleShowcasePin(showcaseItemId: string) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "Unauthorized" }
    }

    // Get current pin status
    const { data: item } = await supabase
      .from("showcase_items")
      .select("is_pinned")
      .eq("id", showcaseItemId)
      .eq("user_id", user.id)
      .single()

    if (!item) return { error: "Item not found" }

    // Toggle
    const { error } = await supabase
      .from("showcase_items")
      .update({ is_pinned: !item.is_pinned })
      .eq("id", showcaseItemId)

    if (error) {
      console.error("Error toggling pin:", error)
      return { error: "핀 변경 실패" }
    }

    revalidatePath("/showcase")
    return { success: true }
  } catch (error: any) {
    return { error: error.message || "Failed to toggle pin" }
  }
}

