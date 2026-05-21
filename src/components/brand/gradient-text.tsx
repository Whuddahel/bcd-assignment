import { cn } from "@/lib/utils"

interface GradientTextProps {
  children: React.ReactNode
  className?: string
  animated?: boolean
  as?: React.ElementType
}

export function GradientText({
  children,
  className,
  animated = false,
  as: Tag = "span",
}: GradientTextProps) {
  return (
    <Tag
      className={cn(
        animated ? "gradient-brand-animated" : "gradient-brand-text",
        className,
      )}
    >
      {children}
    </Tag>
  )
}
