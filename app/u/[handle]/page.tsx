import { notFound } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TagBadge } from "@/components/tags/tag-badge"
import { Pin } from "lucide-react"
import type { ShowcaseItemResolved } from "@/lib/showcase/types"

interface PageProps {
  params: Promise<{
    handle: string
  }>
}

async function resolveShowcaseItems(userId: string): Promise<ShowcaseItemResolved[]> {
  const supabase = await createClient()

  // Get showcase items
  const { data: showcaseItems, error: showcaseError } = await supabase
    .from("showcase_items")
    .select("*")
    .eq("user_id", userId)
    .order("is_pinned", { ascending: false })
    .order("order_index", { ascending: true })

  if (showcaseError) {
    console.error("Error fetching showcase items:", showcaseError)
    return []
  }

  if (!showcaseItems || showcaseItems.length === 0) {
    return []
  }

  const resolved: ShowcaseItemResolved[] = []

  for (const item of showcaseItems) {
    let title = ""
    let description = null
    let meta: any = {}

    if (item.item_type === "goal") {
      const { data: goal, error: goalError } = await supabase
        .from("goals")
        .select("*")
        .eq("id", item.item_id)
        .single()

      if (goalError) {
        console.error(`Error fetching goal ${item.item_id}:`, goalError)
      } else if (goal) {
        title = goal.title
        description = goal.description
        meta = { year: goal.year, status: goal.status, goal_id: goal.id, goalId: goal.id }
      }
    } else if (item.item_type === "log") {
      const { data: log, error: logError } = await supabase
        .from("logs")
        .select("*")
        .eq("id", item.item_id)
        .eq("visibility", "public")
        .single()

      if (logError) {
        console.error(`Error fetching log ${item.item_id}:`, logError)
      } else if (log) {
        title = log.title || "(제목 없음)"
        description = log.content?.slice(0, 200) + (log.content?.length > 200 ? "..." : "")
        meta = { date: log.log_date, tags: log.tags }
      }
    } else if (item.item_type === "project") {
      const { data: project, error: projectError } = await supabase
        .from("projects")
        .select("*")
        .eq("id", item.item_id)
        .single()

      if (projectError) {
        console.error(`Error fetching project ${item.item_id}:`, projectError)
      } else if (project) {
        title = project.title
        description = project.description
      }
    }

    // Apply overrides
    if (item.title_override) title = item.title_override
    if (item.description_override) description = item.description_override

    if (title) {
      resolved.push({
        id: item.id,
        type: item.item_type as any,
        title,
        description,
        isPinned: item.is_pinned,
        orderIndex: item.order_index,
        meta,
      })
    }
  }

  return resolved
}

export default async function PublicShowcasePage({ params }: PageProps) {
  const { handle } = await params
  const supabase = await createClient()

  // Fetch profile by handle
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("handle", handle)
    .single()

  if (error || !profile) {
    notFound()
  }

  if (!profile.is_public) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md w-full">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="text-6xl mb-4">🔒</div>
            <p className="text-xl font-semibold mb-2">비공개 프로필</p>
            <p className="text-muted-foreground text-center">
              이 사용자는 프로필을 공개하지 않았습니다
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Fetch showcase items
  const showcaseItems = await resolveShowcaseItems(profile.id)

  const initial = (profile.full_name || profile.username || profile.handle)?.[0].toUpperCase()

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-6 py-12">
          <div className="flex items-start gap-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-foreground text-3xl font-bold">
              {initial}
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2">
                {profile.full_name || profile.username || profile.handle}
              </h1>
              <p className="text-lg text-muted-foreground mb-3">
                @{profile.handle}
              </p>
              {profile.bio && (
                <p className="text-muted-foreground">{profile.bio}</p>
              )}
              <p className="text-sm text-muted-foreground mt-4">
                Archive 26 – 2026 Journey
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Showcase Grid */}
      <div className="container mx-auto px-6 py-12">
        {showcaseItems.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="text-6xl mb-4">📦</div>
              <p className="text-xl font-semibold mb-2">아직 전시된 항목이 없습니다</p>
              <p className="text-muted-foreground">
                곧 멋진 콘텐츠가 추가될 예정입니다
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {showcaseItems.map((item) => {
              const typeInfo = {
                goal: { emoji: "🎯", label: "Goal", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
                log: { emoji: "📝", label: "Log", color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" },
                project: { emoji: "💼", label: "Project", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
              }[item.type]

              // Determine link based on item type
              const itemLink = item.type === "goal" ? `/u/${handle}/goals/${(item.meta as any)?.goalId || ""}` : null

              const cardContent = (
                <Card className={itemLink ? "hover:shadow-lg transition-shadow cursor-pointer" : ""}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <Badge variant="secondary" className={typeInfo.color}>
                        {typeInfo.emoji} {typeInfo.label}
                      </Badge>
                      {item.isPinned && (
                        <Pin className="h-4 w-4 text-primary fill-current" />
                      )}
                    </div>
                    <CardTitle className="line-clamp-2 mt-2">
                      {item.title}
                    </CardTitle>
                    {item.meta?.year && (
                      <CardDescription>Year: {item.meta.year}</CardDescription>
                    )}
                    {item.meta?.date && (
                      <CardDescription>
                        {new Date(item.meta.date).toLocaleDateString("ko-KR")}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    {item.description && (
                      <p className="text-sm text-muted-foreground line-clamp-4 mb-4">
                        {item.description}
                      </p>
                    )}
                    {item.meta?.tags && item.meta.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {item.meta.tags.slice(0, 5).map((tag: string, idx: number) => (
                          <TagBadge key={idx} label={tag} />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )

              return itemLink ? (
                <Link key={item.id} href={itemLink}>
                  {cardContent}
                </Link>
              ) : (
                <div key={item.id}>{cardContent}</div>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t py-8">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm text-muted-foreground">
            Powered by <span className="font-semibold">Archive 26</span> – Make 2026 Count
          </p>
        </div>
      </div>
    </div>
  )
}

