"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Send } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { GradientText } from "@/components/brand/gradient-text"
import type { TicketVM } from "@/lib/data/types"
import { replyToTicket } from "@/lib/actions/tickets"
import { relativeTime, formatDate } from "@/lib/utils"
import { toast } from "sonner"

const statusStyle: Record<string, string> = {
  open:        "bg-red-500/10 text-red-400 border-red-500/20",
  in_progress: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  resolved:    "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  closed:      "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
}

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number]

export function MyTicketDetail({ ticket }: { ticket: TicketVM }) {
  const router = useRouter()
  const [reply, setReply] = useState("")
  const [sending, setSending] = useState(false)

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!reply.trim()) return
    setSending(true)
    const res = await replyToTicket({ ticketId: ticket.id, body: reply.trim() })
    setSending(false)
    if (!res.ok) {
      toast.error(res.error)
      return
    }
    setReply("")
    toast.success("Reply sent")
    router.refresh()
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link href="/account/support" className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to tickets
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-violet-400">Ticket #{ticket.shortId}</p>
            <h1 className="mt-1 font-display text-2xl font-bold">
              <GradientText>{ticket.subject}</GradientText>
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Opened {formatDate(ticket.date)}
            </p>
          </div>
          <Badge variant="outline" className={`capitalize ${statusStyle[ticket.status] ?? ""}`}>
            {ticket.status.replace("_", " ")}
          </Badge>
        </div>
      </div>

      {/* Message thread */}
      <div className="space-y-4 mb-8">
        {ticket.messages.length === 0 ? (
          <p className="glass-card rounded-2xl py-10 text-center text-sm text-muted-foreground">
            No messages yet.
          </p>
        ) : (
          ticket.messages.map((msg, i) => {
            const isMe = msg.senderId === ticket.userId
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05, ease: EASE }}
                className={`flex gap-3 ${isMe ? "flex-row-reverse" : ""}`}
              >
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-xl text-xs font-bold text-white ${isMe ? "bg-white/10" : "gradient-brand"}`}>
                  {msg.senderAvatar ? (
                    <img src={msg.senderAvatar} alt={isMe ? "You" : msg.sender} className="h-full w-full object-cover" />
                  ) : (
                    msg.sender.charAt(0)
                  )}
                </div>

                <div className={`max-w-[75%] ${isMe ? "items-end" : ""} flex flex-col gap-1`}>
                  <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    isMe ? "glass-card text-foreground" : "bg-violet-500/15 text-foreground"
                  }`}>
                    {msg.body}
                  </div>
                  <p className="text-[10px] text-muted-foreground px-1">
                    {isMe ? "You" : msg.sender} · {relativeTime(msg.date)}
                  </p>
                </div>
              </motion.div>
            )
          })
        )}
      </div>

      {/* Reply box */}
      {ticket.status !== "closed" && (
        <div className="glass-card rounded-2xl p-5">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Reply</h3>
          <form onSubmit={handleSend} className="space-y-3">
            <Textarea
              placeholder="Type your reply…"
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              rows={4}
              className="resize-none border-white/10 bg-white/5 focus-visible:ring-violet-500/50"
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={sending || !reply.trim()}
                className="gradient-brand gap-2 border-0 text-white hover:opacity-90"
              >
                <Send className="h-4 w-4" />
                {sending ? "Sending…" : "Send reply"}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
