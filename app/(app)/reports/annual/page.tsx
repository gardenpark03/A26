import { redirect } from "next/navigation"
import dynamic from "next/dynamic"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { generateAnnualReportAction } from "./actions"
import type { AnnualReportPayload } from "@/lib/ai/annual-report"

// Dynamic import for AnnualReportView (heavy component)
const AnnualReportView = dynamic(
  () => import("@/components/reports/annual-report-view").then(mod => ({ default: mod.AnnualReportView })),
  {
    loading: () => (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-muted-foreground">리포트 로딩 중...</div>
      </div>
    ),
  }
)

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function AnnualReportPage({ searchParams }: PageProps) {
  const params = await searchParams
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Parse year from query params
  const year = Number(params.year) || 2026

  // Fetch existing report
  const { data: existingReport } = await supabase
    .from("annual_reports")
    .select("*")
    .eq("user_id", user.id)
    .eq("year", year)
    .single()

  const reportPayload = existingReport?.report as AnnualReportPayload | null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Annual Report</h1>
          <p className="text-muted-foreground mt-2">
            {year}년 한 해 동안의 목표, 태스크, 기록, 습관 데이터를 바탕으로 AI가 연말 리포트를 만들어줍니다
          </p>
        </div>

        {/* Year Selector */}
        <form action="" method="GET" className="flex gap-2 items-center">
          <Label htmlFor="year" className="text-sm">연도:</Label>
          <Input
            id="year"
            name="year"
            type="number"
            defaultValue={year}
            min={2024}
            max={2030}
            className="w-24"
          />
          <Button type="submit" size="sm" variant="outline">
            변경
          </Button>
        </form>
      </div>

      {/* Existing Report */}
      {reportPayload ? (
        <>
          <AnnualReportView report={reportPayload} />
          
          {/* Regenerate Button */}
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  이 리포트는{" "}
                  {new Date(reportPayload.generatedAt).toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                  에 생성되었습니다
                </p>
                <form
                  action={async () => {
                    "use server"
                    await generateAnnualReportAction(year)
                  }}
                >
                  <Button type="submit" variant="outline" size="sm">
                    다시 생성하기
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        /* No Report Yet */
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20">
            <div className="text-6xl mb-6">📊</div>
            <p className="text-2xl font-semibold mb-3">
              아직 {year}년 연말 리포트가 없습니다
            </p>
            <p className="text-muted-foreground text-center max-w-md mb-8">
              AI가 당신의 {year}년 전체 활동을 분석하여
              <br />
              목표 달성, 습관 형성, 성장 과정을 종합한 연말 리포트를 만들어드립니다
            </p>
            <form
              action={async () => {
                "use server"
                await generateAnnualReportAction(year)
              }}
            >
              <Button type="submit" size="lg">
                <span className="mr-2">✨</span>
                AI로 {year}년 리포트 생성하기
              </Button>
            </form>
            <p className="text-xs text-muted-foreground mt-4">
              리포트 생성에는 약 30초~1분 정도 소요됩니다
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

