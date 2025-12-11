import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

async function createGoal(formData: FormData) {
  "use server"

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const year = parseInt(formData.get("year") as string) || 2026

  if (!title) {
    console.error("Title is required")
    return
  }

  const { error } = await supabase.from("goals").insert({
    user_id: user.id,
    title,
    description: description || null,
    year,
    status: "active",
  })

  if (error) {
    console.error("Error creating goal:", error)
    return
  }

  redirect("/goals")
}

export default async function NewGoalPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Create New Goal</h1>
        <p className="text-muted-foreground mt-2">
          Define a new objective for 2026
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Goal Details</CardTitle>
          <CardDescription>
            Enter the details of your new goal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createGoal} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                name="title"
                placeholder="예: 건강한 몸 만들기"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="목표에 대한 구체적인 설명을 입력하세요..."
                rows={5}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                name="year"
                type="number"
                defaultValue={2026}
                min={2024}
                max={2030}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                Create Goal
              </Button>
              <Button asChild variant="outline">
                <Link href="/goals">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

