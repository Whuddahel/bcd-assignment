import type { Metadata } from "next"
import Link from "next/link"
import { MessageSquare, ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { GradientText } from "@/components/brand/gradient-text"
import { requireUser } from "@/lib/auth/session"
import { getTicketsForUser } from "@/lib/data/tickets"
import { relativeTime } from "@/lib/utils"

export const metadata: Metadata = { title: "Support Tickets" }

const statusStyle: Record<string, string> = {
  open:        "bg-red-500/10 text-red-400 border-red-500/20",
  in_progress: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  resolved:    "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  closed:      "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
}

export default async function MyTicketsPage() {
  const user = await requireUser()
  const tickets = await getTicketsForUser(user.id)

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-violet-400">Account</p>
          <h1 className="mt-1 font-display text-3xl font-bold">
            Support <GradientText>Tickets</GradientText>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Questions you&apos;ve sent our team, and their replies.
          </p>
        </div>
        <Button variant="outline" className="border-white/10 hover:bg-white/5" asChild>
          <Link href="/contact">New message</Link>
        </Button>
      </div>

      {tickets.length === 0 ? (
        <div className="glass-card rounded-2xl py-20 text-center">
          <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-4 font-semibold text-foreground">No support tickets yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Reach out and we&apos;ll get back to you within a few hours.
          </p>
          <Button className="gradient-brand mt-6 border-0 text-white" asChild>
            <Link href="/contact">Contact support</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((t) => (
            <Link
              key={t.id}
              href={`/account/support/${t.id}`}
              className="glass-card flex items-center gap-4 rounded-2xl p-5 transition-all hover:border-white/10"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5">
                <MessageSquare className="h-4 w-4 text-violet-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{t.subject}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  #{t.shortId} · Updated {relativeTime(t.updatedAt)}
                </p>
              </div>
              <Badge variant="outline" className={`shrink-0 capitalize ${statusStyle[t.status] ?? ""}`}>
                {t.status.replace("_", " ")}
              </Badge>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
