import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ProfileForm } from "@/components/profile/profile-form"

export default async function ProfileSettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Fetch profile
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  if (error) {
    console.error("Error fetching profile:", error)
  }

  // If no profile exists, create one
  if (!profile) {
    const { data: newProfile } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.email?.split("@")[0],
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (newProfile) {
      return <ProfileForm profile={newProfile} userId={user.id} userEmail={user.email || ""} />
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground mt-2">
          Archive 26에서 사용할 기본 정보와 2026년의 포커스를 설정하세요.
        </p>
      </div>

      <ProfileForm profile={profile} userId={user.id} userEmail={user.email || ""} />
    </div>
  )
}

