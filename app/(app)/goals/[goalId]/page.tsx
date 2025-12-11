import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Goal, Milestone, Task } from "@/lib/types"

async function createMilestone(formData: FormData) {
  "use server"

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const goalId = formData.get("goal_id") as string
  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const startDate = formData.get("start_date") as string
  const dueDate = formData.get("due_date") as string

  if (!title || !goalId) {
    console.error("Title and Goal ID are required")
    return
  }

  const { error } = await supabase.from("milestones").insert({
    user_id: user.id,
    goal_id: goalId,
    title,
    description: description || null,
    start_date: startDate || null,
    due_date: dueDate || null,
    status: "pending",
  })

  if (error) {
    console.error("Error creating milestone:", error)
    return
  }

  redirect(`/goals/${goalId}`)
}

async function createTask(formData: FormData) {
  "use server"

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const goalId = formData.get("goal_id") as string
  const milestoneId = formData.get("milestone_id") as string
  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const scheduledDate = formData.get("scheduled_date") as string

  if (!title || !goalId) {
    console.error("Title and Goal ID are required")
    return
  }

  const { error } = await supabase.from("tasks").insert({
    user_id: user.id,
    goal_id: goalId,
    milestone_id: milestoneId || null,
    title,
    description: description || null,
    scheduled_date: scheduledDate || null,
    status: "todo",
    priority: "normal",
    source: "manual",
  })

  if (error) {
    console.error("Error creating task:", error)
    return
  }

  redirect(`/goals/${goalId}`)
}

interface PageProps {
  params: Promise<{
    goalId: string
  }>
}

