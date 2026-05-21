"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  ShoppingCart,
  Bell,
  Menu,
  X,
  Sun,
  Moon,
  ChevronDown,
  User,
  Package,
  Heart,
  Star,
  LogOut,
  LayoutDashboard,
  Store,
  ShieldCheck,
  HeadphonesIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { AureonLogo } from "@/components/brand/aureon-logo"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useCartStore } from "@/stores/cart-store"
import { useNotificationsStore } from "@/stores/notifications-store"
import { CartSidebar } from "@/components/shop/cart-sidebar"
import { SearchModal } from "@/components/layout/search-modal"
import { NotificationsDropdown } from "@/components/layout/notifications-dropdown"

const navLinks = [
  {
    label: "Explore",
    href: "/browse",
    children: [
      { label: "All Collectibles", href: "/browse" },
      { label: "Watches",          href: "/browse?category=watches" },
      { label: "Fine Art",         href: "/browse?category=fine-art" },
      { label: "Designer Pieces",  href: "/browse?category=designer" },
      { label: "Rare Items",       href: "/browse?category=rare-items" },
      { label: "Jewellery",        href: "/browse?category=jewellery" },
      { label: "Collectibles",     href: "/browse?category=collectibles" },
    ],
  },
  { label: "Trending",     href: "/browse?sort=trending" },
  { label: "Sellers",      href: "/sellers" },
  { label: "How it Works", href: "/#how-it-works" },
]

const accountMenuItems = [
  { label: "My Account",    href: "/account",            icon: User },
  { label: "Orders",        href: "/account/orders",     icon: Package },
  { label: "Wishlist",      href: "/account/wishlist",   icon: Heart },
  { label: "Collection",    href: "/account/collection", icon: Star },
  { label: "Seller Hub",    href: "/seller",             icon: Store },
  { label: "Admin",         href: "/admin",              icon: ShieldCheck },
  { label: "Support Inbox", href: "/support",            icon: HeadphonesIcon },
]

