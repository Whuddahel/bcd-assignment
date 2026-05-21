"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import {
  LayoutDashboard, Package, Heart, User, ChevronRight, LogOut, Star,
} from "lucide-react"
import { Header } from "@/components/layout/header"
import { cn } from "@/lib/utils"

const NAV = [
  { href: "/account",              label: "Overview",    icon: LayoutDashboard },
  { href: "/account/orders",       label: "Orders",      icon: Package         },
  { href: "/account/wishlist",     label: "Wishlist",    icon: Heart           },
  { href: "/account/collection",   label: "Collection",  icon: Star            },
  { href: "/account/profile",      label: "Profile",     icon: User            },
]

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <>
      <Header />
      <div className="flex min-h-screen bg-midnight pt-16">
        {/* Sidebar */}
        <aside className="hidden w-60 shrink-0 border-r border-white/5 lg:block">
          <div className="sticky top-16 flex h-[calc(100vh-4rem)] flex-col px-4 py-6">
            <p className="mb-4 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              My Account
            </p>
            <nav className="flex flex-1 flex-col gap-1">
              {NAV.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                    pathname === href
                      ? "bg-violet-500/15 text-violet-300"
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                  {pathname === href && <ChevronRight className="ml-auto h-3.5 w-3.5" />}
                </Link>
              ))}
            </nav>
            <button className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-all hover:bg-white/5 hover:text-foreground">
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </>
  )
}
