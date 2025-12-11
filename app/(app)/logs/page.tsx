import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { LogListItem } from "@/components/logs/log-list-item"
import type { Log } from "@/lib/types"

export default async function LogsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Fetch user's logs
  const { data: logs, error } = await supabase
    .from("logs")
    .select("*")
    .eq("user_id", user.id)
    .order("log_date", { ascending: false })
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching logs:", error)
  }

  const logsData = (logs as Log[]) || []

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Daily Logs</h1>
          <p className="text-muted-foreground mt-2">
            하루하루의 기록을 되돌아보세요
          </p>
        </div>
        <Link href="/logs/new">
          <Button>+ New Log</Button>
        </Link>
      </div>

      {logsData.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="text-6xl mb-4">📝</div>
            <p className="text-xl font-semibold mb-2">아직 기록이 없습니다</p>
            <p className="text-muted-foreground mb-6">
              오늘 하루를 기록해보세요!
            </p>
            <Link href="/logs/new">
              <Button size="lg">첫 기록 작성하기</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {logsData.map((log) => (
            <LogListItem key={log.id} log={log} />
          ))}
        </div>
      )}
    </div>
  )
}

