import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Log, LogMood } from "@/lib/types"

interface LogListItemProps {
  log: Log
}

const moodEmojis: Record<LogMood, string> = {
  very_bad: "😢",
  bad: "😟",
  neutral: "😐",
  good: "😊",
  very_good: "😄",
}

const moodLabels: Record<LogMood, string> = {
  very_bad: "매우 안좋음",
  bad: "안좋음",
  neutral: "보통",
  good: "좋음",
  very_good: "매우 좋음",
}

const moodColors: Record<LogMood, string> = {
  very_bad: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  bad: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  neutral: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  good: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  very_good: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
}

export function LogListItem({ log }: LogListItemProps) {
  const contentSnippet = log.content.slice(0, 150) + (log.content.length > 150 ? "..." : "")

  return (
    <Link href={`/logs/${log.id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <CardTitle className="line-clamp-1">
                {log.title || "(제목 없음)"}
              </CardTitle>
              <CardDescription className="mt-1">
                {new Date(log.log_date).toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  weekday: "short",
                })}
              </CardDescription>
            </div>
            
            {log.mood && (
              <div
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                  moodColors[log.mood]
                }`}
              >
                <span>{moodEmojis[log.mood]}</span>
                <span>{moodLabels[log.mood]}</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-3 whitespace-pre-wrap">
            {contentSnippet}
          </p>
        </CardContent>
      </Card>
    </Link>
  )
}

