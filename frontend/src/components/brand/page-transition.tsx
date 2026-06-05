"use client"

import { motion } from "framer-motion"

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number]

export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: EASE }}
    >
      {children}
    </motion.div>
  )
}
