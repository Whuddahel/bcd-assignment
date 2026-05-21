import Link from "next/link"
import { MessageSquare, Clock, CheckCircle2, ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { GradientText } from "@/components/brand/gradient-text"
import { MOCK_TICKETS } from "@/lib/mock"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Support Inbox" }

const statusStyle: Record<string, string> = {
  open:        "bg-red-500/10 text-red-400 border-red-500/20",
  in_progress: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  resolved:    "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  closed:      "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
}

const priorityStyle: Record<string, string> = {
  low:    "text-zinc-400",
  medium: "text-amber-400",
  high:   "text-orange-400",
  urgent: "text-red-400",
}

export default function SupportInboxPage() {
  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-sky-400">Support Hub</p>
        <h1 className="mt-1 font-display text-3xl font-bold">Ticket <GradientText>Inbox</GradientText></h1>
        <p className="mt-1 text-sm text-muted-foreground">{MOCK_TICKETS.length} active tickets</p>
      </div>

      {/* Summary */}
      <div className="mb-8 grid grid-cols-3 gap-4">
        {[
          { label: "Open",        value: MOCK_TICKETS.filter(t => t.status === "open").length,        icon: Clock,         color: "text-red-400"     },
          { label: "In Progress", value: MOCK_TICKETS.filter(t => t.status === "in_progress").length, icon: MessageSquare, color: "text-amber-400"   },
          { label: "Resolved",    value: MOCK_TICKETS.filter(t => (t.status as string) === "resolved").length,    icon: CheckCircle2,  color: "text-emerald-400" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="glass-card rounded-2xl p-5 text-center">
            <Icon className={`mx-auto h-5 w-5 ${color}`} />
            <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      {/* Ticket list */}
      <div className="space-y-3">
        {MOCK_TICKETS.map(ticket => (
          <Link key={ticket.id} href={`/support/tickets/${ticket.id}`} className="group block">
            <div className="glass-card rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/10 hover:shadow-[0_12px_40px_oklch(0_0_0/0.4)]">
              <div className="flex flex-wrap items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/10">
                  <MessageSquare className="h-4 w-4 text-sky-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-foreground">{ticket.subject}</p>
                    <Badge variant="outline" className={`text-[10px] capitalize ${statusStyle[ticket.status]}`}>
                      {ticket.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    From <strong className="text-foreground">{ticket.user}</strong>
                    {ticket.orderId && <> · Order #{ticket.orderId}</>}
                    {" "} · {ticket.date}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-1">
                    {ticket.messages[ticket.messages.length - 1]?.body}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <span className={`text-xs font-medium capitalize ${priorityStyle[ticket.priority]}`}>
                    {ticket.priority}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    {ticket.messages.length} messages
                    <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}

        {MOCK_TICKETS.length === 0 && (
          <div className="glass-card rounded-2xl py-20 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400" />
            <p className="mt-4 font-semibold text-foreground">All clear!</p>
            <p className="mt-2 text-sm text-muted-foreground">No open support tickets right now.</p>
          </div>
        )}
      </div>
    </div>
  )
}