export default async function GoalDetailPage({ params }: PageProps) {
  const { goalId } = await params
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Fetch goal
  const { data: goal, error: goalError } = await supabase
    .from("goals")
    .select("*")
    .eq("id", goalId)
    .eq("user_id", user.id)
    .single()

  if (goalError || !goal) {
    notFound()
  }

  const goalData = goal as Goal & {
    forked_from_goal_id?: string | null
    forked_from_user_id?: string | null
  }

  // Fetch forked from info
  let forkedFromProfile = null
  if (goalData.forked_from_user_id) {
    const { data } = await supabase
      .from("profiles")
      .select("handle, full_name, username")
      .eq("id", goalData.forked_from_user_id)
      .single()
    forkedFromProfile = data
  }

  // Fetch milestones
  const { data: milestones } = await supabase
    .from("milestones")
    .select("*")
    .eq("goal_id", goalId)
    .order("due_date", { ascending: true, nullsFirst: false })

  const milestonesData = (milestones as Milestone[]) || []

  // Fetch tasks
  const { data: tasks } = await supabase
    .from("tasks")
    .select("*")
    .eq("goal_id", goalId)
    .order("scheduled_date", { ascending: true, nullsFirst: false })

  const tasksData = (tasks as Task[]) || []

  return (
    <div className="space-y-6">
      {/* Goal Header */}
      <div>
        {/* Forked From Badge */}
        {goalData.forked_from_goal_id && forkedFromProfile?.handle && (
          <div className="mb-3">
            <Link href={`/u/${forkedFromProfile.handle}/goals/${goalData.forked_from_goal_id}`}>
              <Badge variant="outline" className="text-xs hover:bg-accent cursor-pointer">
                🍴 Forked from @{forkedFromProfile.handle}
              </Badge>
            </Link>
          </div>
        )}
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold tracking-tight">{goalData.title}</h1>
          <span
            className={`text-sm font-semibold px-3 py-1 rounded-full ${
              goalData.status === "active"
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                : goalData.status === "completed"
                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                : goalData.status === "paused"
                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
            }`}
          >
            {goalData.status}
          </span>
        </div>
        {goalData.description && (
          <p className="text-muted-foreground">{goalData.description}</p>
        )}
        <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
          <span>Year: {goalData.year}</span>
          <span>•</span>
          <span>
            Created:{" "}
            {new Date(goalData.created_at).toLocaleDateString("ko-KR")}
          </span>
        </div>
      </div>

      {/* Milestones Section */}
      <Card>
        <CardHeader>
          <CardTitle>Milestones</CardTitle>
          <CardDescription>
            중간 단계별 목표를 관리하세요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Milestone List */}
          {milestonesData.length > 0 ? (
            <div className="space-y-3">
              {milestonesData.map((milestone) => (
                <div
                  key={milestone.id}
                  className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold">{milestone.title}</h4>
                      {milestone.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {milestone.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        {milestone.start_date && (
                          <span>
                            시작:{" "}
                            {new Date(milestone.start_date).toLocaleDateString(
                              "ko-KR"
                            )}
                          </span>
                        )}
                        {milestone.due_date && (
                          <span>
                            마감:{" "}
                            {new Date(milestone.due_date).toLocaleDateString(
                              "ko-KR"
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap ${
                        milestone.status === "completed"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                          : milestone.status === "in_progress"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                      }`}
                    >
                      {milestone.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              아직 생성된 마일스톤이 없습니다
            </p>
          )}

          {/* Milestone Create Form */}
          <div className="pt-6 border-t">
            <h4 className="font-semibold mb-4">Add New Milestone</h4>
            <form action={createMilestone} className="space-y-4">
              <input type="hidden" name="goal_id" value={goalId} />
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="milestone-title">Title *</Label>
                  <Input
                    id="milestone-title"
                    name="title"
                    placeholder="예: 1분기 목표"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="milestone-start-date">Start Date</Label>
                  <Input
                    id="milestone-start-date"
                    name="start_date"
                    type="date"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="milestone-description">Description</Label>
                  <Textarea
                    id="milestone-description"
                    name="description"
                    placeholder="마일스톤 설명..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="milestone-due-date">Due Date</Label>
                  <Input
                    id="milestone-due-date"
                    name="due_date"
                    type="date"
                  />
                </div>
              </div>

              <Button type="submit" size="sm">
                Add Milestone
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>

      {/* Tasks Section */}
      <Card>
        <CardHeader>
          <CardTitle>Tasks</CardTitle>
          <CardDescription>
            실행 가능한 작은 단위의 할 일을 관리하세요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Task List */}
          {tasksData.length > 0 ? (
            <div className="space-y-2">
              {tasksData.map((task) => {
                const taskMilestone = milestonesData.find(
                  (m) => m.id === task.milestone_id
                )
                return (
                  <div
                    key={task.id}
                    className="p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{task.title}</h4>
                          {task.priority !== "normal" && (
                            <span
                              className={`text-xs px-2 py-0.5 rounded ${
                                task.priority === "high"
                                  ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                  : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                              }`}
                            >
                              {task.priority}
                            </span>
                          )}
                        </div>
                        {task.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {task.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          {taskMilestone && (
                            <span className="bg-secondary px-2 py-0.5 rounded">
                              📍 {taskMilestone.title}
                            </span>
                          )}
                          {task.scheduled_date && (
                            <span>
                              📅{" "}
                              {new Date(task.scheduled_date).toLocaleDateString(
                                "ko-KR"
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap ${
                          task.status === "done"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : task.status === "in_progress"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                            : task.status === "blocked"
                            ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                        }`}
                      >
                        {task.status}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              아직 생성된 태스크가 없습니다
            </p>
          )}

          {/* Task Create Form */}
          <div className="pt-6 border-t">
            <h4 className="font-semibold mb-4">Add New Task</h4>
            <form action={createTask} className="space-y-4">
              <input type="hidden" name="goal_id" value={goalId} />
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="task-title">Title *</Label>
                  <Input
                    id="task-title"
                    name="title"
                    placeholder="예: 운동 계획 세우기"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="task-milestone">Milestone (선택)</Label>
                  <select
                    id="task-milestone"
                    name="milestone_id"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">연결 안 함</option>
                    {milestonesData.map((milestone) => (
                      <option key={milestone.id} value={milestone.id}>
                        {milestone.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="task-description">Description</Label>
                  <Textarea
                    id="task-description"
                    name="description"
                    placeholder="태스크 설명..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="task-scheduled-date">Scheduled Date</Label>
                  <Input
                    id="task-scheduled-date"
                    name="scheduled_date"
                    type="date"
                  />
                </div>
              </div>

              <Button type="submit" size="sm">
                Add Task
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

