"use client"

import { useState } from "react"
import { Mail, MessageSquare, Clock, CheckCircle, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { GradientText } from "@/components/brand/gradient-text"
import { toast } from "sonner"

const SUBJECTS = [
  "General Inquiry",
  "Authentication Question",
  "Seller Application",
  "Dispute / Claim",
  "Technical Issue",
  "Press & Media",
  "Other",
]

const CHANNELS = [
  {
    icon: Mail,
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    title: "Email Support",
    value: "support@aureon.io",
    note: "Typical response within 4 hours",
  },
  {
    icon: MessageSquare,
    color: "text-pink-400",
    bg: "bg-pink-500/10",
    title: "Live Chat",
    value: "Available Mon – Fri, 9am – 6pm CET",
    note: "Average wait: under 2 minutes",
  },
  {
    icon: Clock,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    title: "Business Hours",
    value: "Mon – Fri · 9:00 – 18:00 CET",
    note: "Urgent disputes handled 24/7",
  },
]

export default function ContactPage() {
  const [sent,    setSent]    = useState(false)
  const [loading, setLoading] = useState(false)
  const [form,    setForm]    = useState({
    name: "", email: "", subject: SUBJECTS[0], message: "",
  })

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill in all required fields")
      return
    }
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1200))
    setLoading(false)
    setSent(true)
  }

  return (
    <div className="bg-midnight">
      {/* Hero */}
      <div className="border-b border-white/5 bg-midnight-50/30 py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-violet-400">
            Get in Touch
          </p>
          <h1 className="font-display text-4xl font-bold text-foreground sm:text-5xl">
            <GradientText>Contact</GradientText> Us
          </h1>
          <p className="mt-4 max-w-xl text-muted-foreground">
            Questions about an item, a seller dispute, or authentication process? We're here to help.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1fr_360px]">
          {/* Form */}
          <div>
            {sent ? (
              <div className="glass-card rounded-2xl p-10 text-center">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20">
                  <CheckCircle className="h-8 w-8 text-emerald-400" />
                </div>
                <h2 className="font-display text-2xl font-bold text-foreground">Message sent!</h2>
                <p className="mt-3 text-muted-foreground">
                  We've received your message and will reply to{" "}
                  <span className="font-medium text-foreground">{form.email}</span> within 4 hours.
                </p>
                <Button
                  className="gradient-brand mt-6 border-0 text-white hover:opacity-90"
                  onClick={() => { setSent(false); setForm({ name: "", email: "", subject: SUBJECTS[0], message: "" }) }}
                >
                  Send another message <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-8 space-y-5">
                <h2 className="font-display text-xl font-bold text-foreground">Send a message</h2>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="name">Full name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Emma Wilson"
                      className="border-white/10 bg-white/5 focus-visible:ring-violet-500/50"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email address *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="emma@example.com"
                      className="border-white/10 bg-white/5 focus-visible:ring-violet-500/50"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="subject">Subject</Label>
                  <select
                    id="subject"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  >
                    {SUBJECTS.map((s) => (
                      <option key={s} value={s} className="bg-midnight-100">
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Tell us how we can help…"
                    rows={5}
                    className="border-white/10 bg-white/5 focus-visible:ring-violet-500/50 resize-none"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="gradient-brand w-full border-0 text-white hover:opacity-90 disabled:opacity-50"
                >
                  {loading ? "Sending…" : "Send message"}
                </Button>
              </form>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {CHANNELS.map(({ icon: Icon, color, bg, title, value, note }) => (
              <div key={title} className="glass-card rounded-2xl p-5">
                <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl ${bg}`}>
                  <Icon className={`h-4 w-4 ${color}`} />
                </div>
                <p className="font-semibold text-foreground">{title}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{value}</p>
                <p className="mt-1.5 text-xs text-muted-foreground/70">{note}</p>
              </div>
            ))}

            {/* FAQ teaser */}
            <div className="glass-card rounded-2xl p-5">
              <p className="font-semibold text-foreground">Quick answers</p>
              <div className="mt-3 space-y-3">
                {[
                  { q: "How long does authentication take?",  a: "2–5 business days for physical items." },
                  { q: "What if my item is fake?",            a: "Full refund, no questions asked."       },
                  { q: "Can I sell on Aureon?",               a: "Apply at /seller/apply. Reviewed in 48h." },
                ].map(({ q, a }) => (
                  <div key={q} className="border-t border-white/5 pt-3">
                    <p className="text-xs font-medium text-foreground">{q}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
