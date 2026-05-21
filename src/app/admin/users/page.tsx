"use client"

import { useState } from "react"
import { CheckCircle, Search, Shield, ShieldOff, Users, Store, Crown, Headphones } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { GradientText } from "@/components/brand/gradient-text"
import { toast } from "sonner"

type Role = "customer" | "seller" | "admin" | "support"
type TabKey = "all" | Role

const MOCK_USERS = [
  { id: "u01", name: "Emma Wilson",      email: "buyer1@aureon.io",        role: "customer" as Role, joined: "2024-09-14", orders: 3,  verified: true  },
  { id: "u02", name: "Luca Ferretti",    email: "buyer2@aureon.io",        role: "customer" as Role, joined: "2024-10-02", orders: 1,  verified: true  },
  { id: "u03", name: "Priya Sharma",     email: "buyer3@aureon.io",        role: "customer" as Role, joined: "2024-10-18", orders: 2,  verified: true  },
  { id: "u04", name: "Marcus Breitling", email: "watchvault@aureon.io",    role: "seller"   as Role, joined: "2024-07-01", orders: 47, verified: true  },
  { id: "u05", name: "Sophie Aubert",    email: "prestige@aureon.io",      role: "seller"   as Role, joined: "2024-07-15", orders: 38, verified: true  },
  { id: "u06", name: "Darius Chen",      email: "arthouse@aureon.io",      role: "seller"   as Role, joined: "2024-08-03", orders: 22, verified: true  },
  { id: "u07", name: "Ren Nakamura",     email: "archiveluxury@aureon.io", role: "seller"   as Role, joined: "2024-09-01", orders: 11, verified: false },
  { id: "u08", name: "Aureon Admin",     email: "admin@aureon.io",         role: "admin"    as Role, joined: "2024-06-01", orders: 0,  verified: true  },
  { id: "u09", name: "Aureon Support",   email: "support@aureon.io",       role: "support"  as Role, joined: "2024-06-01", orders: 0,  verified: true  },
]

const roleStyle: Record<Role, string> = {
  customer: "bg-violet-500/10 text-violet-300 border-violet-500/20",
  seller:   "bg-pink-500/10 text-pink-300 border-pink-500/20",
  admin:    "bg-amber-500/10 text-amber-300 border-amber-500/20",
  support:  "bg-sky-500/10 text-sky-300 border-sky-500/20",
}

const TABS: { value: TabKey; label: string; icon: React.ElementType }[] = [
  { value: "all",      label: "All",      icon: Users     },
  { value: "customer", label: "Customers", icon: Users    },
  { value: "seller",   label: "Sellers",  icon: Store     },
  { value: "admin",    label: "Admins",   icon: Crown     },
  { value: "support",  label: "Support",  icon: Headphones },
]

