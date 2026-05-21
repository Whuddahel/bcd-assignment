"use client"

import { use, useState } from "react"
import { notFound } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Send, Lock } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { GradientText } from "@/components/brand/gradient-text"
import { MOCK_TICKETS } from "@/lib/mock"
import { relativeTime } from "@/lib/utils"
import { toast } from "sonner"

const statusStyle: Record<string, string> = {
  open:        "bg-red-500/10 text-red-400 border-red-500/20",
  in_progress: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  resolved:    "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  closed:      "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
}

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number]

export default function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const ticket = MOCK_TICKETS.find(t => t.id === id)
  if (!ticket) notFound()

  const [messages, setMessages] = useState(ticket.messages)
  const [reply,    setReply]    = useState("")
  const [internal, setInternal] = useState(false)
  const [sending,  setSending]  = useState(false)

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!reply.trim()) return
    setSending(true)
    await new Promise(r => setTimeout(r, 600))
    setMessages(m => [...m, {
      sender: "Support Agent",
      body: reply.trim(),
      isInternal: internal,
      date: new Date().toISOString(),
    }])
    setReply("")
    setSending(false)
    toast.success(internal ? "Internal note added" : "Reply sent")
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
            <p className="text-xs font-semibold uppercase tracking-widest text-sky-400">Ticket #{ticket.id}</p>
            <h1 className="mt-1 font-display text-2xl font-bold">
              <GradientText>{ticket.subject}</GradientText>
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              From <strong className="text-foreground">{ticket.user}</strong>
              {ticket.orderId && <> · Order #{ticket.orderId}</>}
              {" "} · {ticket.date}
            </p>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className={`capitalize ${statusStyle[ticket.status]}`}>
              {ticket.status.replace("_", " ")}
            </Badge>
            <Badge variant="outline" className="border-white/10 text-muted-foreground capitalize">
              {ticket.priority} priority
            </Badge>
          </div>
        </div>
      </div>

      {/* Message thread */}
      <div className="space-y-4 mb-8">
        {messages.map((msg, i) => {
          const isAgent = msg.sender !== ticket.user
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05, ease: EASE }}
              className={`flex gap-3 ${isAgent ? "flex-row-reverse" : ""}`}
            >
              {/* Avatar */}
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white ${isAgent ? "gradient-brand" : "bg-white/10"}`}>
                {msg.sender.charAt(0)}
              </div>

              {/* Bubble */}
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
        })}
      </div>

      {/* Reply box */}
      <div className="glass-card rounded-2xl p-5">
        <h3 className="mb-4 text-sm font-semibold text-foreground">Reply</h3>
        <form onSubmit={handleSend} className="space-y-3">
          <Textarea
            placeholder="Type your reply…"
            value={reply}
            onChange={e => setReply(e.target.value)}
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
