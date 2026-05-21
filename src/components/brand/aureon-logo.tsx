import { cn } from "@/lib/utils"

interface AureonLogoProps {
  className?: string
  showWordmark?: boolean
  size?: "sm" | "md" | "lg"
}

const sizes = {
  sm: { mark: 24, text: "text-lg" },
  md: { mark: 32, text: "text-xl" },
  lg: { mark: 40, text: "text-2xl" },
}

export function AureonLogo({
  className,
  showWordmark = true,
  size = "md",
}: AureonLogoProps) {
  const { mark, text } = sizes[size]

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      {/* Logomark — stylized "A" with gradient */}
      <svg
        width={mark}
        height={mark}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="aureon-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="oklch(0.65 0.22 280)" />
            <stop offset="50%" stopColor="oklch(0.70 0.22 340)" />
            <stop offset="100%" stopColor="oklch(0.82 0.16 75)" />
          </linearGradient>
        </defs>
        {/* Outer hexagon */}
        <path
          d="M20 2L36 11V29L20 38L4 29V11L20 2Z"
          fill="url(#aureon-grad)"
          opacity="0.15"
        />
        <path
          d="M20 2L36 11V29L20 38L4 29V11L20 2Z"
          stroke="url(#aureon-grad)"
          strokeWidth="1.5"
          fill="none"
        />
        {/* Inner "A" mark */}
        <path
          d="M20 10L28 28H24L22.5 24H17.5L16 28H12L20 10ZM20 16L18.5 21H21.5L20 16Z"
          fill="url(#aureon-grad)"
        />
      </svg>

      {showWordmark && (
        <span
          className={cn(
            "font-display font-bold tracking-tight",
            text,
            "gradient-brand-text",
          )}
        >
          Aureon
        </span>
      )}
    </div>
  )
}
