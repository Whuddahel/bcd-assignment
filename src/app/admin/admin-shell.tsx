"use client"

import { useTransition } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import {
  LayoutDashboard, Users, Package, ShoppingBag, Store, ChevronRight, LogOut, Shield,
} from "lucide-react"
import { Header } from "@/components/layout/header"
import { Badge } from "@/components/ui/badge"
import { signOut } from "@/lib/auth/actions"
import { cn } from "@/lib/utils"

export function AdminShell({
  pendingProducts,
  pendingSellers,
  children,
}: {
  pendingProducts: number
  pendingSellers: number
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [signingOut, startSignOut] = useTransition()

  const NAV = [
    { href: "/admin",           label: "Overview",  icon: LayoutDashboard },
    { href: "/admin/users",     label: "Users",     icon: Users           },
    { href: "/admin/products",  label: "Products",  icon: Package,  badge: pendingProducts || undefined },
    { href: "/admin/sellers",   label: "Sellers",   icon: Store,    badge: pendingSellers || undefined },
    { href: "/admin/orders",    label: "Orders",    icon: ShoppingBag     },
  ]

  return (
    <>
      <Header />
      <div className="flex min-h-screen bg-midnight pt-16">
        <aside className="hidden w-60 shrink-0 border-r border-white/5 lg:block">
          <div className="sticky top-16 flex h-[calc(100vh-4rem)] flex-col px-4 py-6">
            <div className="mb-4 flex items-center gap-2 px-3">
              <Shield className="h-4 w-4 text-amber-400" />
              <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-400">Admin Panel</p>
            </div>

            <nav className="flex flex-1 flex-col gap-1">
              {NAV.map(({ href, label, icon: Icon, badge }) => {
                const active = href === "/admin" ? pathname === href : pathname.startsWith(href)
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                      active
                        ? "bg-amber-500/15 text-amber-300"
                        : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                    <div className="ml-auto flex items-center gap-1">
                      {badge && (
                        <Badge className="h-4 min-w-4 justify-center rounded-full px-1 text-[10px] bg-amber-500/20 text-amber-300 border-0">
                          {badge}
                        </Badge>
                      )}
                      {active && <ChevronRight className="h-3.5 w-3.5" />}
                    </div>
                  </Link>
                )
              })}
            </nav>

            <button
              onClick={() => startSignOut(async () => { await signOut() })}
              disabled={signingOut}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-all hover:bg-white/5 hover:text-foreground disabled:opacity-60"
            >
              <LogOut className="h-4 w-4" />
              {signingOut ? "Signing out…" : "Sign out"}
            </button>
          </div>
        </aside>

        <main className="flex-1 overflow-auto">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </>
  )
}
