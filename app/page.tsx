import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
          Archive 26
        </h1>
        <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
          Make 2026 Count
        </p>
        <p className="mx-auto max-w-[700px] text-lg text-muted-foreground">
          2026년의 모든 순간을 기록하고, 목표를 달성하고, 성장을 추적하세요.
        </p>
      </div>

      <div className="flex gap-4">
        <Link href="/dashboard">
          <Button size="lg">대시보드로 이동</Button>
        </Link>
        <Button size="lg" variant="outline">
          더 알아보기
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mt-12 max-w-5xl w-full">
        <Card>
          <CardHeader>
            <CardTitle>목표 관리</CardTitle>
            <CardDescription>
              2026년 목표를 설정하고 진행상황을 추적하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              작은 목표부터 큰 꿈까지, 체계적으로 관리하고 달성해 나가세요.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" className="w-full">시작하기</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>일일 기록</CardTitle>
            <CardDescription>
              매일의 순간들을 저장하고 돌아보세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              일기, 사진, 메모를 통해 2026년의 이야기를 만들어가세요.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" className="w-full">기록하기</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>성장 분석</CardTitle>
            <CardDescription>
              데이터로 확인하는 나의 성장
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              시각화된 리포트로 한 해의 변화와 성장을 한눈에 확인하세요.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" className="w-full">분석 보기</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

