"use client"

import { useState } from "react"
import Link from "next/link"
import { CheckCircle, Search, Star, Package, Store, ShieldCheck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { GradientText } from "@/components/brand/gradient-text"
import type { SellerVM } from "@/lib/data/types"
import { formatPrice } from "@/lib/utils"
import { toast } from "sonner"

export function AdminSellersClient({ sellers }: { sellers: SellerVM[] }) {
  const [query, setQuery] = useState("")
  const [items, setItems] = useState<SellerVM[]>(sellers)
  const [busy, setBusy] = useState<string | null>(null)

  const filtered = items.filter(
    (s) =>
      query === "" ||
      s.businessName.toLowerCase().includes(query.toLowerCase()) ||
      (s.specialty ?? "").toLowerCase().includes(query.toLowerCase()),
  )

  const verifiedCount = items.filter((s) => s.verified).length
  const pendingCount = items.length - verifiedCount

  async function verify(seller: SellerVM) {
    setBusy(seller.id)
    try {
      const res = await fetch(`/api/admin/sellers/${seller.id}/verify`, { method: "POST" })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error ?? "Verification failed")
      setItems((cur) => cur.map((s) => (s.id === seller.id ? { ...s, verified: true } : s)))
      toast.success(`${seller.businessName} verified`, {
        description: "An approval email has been sent to the seller.",
      })
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Verification failed")
    } finally {
      setBusy(null)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-amber-400">Admin</p>
        <h1 className="mt-1 font-display text-3xl font-bold">
          Seller <GradientText>Verification</GradientText>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{items.length} sellers on the platform</p>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        {[
          { label: "Total sellers", value: items.length, icon: Store, color: "text-violet-400" },
          { label: "Verified", value: verifiedCount, icon: ShieldCheck, color: "text-emerald-400" },
          { label: "Pending", value: pendingCount, icon: Package, color: "text-amber-400" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="glass-card rounded-xl p-4">
            <Icon className={`h-4 w-4 ${color}`} />
            <p className="mt-2 text-xl font-bold text-foreground">{value}</p>
            <p className="text-[11px] text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by business name or specialty…"
          className="border-white/10 bg-white/5 pl-9 focus-visible:ring-amber-500/50"
        />
      </div>

      <div className="glass-card overflow-hidden rounded-2xl">
        <div className="divide-y divide-white/5">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-sm text-muted-foreground">No sellers found</div>
          ) : (
            filtered.map((s) => (
              <div key={s.id} className="flex flex-wrap items-center gap-4 px-5 py-4 transition-colors hover:bg-white/2">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl gradient-brand text-sm font-bold text-white">
                  {s.businessName.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <Link href={`/sellers/${s.id}`} className="truncate text-sm font-medium text-foreground hover:text-violet-300">
                    {s.businessName}
                  </Link>
                  <p className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                    {s.specialty && <span>{s.specialty}</span>}
                    <span className="flex items-center gap-0.5">
                      <Star className="h-3 w-3 text-amber-400" /> {s.rating.toFixed(2)}
                    </span>
                    <span>· {s.totalSales} sales</span>
                    <span>· {formatPrice(s.totalRevenue)} revenue</span>
                  </p>
                </div>

                {s.verified ? (
                  <Badge className="gap-1 bg-emerald-500/15 text-emerald-400 border-emerald-500/20">
                    <CheckCircle className="h-3 w-3" /> Verified
                  </Badge>
                ) : (
                  <Button
                    size="sm"
                    disabled={busy === s.id}
                    onClick={() => verify(s)}
                    className="gap-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    {busy === s.id ? "Verifying…" : "Verify"}
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
