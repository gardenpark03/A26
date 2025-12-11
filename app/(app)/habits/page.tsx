import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { HabitCheckinButton } from "@/components/habits/habit-checkin-button"
import { createHabitAction, toggleHabitCheckinAction } from "./actions"

export default async function HabitsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const today = new Date().toISOString().split("T")[0]

  // 병렬 쿼리 실행
  const [habitsRes, todayLogsRes] = await Promise.all([
    supabase
      .from("habits")
      .select("id, title, description, cadence, days_of_week, color, icon, created_at")
      .eq("user_id", user.id)
      .eq("is_archived", false)
      .order("created_at", { ascending: false })
      .limit(100), // 최대 100개
    supabase
      .from("habit_logs")
      .select("habit_id, status")
      .eq("user_id", user.id)
      .eq("log_date", today),
  ])

  const habits = habitsRes.data || []
  const todayLogs = todayLogsRes.data || []

  const todayLogsMap = new Map<string, string>()
  todayLogs.forEach((log) => {
    todayLogsMap.set(log.habit_id, log.status)
  })

  const dayNames = ["일", "월", "화", "수", "목", "금", "토"]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Habits</h1>
        <p className="text-muted-foreground mt-2">
          매일/매주 반복되는 루틴을 기록하고, 오늘의 체크인을 관리하세요
        </p>
      </div>

      {/* Today's Habits */}
      <Card>
        <CardHeader>
          <CardTitle>오늘의 Habits</CardTitle>
          <CardDescription>
            {new Date(today).toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "long",
              day: "numeric",
              weekday: "long",
            })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {habits && habits.length > 0 ? (
            <div className="space-y-3">
              {habits.map((habit) => {
                const status = todayLogsMap.has(habit.id) ? "done" : "none"

                return (
                  <div
                    key={habit.id}
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div className="flex-1">
                      <Link href={`/habits/${habit.id}`}>
                        <h4 className="font-semibold hover:text-primary cursor-pointer">
                          {habit.title}
                        </h4>
                      </Link>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {habit.cadence === "daily" ? "매일" : "매주"}
                        </span>
                        {habit.cadence === "weekly" && habit.days_of_week && (
                          <span className="text-xs text-muted-foreground">
                            ({habit.days_of_week.map((d: number) => dayNames[d]).join(", ")})
                          </span>
                        )}
                      </div>
                    </div>
                    <HabitCheckinButton
                      habitId={habit.id}
                      date={today}
                      initialStatus={status}
                      onToggle={toggleHabitCheckinAction}
                    />
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                아직 생성된 Habit이 없습니다
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create New Habit */}
      <Card>
        <CardHeader>
          <CardTitle>새 Habit 만들기</CardTitle>
          <CardDescription>
            매일 또는 매주 반복할 루틴을 추가하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createHabitAction} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">제목 *</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="예: 아침 운동"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="start_date">시작일</Label>
                <Input
                  id="start_date"
                  name="start_date"
                  type="date"
                  defaultValue={today}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">설명</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Habit에 대한 간단한 설명..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cadence">반복 주기 *</Label>
              <select
                id="cadence"
                name="cadence"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              >
                <option value="daily">매일</option>
                <option value="weekly">매주</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>요일 선택 (매주 반복인 경우)</Label>
              <div className="flex gap-2 flex-wrap">
                {dayNames.map((day, idx) => (
                  <label
                    key={idx}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-md border cursor-pointer hover:bg-accent"
                  >
                    <input
                      type="checkbox"
                      name={`day_${idx}`}
                      className="h-4 w-4"
                    />
                    <span className="text-sm">{day}</span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                매주 반복인 경우, 체크한 요일에만 표시됩니다
              </p>
            </div>

            <Button type="submit" className="w-full">
              Habit 생성
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* All Habits List */}
      {habits && habits.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>모든 Habits ({habits.length}개)</CardTitle>
            <CardDescription>
              전체 Habit 목록 및 관리
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {habits.map((habit) => (
                <Link key={habit.id} href={`/habits/${habit.id}`}>
                  <div className="p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{habit.title}</h4>
                        <p className="text-xs text-muted-foreground">
                          {habit.cadence === "daily" ? "매일" : "매주"}
                          {habit.cadence === "weekly" && habit.days_of_week && (
                            <> · {habit.days_of_week.map((d: number) => dayNames[d]).join(", ")}</>
                          )}
                        </p>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        상세 보기 →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

