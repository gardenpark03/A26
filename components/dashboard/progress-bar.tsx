import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface ProgressBarProps {
  year: number
}

export function ProgressBar({ year }: ProgressBarProps) {
  const now = new Date()
  const startOfYear = new Date(year, 0, 1) // January 1
  const endOfYear = new Date(year, 11, 31, 23, 59, 59) // December 31
  
  // Calculate total days in year (366 for 2026, it's a leap year? Actually 2026 is not a leap year, 365 days)
  const totalDays = Math.ceil((endOfYear.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)) + 1
  
  // Calculate days passed
  let daysPassed = 0
  let percentage = 0
  
  if (now >= endOfYear) {
    // Year has ended
    daysPassed = totalDays
    percentage = 100
  } else if (now <= startOfYear) {
    // Year hasn't started
    daysPassed = 0
    percentage = 0
  } else {
    // Year in progress
    daysPassed = Math.ceil((now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24))
    percentage = Math.round((daysPassed / totalDays) * 100)
  }
  
  const daysRemaining = totalDays - daysPassed

  return (
    <Card>
      <CardHeader>
        <CardTitle>Year Progress - {year}</CardTitle>
        <CardDescription>
          {daysPassed}일 경과 / {daysRemaining}일 남음
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {startOfYear.toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}
            </span>
            <span className="font-bold text-2xl">{percentage}%</span>
            <span className="text-muted-foreground">
              {endOfYear.toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}
            </span>
          </div>
          
          <div className="h-4 w-full bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
          
          <p className="text-xs text-center text-muted-foreground mt-2">
            {percentage < 25 && "새로운 시작! 목표를 향해 나아가세요 🚀"}
            {percentage >= 25 && percentage < 50 && "순조롭게 진행 중입니다 💪"}
            {percentage >= 50 && percentage < 75 && "반환점을 지났습니다! 계속 전진하세요 🎯"}
            {percentage >= 75 && percentage < 100 && "거의 다 왔습니다! 마무리 잘하세요 🏁"}
            {percentage === 100 && "한 해를 완주하셨습니다! 🎉"}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

