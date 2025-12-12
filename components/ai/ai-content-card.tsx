import React from "react"
import { Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface AiContentCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  children: React.ReactNode
  variant?: "default" | "highlight" | "minimal"
}

export function AiContentCard({ 
  title = "AI Insight", 
  children, 
  variant = "default",
  className,
  ...props 
}: AiContentCardProps) {
  
  return (
    <div 
      className={cn(
        "relative overflow-hidden rounded-xl border transition-all duration-300",
        variant === "default" && "bg-card border-border shadow-sm",
        variant === "highlight" && "bg-primary/5 border-primary/20",
        variant === "minimal" && "bg-transparent border-border/50 border-dashed",
        className
      )}
      {...props}
    >
        {/* Subtle Accent Line */}
        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-primary/40" />

        <div className="p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center justify-center w-6 h-6 rounded-md bg-primary/10 text-primary">
                    <Sparkles className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-semibold text-primary/80 uppercase tracking-wider">
                    AI Generated
                </span>
                {title && (
                   <span className="text-sm font-medium text-foreground ml-auto">{title}</span> 
                )}
            </div>
            
            <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
                {children}
            </div>
        </div>
    </div>
  )
}

