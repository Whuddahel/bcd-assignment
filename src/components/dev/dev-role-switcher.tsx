"use client"

import { useDevStore, type UserRole } from "@/stores/dev-store"
import { motion, AnimatePresence } from "framer-motion"
import {
  ShoppingBag,
  Store,
  ShieldCheck,
  HeadphonesIcon,
  ChevronUp,
  User,
} from "lucide-react"
import { cn } from "@/lib/utils"

const roles: { id: UserRole; label: string; icon: React.ElementType; color: string }[] = [
  { id: "customer", label: "Customer",      icon: ShoppingBag,      color: "text-violet-400" },
  { id: "seller",   label: "Seller",        icon: Store,            color: "text-pink-400"   },
  { id: "admin",    label: "Admin",         icon: ShieldCheck,      color: "text-amber-400"  },
  { id: "support",  label: "Support Agent", icon: HeadphonesIcon,   color: "text-emerald-400"},
]

export function DevRoleSwitcher() {
  const { mockRole, setMockRole, isMockPanelOpen, toggleMockPanel } = useDevStore()
  const current = roles.find((r) => r.id === mockRole) ?? roles[0]
  const Icon = current.icon

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-2">
      <AnimatePresence>
        {isMockPanelOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="glass-card rounded-xl p-1.5 shadow-card"
          >
            <div className="mb-1.5 px-2 pt-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Dev Role
            </div>
            {roles.map((role) => {
              const RoleIcon = role.icon
              const isActive = mockRole === role.id
              return (
                <button
                  key={role.id}
                  onClick={() => {
                    setMockRole(role.id)
                    toggleMockPanel()
                  }}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-white/10 text-foreground"
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
                  )}
                >
                  <RoleIcon className={cn("h-3.5 w-3.5", role.color)} />
                  {role.label}
                  {isActive && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-green-400" />
                  )}
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={toggleMockPanel}
        title="Dev: switch role"
        className={cn(
          "flex items-center gap-2 rounded-full border border-white/10 px-3 py-2",
          "bg-midnight-50/90 backdrop-blur-xl shadow-card text-sm font-medium",
          "transition-all hover:border-white/20 hover:bg-midnight-100/90",
        )}
      >
        <User className="h-3.5 w-3.5 text-muted-foreground" />
        <Icon className={cn("h-3.5 w-3.5", current.color)} />
        <span className="text-xs text-muted-foreground">{current.label}</span>
        <ChevronUp
          className={cn(
            "h-3 w-3 text-muted-foreground transition-transform duration-200",
            isMockPanelOpen && "rotate-180",
          )}
        />
      </button>
    </div>
  )
}
