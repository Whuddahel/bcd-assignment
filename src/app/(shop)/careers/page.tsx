"use client"

import { useState } from "react"
import { MapPin, Clock, ArrowRight, Briefcase, Heart, Zap, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GradientText } from "@/components/brand/gradient-text"
import { toast } from "sonner"
import type { Metadata } from "next"

const PERKS = [
  { icon: Globe,    color: "text-violet-400", bg: "bg-violet-500/10", title: "Remote-first",     desc: "Work from anywhere. Serious team, flexible hours."                   },
  { icon: Zap,      color: "text-amber-400",  bg: "bg-amber-500/10",  title: "Equity for all",   desc: "Everyone gets options. We grow together."                            },
  { icon: Heart,    color: "text-pink-400",   bg: "bg-pink-500/10",   title: "Collector culture", desc: "Team events, item loans, and access to exclusive drops."              },
  { icon: Briefcase,color: "text-emerald-400",bg: "bg-emerald-500/10",title: "Growth budget",    desc: "€2,000/year per person for courses, books, and conferences."          },
]

const ROLES = [
  {
    id: "r1",
    title: "Senior Full-Stack Engineer",
    team: "Engineering",
    location: "Remote (EU)",
    type: "Full-time",
    badge: "🔥 Urgent",
    badgeColor: "border-red-500/20 text-red-400",
    desc: "Build and scale the core marketplace. Next.js 16, Supabase, TypeScript. You'll own features end-to-end.",
  },
  {
    id: "r2",
    title: "Authentication Specialist — Watches",
    team: "Authentication",
    location: "Geneva, CH",
    type: "Full-time",
    badge: "⌚ Specialist",
    badgeColor: "border-violet-500/20 text-violet-400",
    desc: "WOSTEP or equivalent certification required. Lead verification of high-value watch submissions (>$10k).",
  },
  {
    id: "r3",
    title: "Seller Success Manager",
    team: "Growth",
    location: "Remote (EU/US)",
    type: "Full-time",
    badge: "📈 Growth",
    badgeColor: "border-emerald-500/20 text-emerald-400",
    desc: "Own the seller relationship from onboarding to first sale. You'll define the playbook for how great sellers succeed on Aureon.",
  },
  {
    id: "r4",
    title: "Brand & Content Designer",
    team: "Design",
    location: "Remote",
    type: "Full-time",
    badge: "🎨 Creative",
    badgeColor: "border-pink-500/20 text-pink-400",
    desc: "Create the visual language of Aureon across product, marketing, and editorial. Figma master, taste-maker.",
  },
  {
    id: "r5",
    title: "Head of Authentication Operations",
    team: "Authentication",
    location: "London or Paris",
    type: "Full-time",
    badge: "🏆 Leadership",
    badgeColor: "border-amber-500/20 text-amber-400",
    desc: "Scale our authentication network from 5 to 50 experts globally. Build partnerships with grading institutions.",
  },
]

export default function CareersPage() {
  const [applied, setApplied] = useState<Set<string>>(new Set())

  function apply(id: string, title: string) {
    setApplied((prev) => new Set([...prev, id]))
    toast.success(`Application submitted for ${title}`, {
      description: "We'll be in touch within 5 business days.",
    })
  }

  return (
    <div className="bg-midnight">
      {/* Hero */}
      <div className="border-b border-white/5 bg-midnight-50/30 py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-violet-400">
            We're hiring
          </p>
          <h1 className="font-display text-4xl font-bold text-foreground sm:text-5xl">
            Build the future of <br />
            <GradientText>luxury commerce.</GradientText>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            Join a small, ambitious team redefining how the world's rarest objects change hands.
            We move fast, we care deeply about quality, and we're just getting started.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-violet-400" /> Remote-first · Geneva · London · Paris
            </span>
            <span className="flex items-center gap-1.5">
              <Briefcase className="h-4 w-4 text-pink-400" /> {ROLES.length} open roles
            </span>
          </div>
        </div>
      </div>

      {/* Perks */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="mb-8 font-display text-2xl font-bold text-foreground">Why Aureon?</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PERKS.map(({ icon: Icon, color, bg, title, desc }) => (
            <div key={title} className="glass-card rounded-2xl p-5">
              <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl ${bg}`}>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <p className="font-semibold text-foreground">{title}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Open roles */}
      <section className="mx-auto max-w-5xl px-4 pb-24 sm:px-6 lg:px-8">
        <h2 className="mb-6 font-display text-2xl font-bold text-foreground">
          Open positions
        </h2>
        <div className="space-y-4">
          {ROLES.map((role) => {
            const isApplied = applied.has(role.id)
            return (
              <div
                key={role.id}
                className="glass-card rounded-2xl p-6 transition-all hover:border-white/10"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display text-lg font-bold text-foreground">
                        {role.title}
                      </h3>
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${role.badgeColor}`}
                      >
                        {role.badge}
                      </Badge>
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-3 w-3" /> {role.team}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {role.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {role.type}
                      </span>
                    </div>
                    <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                      {role.desc}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    disabled={isApplied}
                    onClick={() => apply(role.id, role.title)}
                    className={
                      isApplied
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                        : "gradient-brand border-0 text-white hover:opacity-90"
                    }
                  >
                    {isApplied ? (
                      "Applied ✓"
                    ) : (
                      <>Apply <ArrowRight className="ml-1.5 h-3.5 w-3.5" /></>
                    )}
                  </Button>
                </div>
              </div>
            )
          })}
        </div>

        {/* General apply */}
        <div className="mt-8 rounded-2xl border border-dashed border-white/10 p-8 text-center">
          <p className="font-semibold text-foreground">Don't see your role?</p>
          <p className="mt-2 text-sm text-muted-foreground">
            We're always looking for exceptional people. Send your CV and a note about what you'd
            bring to Aureon.
          </p>
          <Button
            variant="outline"
            className="mt-5 border-white/15 hover:bg-white/5"
            onClick={() => toast.success("Open application submitted — we'll be in touch!")}
          >
            Send open application
          </Button>
        </div>
      </section>
    </div>
  )
}
