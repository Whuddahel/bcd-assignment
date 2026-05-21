"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface GradientBlobProps {
  className?: string
  color?: "violet" | "pink" | "amber" | "mixed"
  size?: "sm" | "md" | "lg" | "xl"
  animated?: boolean
  delay?: number
}

const colorMap = {
  violet: "bg-violet-500/20",
  pink:   "bg-pink-500/20",
  amber:  "bg-amber-500/15",
  mixed:  "bg-violet-500/10",
}

const sizeMap = {
  sm: "w-64 h-64",
  md: "w-96 h-96",
  lg: "w-[600px] h-[600px]",
  xl: "w-[800px] h-[800px]",
}

export function GradientBlob({
  className,
  color = "violet",
  size = "lg",
  animated = true,
  delay = 0,
}: GradientBlobProps) {
  const blobClass = cn(
    "absolute rounded-full blur-3xl pointer-events-none select-none",
    colorMap[color],
    sizeMap[size],
    className,
  )

  if (!animated) {
    return <div className={blobClass} aria-hidden="true" />
  }

  return (
    <motion.div
      className={blobClass}
      aria-hidden="true"
      animate={{
        scale: [1, 1.15, 0.95, 1.1, 1],
        x: [0, 30, -20, 15, 0],
        y: [0, -20, 30, -10, 0],
        opacity: [0.6, 0.8, 0.5, 0.7, 0.6],
      }}
      transition={{
        duration: 18,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  )
}

export function HeroBlobBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Violet — top left */}
      <GradientBlob
        color="violet"
        size="xl"
        className="-left-32 -top-32"
        delay={0}
      />
      {/* Pink — center right */}
      <GradientBlob
        color="pink"
        size="lg"
        className="-right-24 top-1/4"
        delay={4}
      />
      {/* Amber — bottom right */}
      <GradientBlob
        color="amber"
        size="md"
        className="bottom-0 right-1/4"
        delay={8}
      />
      {/* Violet hint — bottom left */}
      <GradientBlob
        color="violet"
        size="sm"
        className="bottom-1/4 -left-16"
        delay={12}
      />
    </div>
  )
}
