import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ALL_WIDGETS, type DashboardWidget } from "@/lib/dashboard/widgets"
import { WidgetCustomizer } from "@/components/dashboard/widget-customizer"

async function saveWidgetSettings(formData: FormData) {
  "use server"

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Unauthorized" }
  }

  // Parse form data
  const widgets = ALL_WIDGETS.map((widget, idx) => {
    const isEnabled = formData.get(`widget_${widget.type}_enabled`) === "on"
    const sortOrder = parseInt(formData.get(`widget_${widget.type}_order`) as string) || idx

    return {
      widget_type: widget.type,
      is_enabled: isEnabled,
      sort_order: sortOrder,
    }
  })

  // Delete existing widgets
  await supabase
    .from("dashboard_widgets")
    .delete()
    .eq("user_id", user.id)

  // Insert new settings
  const { error } = await supabase.from("dashboard_widgets").insert(
    widgets.map((w) => ({
      user_id: user.id,
      widget_type: w.widget_type,
      is_enabled: w.is_enabled,
      sort_order: w.sort_order,
    }))
  )

  if (error) {
    console.error("Error saving widget settings:", error)
    return { error: error.message }
  }

  redirect("/dashboard")
}

async function getWidgetSettings(userId: string): Promise<DashboardWidget[]> {
  const supabase = await createClient()

  const { data: widgets } = await supabase
    .from("dashboard_widgets")
    .select("*")
    .eq("user_id", userId)
    .order("sort_order", { ascending: true })

  if (widgets && widgets.length > 0) {
    return widgets as DashboardWidget[]
  }

  return ALL_WIDGETS.map((w, idx) => ({
    id: `default-${w.type}`,
    user_id: userId,
    widget_type: w.type,
    is_enabled: w.defaultEnabled,
    sort_order: idx,
    config: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }))
}

export default async function CustomizeDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const widgetSettings = await getWidgetSettings(user.id)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customize Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            위젯을 켜거나 끄고, 순서를 변경하세요
          </p>
        </div>
        <Link href="/dashboard">
          <Button variant="outline">← Back to Dashboard</Button>
        </Link>
      </div>

      {/* Info Card */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div className="text-sm text-muted-foreground">
              <p>
                대시보드에 표시할 위젯을 선택하고 순서를 조정할 수 있습니다.
                변경사항은 저장 버튼을 누르면 바로 적용됩니다.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Widget Customizer */}
      <WidgetCustomizer
        widgets={widgetSettings}
        allWidgetDefinitions={ALL_WIDGETS}
        onSave={saveWidgetSettings}
      />
    </div>
  )
}

