import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

async function createLog(formData: FormData) {
  "use server"

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const logDate = formData.get("log_date") as string
  const title = formData.get("title") as string
  const content = formData.get("content") as string
  const mood = formData.get("mood") as string

  if (!content) {
    console.error("Content is required")
    return
  }

  const { error } = await supabase.from("logs").insert({
    user_id: user.id,
    log_date: logDate || new Date().toISOString().split("T")[0],
    title: title || null,
    content,
    mood: mood || null,
    visibility: "private",
  })

  if (error) {
    console.error("Error creating log:", error)
    return
  }

  redirect("/logs")
}

export default async function NewLogPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0]

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">New Daily Log</h1>
        <p className="text-muted-foreground mt-2">
          오늘 하루를 기록하세요
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daily Log</CardTitle>
          <CardDescription>
            오늘의 생각, 느낌, 일어난 일들을 자유롭게 적어보세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createLog} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="log_date">날짜 *</Label>
                <Input
                  id="log_date"
                  name="log_date"
                  type="date"
                  defaultValue={today}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mood">오늘의 기분</Label>
                <select
                  id="mood"
                  name="mood"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">선택 안 함</option>
                  <option value="very_bad">😢 매우 안좋음</option>
                  <option value="bad">😟 안좋음</option>
                  <option value="neutral">😐 보통</option>
                  <option value="good">😊 좋음</option>
                  <option value="very_good">😄 매우 좋음</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">제목 (선택)</Label>
              <Input
                id="title"
                name="title"
                placeholder="예: 새로운 시작의 하루"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">내용 *</Label>
              <Textarea
                id="content"
                name="content"
                placeholder="오늘은 어떤 하루였나요? 무슨 생각을 했나요? 어떤 일이 있었나요?&#10;&#10;자유롭게 적어보세요..."
                rows={12}
                required
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                마음을 편하게 풀어놓으세요. 이 기록은 나만 볼 수 있습니다.
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                Save Log
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => window.history.back()}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

