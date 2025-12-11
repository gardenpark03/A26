import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { updateShowcaseProfile, addShowcaseItem, removeShowcaseItem, updateShowcaseItemOrder, toggleShowcasePin } from "./actions"
import { ShowcaseItemCard } from "@/components/showcase/showcase-item-card"
import type { ShowcaseItem } from "@/lib/showcase/types"

export default async function ShowcasePage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Fetch profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  // Fetch showcase items
  const { data: showcaseItems } = await supabase
    .from("showcase_items")
    .select("*")
    .eq("user_id", user.id)
    .order("is_pinned", { ascending: false })
    .order("order_index", { ascending: true })

  const showcaseData = (showcaseItems as ShowcaseItem[]) || []
  const showcaseItemIds = new Set(showcaseData.map((item) => item.item_id))

  // Fetch available content (not in showcase)
  const { data: goals } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", user.id)
    .neq("status", "archived")

  const { data: logs } = await supabase
    .from("logs")
    .select("*")
    .eq("user_id", user.id)
    .eq("visibility", "public")
    .order("log_date", { ascending: false })
    .limit(20)

  const availableGoals = goals?.filter((g) => !showcaseItemIds.has(g.id)) || []
  const availableLogs = logs?.filter((l) => !showcaseItemIds.has(l.id)) || []

  const publicUrl = profile?.handle ? `/u/${profile.handle}` : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Showcase Settings</h1>
          <p className="text-muted-foreground mt-2">
            나의 2026년을 전시하세요
          </p>
        </div>
        {publicUrl && (
          <Link href={publicUrl} target="_blank">
            <Button variant="outline">
              🌐 Public Page 보기
            </Button>
          </Link>
        )}
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Public Profile 설정</CardTitle>
          <CardDescription>
            퍼블릭 Showcase 페이지에 표시될 정보
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateShowcaseProfile} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="handle">핸들 *</Label>
              <div className="flex gap-2">
                <Input
                  id="handle"
                  name="handle"
                  placeholder="예: jason"
                  defaultValue={profile?.handle || ""}
                  pattern="[a-z0-9_-]+"
                  required
                />
                {profile?.handle && (
                  <div className="flex items-center px-3 text-sm text-muted-foreground bg-muted rounded-md">
                    /u/{profile.handle}
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                소문자, 숫자, 하이픈(-), 언더스코어(_)만 사용 가능
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">소개</Label>
              <Textarea
                id="bio"
                name="bio"
                placeholder="한 줄 자기소개를 입력하세요"
                defaultValue={profile?.bio || ""}
                rows={3}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_public"
                name="is_public"
                defaultChecked={profile?.is_public ?? true}
                className="h-4 w-4"
              />
              <Label htmlFor="is_public">
                퍼블릭 프로필 공개 (체크 해제 시 /u/[handle] 페이지가 비활성화됩니다)
              </Label>
            </div>

            <Button type="submit">프로필 저장</Button>
          </form>
        </CardContent>
      </Card>

      {/* Showcase Management */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Available Items */}
        <Card>
          <CardHeader>
            <CardTitle>추가 가능한 항목</CardTitle>
            <CardDescription>
              쇼케이스에 추가할 콘텐츠를 선택하세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Goals */}
            {availableGoals.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Goals</h4>
                {availableGoals.slice(0, 5).map((goal) => (
                  <div
                    key={goal.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">{goal.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {goal.year} · {goal.status}
                      </p>
                    </div>
                    <form action={async () => {
                      "use server"
                      await addShowcaseItem("goal", goal.id)
                    }}>
                      <Button size="sm" variant="outline">
                        추가
                      </Button>
                    </form>
                  </div>
                ))}
              </div>
            )}

            {/* Logs */}
            {availableLogs.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Public Logs</h4>
                {availableLogs.slice(0, 5).map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">{log.title || "(제목 없음)"}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(log.log_date).toLocaleDateString("ko-KR")}
                      </p>
                    </div>
                    <form action={async () => {
                      "use server"
                      await addShowcaseItem("log", log.id)
                    }}>
                      <Button size="sm" variant="outline">
                        추가
                      </Button>
                    </form>
                  </div>
                ))}
              </div>
            )}

            {availableGoals.length === 0 && availableLogs.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                쇼케이스에 추가할 수 있는 콘텐츠가 없습니다
              </p>
            )}
          </CardContent>
        </Card>

        {/* My Showcase */}
        <Card>
          <CardHeader>
            <CardTitle>My Showcase</CardTitle>
            <CardDescription>
              전시 중인 항목 ({showcaseData.length}개)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {showcaseData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                아직 쇼케이스에 추가된 항목이 없습니다
              </p>
            ) : (
              showcaseData.map((item, index) => (
                <ShowcaseItemCard
                  key={item.id}
                  item={item}
                  index={index}
                  totalItems={showcaseData.length}
                  onRemove={removeShowcaseItem}
                  onMove={updateShowcaseItemOrder}
                  onTogglePin={toggleShowcasePin}
                />
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

