"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import {
  LayoutDashboard, Package, ShoppingBag, BarChart2, ChevronRight, LogOut, Plus, Store,
} from "lucide-react"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const NAV = [
  { href: "/seller",           label: "Dashboard",  icon: LayoutDashboard },
  { href: "/seller/products",  label: "Listings",   icon: Package         },
  { href: "/seller/orders",    label: "Orders",     icon: ShoppingBag     },
  { href: "/seller/analytics", label: "Analytics",  icon: BarChart2       },
  { href: "/seller/apply",     label: "Apply",      icon: Store           },
]

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <>
      <Header />
      <div className="flex min-h-screen bg-midnight pt-16">
        <aside className="hidden w-60 shrink-0 border-r border-white/5 lg:block">
          <div className="sticky top-16 flex h-[calc(100vh-4rem)] flex-col px-4 py-6">
            <div className="mb-4 px-3">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Seller Hub</p>
              <p className="mt-0.5 text-xs text-violet-400 font-medium">WatchVault Geneva</p>
            </div>

            <Button size="sm" className="gradient-brand mb-4 gap-2 border-0 text-white hover:opacity-90" asChild>
              <Link href="/seller/products/new"><Plus className="h-3.5 w-3.5" /> New Listing</Link>
            </Button>

            <nav className="flex flex-1 flex-col gap-1">
              {NAV.map(({ href, label, icon: Icon }) => {
                const active = href === "/seller" ? pathname === href : pathname.startsWith(href)
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                      active
                        ? "bg-violet-500/15 text-violet-300"
                        : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                    {active && <ChevronRight className="ml-auto h-3.5 w-3.5" />}
                  </Link>
                )
              })}
            </nav>
            <button className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-all hover:bg-white/5 hover:text-foreground">
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </aside>

        <main className="flex-1 overflow-auto">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </>
  )
}