export function Header() {
  const [scrolled,        setScrolled]        = useState(false)
  const [mobileOpen,      setMobileOpen]      = useState(false)
  const [activeDropdown,  setActiveDropdown]  = useState<string | null>(null)
  const [accountOpen,     setAccountOpen]     = useState(false)
  const [searchOpen,      setSearchOpen]      = useState(false)
  const { theme, setTheme }                   = useTheme()
  const [mounted,         setMounted]         = useState(false)

  const cartCount  = useCartStore((s) => s.totalItems())
  const openCart   = useCartStore((s) => s.openCart)
  const unread     = useNotificationsStore((s) => s.unreadCount())
  const toggleNotif = useNotificationsStore((s) => s.togglePanel)
  const notifOpen  = useNotificationsStore((s) => s.isOpen)

  const notifRef   = useRef<HTMLDivElement>(null)
  const accountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // ⌘K opens search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setSearchOpen((o) => !o)
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  return (
    <>
      <header
        className={cn(
          "fixed top-0 z-40 w-full transition-all duration-300",
          scrolled
            ? "border-b border-white/5 bg-midnight/90 backdrop-blur-xl shadow-card"
            : "bg-transparent",
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="shrink-0">
            <AureonLogo size="md" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
            {navLinks.map((link) => (
              <div
                key={link.label}
                className="relative"
                onMouseEnter={() => link.children && setActiveDropdown(link.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  href={link.href}
                  className={cn(
                    "flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium",
                    "text-muted-foreground transition-colors hover:text-foreground",
                  )}
                >
                  {link.label}
                  {link.children && (
                    <ChevronDown
                      className={cn(
                        "h-3.5 w-3.5 transition-transform",
                        activeDropdown === link.label && "rotate-180",
                      )}
                    />
                  )}
                </Link>

                <AnimatePresence>
                  {link.children && activeDropdown === link.label && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 top-full pt-1"
                    >
                      <div className="glass-card min-w-[220px] rounded-xl p-1.5">
                        {link.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="block rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-0.5">
            {/* Search */}
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden h-9 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 text-xs text-muted-foreground transition-all hover:border-white/20 hover:text-foreground sm:flex"
              aria-label="Search"
            >
              <Search className="h-3.5 w-3.5" />
              <span>Search</span>
              <kbd className="rounded border border-white/10 px-1.5 py-0.5 font-sans text-[9px]">⌘K</kbd>
            </button>

            {/* Mobile search icon */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchOpen(true)}
              className="text-muted-foreground hover:text-foreground sm:hidden"
              aria-label="Search"
            >
              <Search className="h-4.5 w-4.5" />
            </Button>

            {/* Theme toggle */}
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            )}

            {/* Cart */}
            <Button
              variant="ghost"
              size="icon"
              onClick={openCart}
              className="relative text-muted-foreground hover:text-foreground"
              aria-label="Shopping cart"
            >
              <ShoppingCart className="h-4.5 w-4.5" />
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span
                    key="cart-badge"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-violet-500 px-1 text-[10px] font-bold text-white"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>

            {/* Notifications */}
            <div className="relative hidden sm:block" ref={notifRef}>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleNotif}
                className="relative text-muted-foreground hover:text-foreground"
                aria-label="Notifications"
              >
                <Bell className="h-4.5 w-4.5" />
                {unread > 0 && (
                  <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-pink-500" />
                )}
              </Button>
              <NotificationsDropdown />
            </div>

            {/* Account dropdown */}
            <div className="relative hidden sm:block" ref={accountRef}>
              <button
                onClick={() => setAccountOpen((o) => !o)}
                className="ml-1 flex h-8 w-8 items-center justify-center rounded-full gradient-brand text-sm font-bold text-white shadow-md transition-all hover:shadow-lg hover:opacity-90"
                aria-label="Account menu"
              >
                E
              </button>

              <AnimatePresence>
                {accountOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setAccountOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="glass-card absolute right-0 top-full z-50 mt-2 min-w-[220px] overflow-hidden rounded-2xl shadow-card"
                    >
                      {/* User info */}
                      <div className="border-b border-white/5 px-4 py-3">
                        <p className="text-sm font-semibold text-foreground">Emma Wilson</p>
                        <p className="text-xs text-muted-foreground">buyer1@aureon.io</p>
                        <Badge className="mt-1.5 bg-violet-500/20 text-violet-300 text-[10px] border-violet-500/30">
                          Customer · Verified
                        </Badge>
                      </div>

                      {/* Links */}
                      <div className="p-1.5">
                        {accountMenuItems.map(({ label, href, icon: Icon }) => (
                          <Link
                            key={href}
                            href={href}
                            onClick={() => setAccountOpen(false)}
                            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
                          >
                            <Icon className="h-3.5 w-3.5" />
                            {label}
                          </Link>
                        ))}
                      </div>

                      {/* Sign out */}
                      <div className="border-t border-white/5 p-1.5">
                        <button
                          onClick={() => setAccountOpen(false)}
                          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-400"
                        >
                          <LogOut className="h-3.5 w-3.5" />
                          Sign out
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Auth buttons (logged-out state — hidden when account shown) */}
            <div className="ml-1 hidden items-center gap-2 lg:flex xl:hidden">
              {/* intentionally hidden on xl — account avatar shown instead */}
            </div>

            {/* Mobile menu toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="ml-1 lg:hidden"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-t border-white/5 bg-midnight/95 backdrop-blur-xl lg:hidden"
            >
              <nav className="flex flex-col gap-1 px-4 py-4" aria-label="Mobile navigation">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}

                <div className="mt-2 border-t border-white/5 pt-4 space-y-1">
                  {accountMenuItems.slice(0, 5).map(({ label, href, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-white/5 hover:text-foreground"
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {label}
                    </Link>
                  ))}
                </div>

                <div className="mt-2 flex flex-col gap-2 border-t border-white/5 pt-4">
                  <Button variant="outline" asChild>
                    <Link href="/sign-in" onClick={() => setMobileOpen(false)}>Sign in</Link>
                  </Button>
                  <Button className="gradient-brand border-0 text-white" asChild>
                    <Link href="/sign-up" onClick={() => setMobileOpen(false)}>Get started</Link>
                  </Button>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Global overlays */}
      <CartSidebar />
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
