import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default async function WorkspacePage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workspace</h1>
          <p className="text-muted-foreground mt-2">
            프로젝트와 리소스를 관리하세요
          </p>
        </div>
        <Button>+ New Project</Button>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="text-6xl mb-4">🚧</div>
          <p className="text-xl font-semibold mb-2">Workspace 기능 준비 중</p>
          <p className="text-muted-foreground mb-6">
            곧 프로젝트와 리소스 관리 기능이 추가됩니다
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

