"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Send, Lock, MessageSquarePlus } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { GradientText } from "@/components/brand/gradient-text"
import type { TicketVM } from "@/lib/data/types"
import type { TicketStatus } from "@/types/database"
import { replyToTicket, updateTicketStatus } from "@/lib/actions/tickets"
import { relativeTime, formatDate } from "@/lib/utils"
import { toast } from "sonner"

const statusStyle: Record<string, string> = {
  open:        "bg-red-500/10 text-red-400 border-red-500/20",
  in_progress: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  resolved:    "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  closed:      "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
}

const CANNED: { label: string; body: string }[] = [
  { label: "Acknowledge", body: "Thanks for reaching out — I'm looking into this now and will update you shortly." },
  { label: "Shipping delay", body: "I've checked with the carrier: your package is in transit and should arrive within 2 business days. Apologies for the delay." },
  { label: "Authentication", body: "Every item on Aureon is independently authenticated before shipping. I've attached the authentication report to your order." },
  { label: "Resolved", body: "Glad we could help! I'm marking this ticket as resolved — reply any time if anything else comes up." },
]

const STATUSES: TicketStatus[] = ["open", "in_progress", "resolved", "closed"]

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number]

export function TicketDetail({ ticket }: { ticket: TicketVM }) {
  const router = useRouter()
  const [reply, setReply] = useState("")
  const [internal, setInternal] = useState(false)
  const [sending, setSending] = useState(false)
  const [status, setStatus] = useState<TicketStatus>(ticket.status)
  const visibleMessages = ticket.messages

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!reply.trim()) return
    setSending(true)
    const res = await replyToTicket({ ticketId: ticket.id, body: reply.trim(), isInternal: internal })
    setSending(false)
    if (!res.ok) {
      toast.error(res.error)
      return
    }
    setReply("")
    toast.success(internal ? "Internal note added" : "Reply sent")
    router.refresh()
  }

  async function handleStatus(next: TicketStatus) {
    const prev = status
    setStatus(next) // optimistic
    const res = await updateTicketStatus(ticket.id, next)
    if (!res.ok) {
      setStatus(prev)
      toast.error(res.error)
      return
    }
    toast.success(`Ticket marked ${next.replace("_", " ")}`)
    router.refresh()
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link href="/support" className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to inbox
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-sky-400">Ticket #{ticket.shortId}</p>
            <h1 className="mt-1 font-display text-2xl font-bold">
              <GradientText>{ticket.subject}</GradientText>
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              From <strong className="text-foreground">{ticket.user}</strong>
              {ticket.orderId && <> · Order #{ticket.orderId.slice(0, 8).toUpperCase()}</>}
              {" "} · {formatDate(ticket.date)}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className={`capitalize ${statusStyle[status]}`}>
              {status.replace("_", " ")}
            </Badge>
            <Badge variant="outline" className="border-white/10 text-muted-foreground capitalize">
              {ticket.priority} priority
            </Badge>
            {/* Status controls */}
            <div className="relative">
              <select
                value={status}
                onChange={(e) => void handleStatus(e.target.value as TicketStatus)}
                aria-label="Change ticket status"
                className="h-8 appearance-none rounded-lg border border-white/10 bg-white/5 pl-3 pr-7 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-sky-500/50"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s} className="capitalize">
                    {s.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Message thread */}
      <div className="space-y-4 mb-8">
        {visibleMessages.length === 0 ? (
          <p className="glass-card rounded-2xl py-10 text-center text-sm text-muted-foreground">
            No messages yet.
          </p>
        ) : (
          visibleMessages.map((msg, i) => {
            const isAgent = msg.senderId !== ticket.userId
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05, ease: EASE }}
                className={`flex gap-3 ${isAgent ? "flex-row-reverse" : ""}`}
              >
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white ${isAgent ? "gradient-brand" : "bg-white/10"}`}>
                  {msg.sender.charAt(0)}
                </div>

                <div className={`max-w-[75%] ${isAgent ? "items-end" : ""} flex flex-col gap-1`}>
                  {msg.isInternal && (
                    <div className="flex items-center gap-1 text-[10px] text-amber-400">
                      <Lock className="h-2.5 w-2.5" /> Internal note
                    </div>
                  )}
                  <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.isInternal
                      ? "border border-amber-500/20 bg-amber-500/5 text-amber-200"
                      : isAgent
                      ? "bg-violet-500/15 text-foreground"
                      : "glass-card text-foreground"
                  }`}>
                    {msg.body}
                  </div>
                  <p className="text-[10px] text-muted-foreground px-1">
                    {msg.sender} · {relativeTime(msg.date)}
                  </p>
                </div>
              </motion.div>
            )
          })
        )}
      </div>

      {/* Reply box */}
      <div className="glass-card rounded-2xl p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Reply</h3>
        </div>

        {/* Canned responses */}
        <div className="mb-3 flex flex-wrap gap-2">
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <MessageSquarePlus className="h-3.5 w-3.5" /> Canned:
          </span>
          {CANNED.map((c) => (
            <button
              key={c.label}
              type="button"
              onClick={() => setReply(c.body)}
              className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:border-sky-500/30 hover:bg-sky-500/10 hover:text-sky-300"
            >
              {c.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSend} className="space-y-3">
          <Textarea
            placeholder="Type your reply…"
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            rows={4}
            className="resize-none border-white/10 bg-white/5 focus-visible:ring-sky-500/50"
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch id="internal" checked={internal} onCheckedChange={setInternal} />
              <Label htmlFor="internal" className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
                <Lock className="h-3 w-3" />
                Internal note (hidden from customer)
              </Label>
            </div>
            <Button
              type="submit"
              disabled={sending || !reply.trim()}
              className="gap-2 bg-sky-500/20 text-sky-300 border border-sky-500/30 hover:bg-sky-500/30"
            >
              <Send className="h-4 w-4" />
              {sending ? "Sending…" : internal ? "Add note" : "Send reply"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