export default function AdminUsersPage() {
  const [query,     setQuery]     = useState("")
  const [tab,       setTab]       = useState<TabKey>("all")
  const [suspended, setSuspended] = useState<Set<string>>(new Set())

  const filtered = MOCK_USERS.filter((u) => {
    const matchesTab   = tab === "all" || u.role === tab
    const matchesQuery =
      query === "" ||
      u.name.toLowerCase().includes(query.toLowerCase()) ||
      u.email.toLowerCase().includes(query.toLowerCase())
    return matchesTab && matchesQuery
  })

  const counts: Record<TabKey, number> = {
    all:      MOCK_USERS.length,
    customer: MOCK_USERS.filter((u) => u.role === "customer").length,
    seller:   MOCK_USERS.filter((u) => u.role === "seller").length,
    admin:    MOCK_USERS.filter((u) => u.role === "admin").length,
    support:  MOCK_USERS.filter((u) => u.role === "support").length,
  }

  function toggleSuspend(id: string, name: string) {
    setSuspended((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
        toast.success(`${name} reinstated`)
      } else {
        next.add(id)
        toast.error(`${name} suspended`)
      }
      return next
    })
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-400">Admin</p>
          <h1 className="mt-1 font-display text-3xl font-bold">
            User <GradientText>Management</GradientText>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {MOCK_USERS.length} total users
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total users",  value: counts.all,         color: "text-violet-400" },
          { label: "Customers",    value: counts.customer,    color: "text-violet-400" },
          { label: "Sellers",      value: counts.seller,      color: "text-pink-400"   },
          { label: "Suspended",    value: suspended.size,     color: "text-red-400"    },
        ].map(({ label, value, color }) => (
          <div key={label} className="glass-card rounded-xl p-4">
            <p className="text-[11px] text-muted-foreground uppercase tracking-wider">{label}</p>
            <p className={`mt-1 text-xl font-bold ${value > 0 && label === "Suspended" ? color : "text-foreground"}`}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Role tabs */}
      <div className="mb-4 flex items-center gap-1 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
              tab === t.value
                ? "bg-amber-500/15 text-amber-300"
                : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
            }`}
          >
            {t.label}
            <span
              className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                tab === t.value
                  ? "bg-amber-500/20 text-amber-300"
                  : "bg-white/5 text-muted-foreground"
              }`}
            >
              {counts[t.value]}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or email…"
          className="border-white/10 bg-white/5 pl-9 focus-visible:ring-amber-500/50"
        />
      </div>

      <div className="glass-card overflow-hidden rounded-2xl">
        <div className="hidden grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 border-b border-white/5 px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground sm:grid">
          <span>User</span>
          <span>Role</span>
          <span>Joined</span>
          <span>Orders</span>
          <span>Actions</span>
        </div>

        <div className="divide-y divide-white/5">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-sm text-muted-foreground">
              No users found
            </div>
          ) : (
            filtered.map((user) => {
              const isSuspended = suspended.has(user.id)
              return (
                <div
                  key={user.id}
                  className={`grid grid-cols-[1fr_auto] items-center gap-4 px-5 py-4 transition-colors hover:bg-white/2 sm:grid-cols-[2fr_1fr_1fr_1fr_auto] ${
                    isSuspended ? "opacity-50" : ""
                  }`}
                >
                  {/* User */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl gradient-brand text-sm font-bold text-white ${
                        isSuspended ? "grayscale" : ""
                      }`}
                    >
                      {user.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
                        {user.verified && !isSuspended && (
                          <CheckCircle className="h-3 w-3 shrink-0 text-emerald-400" />
                        )}
                        {isSuspended && (
                          <Badge
                            variant="outline"
                            className="text-[10px] border-red-500/20 text-red-400"
                          >
                            Suspended
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>

                  <Badge
                    variant="outline"
                    className={`hidden w-fit text-xs capitalize sm:inline-flex ${roleStyle[user.role]}`}
                  >
                    {user.role}
                  </Badge>
                  <p className="hidden text-xs text-muted-foreground sm:block">{user.joined}</p>
                  <p className="hidden text-sm font-medium text-foreground sm:block">
                    {user.orders > 0 ? user.orders : "—"}
                  </p>

                  <button
                    onClick={() => toggleSuspend(user.id, user.name)}
                    className={`flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors ${
                      isSuspended
                        ? "text-emerald-400 hover:bg-emerald-500/10"
                        : "text-muted-foreground hover:bg-red-500/10 hover:text-red-400"
                    }`}
                  >
                    {isSuspended ? (
                      <><Shield className="h-3.5 w-3.5" /> Reinstate</>
                    ) : (
                      <><ShieldOff className="h-3.5 w-3.5" /> Suspend</>
                    )}
                  </button>
                </div>
              )
            })
          )}
        </div>

        <div className="border-t border-white/5 px-5 py-3">
          <p className="text-xs text-muted-foreground">
            Showing {filtered.length} of {MOCK_USERS.length} users
          </p>
        </div>
      </div>
    </div>
  )
}
