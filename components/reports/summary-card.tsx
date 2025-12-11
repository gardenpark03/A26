import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface SummaryCardProps {
  title: string
  content: string | string[]
  icon?: string
  variant?: "default" | "highlight" | "challenge" | "suggestion"
}

export function SummaryCard({ title, content, icon, variant = "default" }: SummaryCardProps) {
  const variantStyles = {
    default: "border-border",
    highlight: "border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20",
    challenge: "border-orange-200 bg-orange-50/50 dark:border-orange-900 dark:bg-orange-950/20",
    suggestion: "border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20",
  }

  return (
    <Card className={variantStyles[variant]}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon && <span className="text-xl">{icon}</span>}
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {typeof content === "string" ? (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
        ) : (
          <ul className="space-y-2">
            {content.map((item, index) => (
              <li key={index} className="text-sm leading-relaxed flex gap-2">
                <span className="text-muted-foreground mt-0.5">•</span>
                <span className="flex-1">{item}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

