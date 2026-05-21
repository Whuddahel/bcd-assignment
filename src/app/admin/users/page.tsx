import { CheckCircle, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { GradientText } from "@/components/brand/gradient-text"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Users — Admin" }

const MOCK_USERS = [
  { id: "u01", name: "Emma Wilson",    email: "buyer1@aureon.io", role: "customer", joined: "2024-09-14", orders: 3, verified: true  },
  { id: "u02", name: "Luca Ferretti",  email: "buyer2@aureon.io", role: "customer", joined: "2024-10-02", orders: 1, verified: true  },
  { id: "u03", name: "Priya Sharma",   email: "buyer3@aureon.io", role: "customer", joined: "2024-10-18", orders: 2, verified: true  },
  { id: "u04", name: "Marcus Breitling", email: "watchvault@aureon.io", role: "seller", joined: "2024-07-01", orders: 47, verified: true  },
  { id: "u05", name: "Sophie Aubert",  email: "prestige@aureon.io", role: "seller",  joined: "2024-07-15", orders: 38, verified: true  },
  { id: "u06", name: "Darius Chen",    email: "arthouse@aureon.io", role: "seller",  joined: "2024-08-03", orders: 22, verified: true  },
  { id: "u07", name: "Ren Nakamura",   email: "archiveluxury@aureon.io", role: "seller", joined: "2024-09-01", orders: 11, verified: false },
  { id: "u08", name: "Aureon Admin",   email: "admin@aureon.io",  role: "admin",   joined: "2024-06-01", orders: 0, verified: true  },
  { id: "u09", name: "Aureon Support", email: "support@aureon.io",role: "support", joined: "2024-06-01", orders: 0, verified: true  },
]

const roleStyle: Record<string, string> = {
  customer: "bg-violet-500/10 text-violet-300 border-violet-500/20",
  seller:   "bg-pink-500/10 text-pink-300 border-pink-500/20",
  admin:    "bg-amber-500/10 text-amber-300 border-amber-500/20",
  support:  "bg-sky-500/10 text-sky-300 border-sky-500/20",
}

export default function AdminUsersPage() {
  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-amber-400">Admin</p>
        <h1 className="mt-1 font-display text-3xl font-bold">User <GradientText>Management</GradientText></h1>
        <p className="mt-1 text-sm text-muted-foreground">{MOCK_USERS.length} users shown</p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search by name or email…" className="border-white/10 bg-white/5 pl-9 focus-visible:ring-amber-500/50" />
      </div>

      <div className="glass-card overflow-hidden rounded-2xl">
        <div className="grid grid-cols-[2fr_1fr_1fr_auto] gap-4 border-b border-white/5 px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          <span>User</span>
          <span>Role</span>
          <span>Joined</span>
          <span>Actions</span>
        </div>
        <div className="divide-y divide-white/5">
          {MOCK_USERS.map(user => (
            <div key={user.id} className="grid grid-cols-[2fr_1fr_1fr_auto] items-center gap-4 px-5 py-4 hover:bg-white/2 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl gradient-brand text-sm font-bold text-white">
                  {user.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
                    {user.verified && <CheckCircle className="h-3 w-3 shrink-0 text-emerald-400" />}
                  </div>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <Badge variant="outline" className={`w-fit text-xs capitalize ${roleStyle[user.role]}`}>{user.role}</Badge>
              <p className="text-xs text-muted-foreground">{user.joined}</p>
              <button className="text-xs text-muted-foreground hover:text-red-400 transition-colors">Suspend</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
