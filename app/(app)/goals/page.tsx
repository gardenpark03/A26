import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Goal } from "@/lib/types"

export default async function GoalsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Fetch user's goals for 2026
  const { data: goals, error } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", user.id)
    .eq("year", 2026)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching goals:", error)
  }

  const goalsData = goals as Goal[] | null

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your 2026 Goals</h1>
          <p className="text-muted-foreground mt-2">
            Manage and track your objectives for the year
          </p>
        </div>
        <Link href="/goals/new">
          <Button>+ New Goal</Button>
        </Link>
      </div>

      {!goalsData || goalsData.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">
              아직 생성된 목표가 없습니다
            </p>
            <Link href="/goals/new">
              <Button>첫 목표 만들기</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {goalsData.map((goal) => (
            <Card key={goal.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="line-clamp-2">{goal.title}</CardTitle>
                    <CardDescription className="mt-2">
                      {new Date(goal.created_at).toLocaleDateString("ko-KR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </CardDescription>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      goal.status === "active"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : goal.status === "completed"
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                        : goal.status === "paused"
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                    }`}
                  >
                    {goal.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                {goal.description && (
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                    {goal.description}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Year: {goal.year}
                  </span>
                  <Link href={`/goals/${goal.id}`}>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

