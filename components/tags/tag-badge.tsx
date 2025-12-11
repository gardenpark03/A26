import { Badge } from "@/components/ui/badge"

interface TagBadgeProps {
  label: string
}

export function TagBadge({ label }: TagBadgeProps) {
  return (
    <Badge variant="secondary" className="text-xs">
      {label}
    </Badge>
  )
}

