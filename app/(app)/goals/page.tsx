import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Target, MoreHorizontal, Calendar, ArrowRight, CheckCircle2, Sparkles } from "lucide-react"
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
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching goals:", error)
  }

  const goalsData = goals as Goal[] | null

  // Status Badge Helper
  const getStatusBadge = (status: string) => {
    switch(status) {
        case 'active':
            return <Badge variant="secondary" className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-200/50">Active</Badge>
        case 'completed':
            return <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-blue-200/50">Completed</Badge>
        case 'paused':
            return <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20 border-yellow-200/50">Paused</Badge>
        default:
            return <Badge variant="outline" className="text-muted-foreground">Draft</Badge>
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <div className="flex items-center gap-2 mb-1">
                <Target className="w-5 h-5 text-primary" />
                <h1 className="text-page-title">Goals</h1>
            </div>
            <p className="text-body">
                2026년의 핵심 목표를 설정하고 달성 과정을 추적하세요.
            </p>
        </div>
        <div className="flex gap-3">
          <Link href="/goals/ai">
            <Button variant="outline" className="shadow-sm">
              <Sparkles className="w-4 h-4 mr-2" />
              AI Pathfinder
            </Button>
          </Link>
          <Link href="/goals/new">
            <Button className="shadow-md shadow-primary/20">
              <Target className="w-4 h-4 mr-2" />
              New Goal
            </Button>
          </Link>
        </div>
      </div>

      {/* Goals List/Grid */}
      {!goalsData || goalsData.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-secondary/50 rounded-full flex items-center justify-center mb-4">
                <Target className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">아직 설정된 목표가 없습니다</h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
              크고 작은 목표를 세우고 하나씩 달성해나가는 즐거움을 느껴보세요.
            </p>
            <div className="flex gap-3">
              <Link href="/goals/ai">
                <Button variant="outline">
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI로 목표 설계하기
                </Button>
              </Link>
              <Link href="/goals/new">
                <Button>직접 목표 만들기</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {goalsData.map((goal) => (
            <Link key={goal.id} href={`/goals/${goal.id}`}>
                <Card className="h-full hover:border-primary/50 transition-all duration-300 group cursor-pointer">
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between mb-2">
                        {getStatusBadge(goal.status)}
                        <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 -mt-2 text-muted-foreground hover:text-foreground">
                            <MoreHorizontal className="w-4 h-4" />
                        </Button>
                    </div>
                    <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
                        {goal.title}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {goal.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-6 min-h-[40px]">
                            {goal.description}
                        </p>
                    )}
                    
                    {/* Progress Indicator (Mocked for now if no milestones) */}
                    <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Progress</span>
                            <span>{goal.status === 'completed' ? '100%' : '0%'}</span>
                        </div>
                        <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                             <div 
                                className="h-full bg-primary rounded-full transition-all duration-500" 
                                style={{ width: goal.status === 'completed' ? '100%' : '5%' }} 
                             />
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border/50">
                        <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{new Date(goal.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1 group-hover:translate-x-1 transition-transform text-foreground font-medium">
                            Details <ArrowRight className="w-3 h-3" />
                        </div>
                    </div>
                </CardContent>
                </Card>
            </Link>
          ))}
          
            {/* Add New Placeholder Card */}
            <Link href="/goals/new" className="group">
                <div className="h-full min-h-[200px] rounded-xl border border-dashed border-border flex flex-col items-center justify-center gap-3 text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all">
                    <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Target className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-medium">Add New Goal</span>
                </div>
            </Link>
        </div>
      )}
    </div>
  )
}
