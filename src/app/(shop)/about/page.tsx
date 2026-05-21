import Link from "next/link"
import { Shield, Star, TrendingUp, Users, ArrowRight, CheckCircle, Gem, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GradientText } from "@/components/brand/gradient-text"
import { HeroBlobBackground } from "@/components/brand/gradient-blob"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "About Aureon — The Premier Luxury Collectibles Marketplace",
}

const stats = [
  { label: "Founded",           value: "2024"    },
  { label: "Verified listings", value: "2,400+"  },
  { label: "Trusted sellers",   value: "180+"    },
  { label: "Total traded",      value: "$12M+"   },
]

const values = [
  {
    icon: Shield,
    title: "Authenticity First",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    desc: "Every item on Aureon undergoes rigorous multi-point authentication. We partner with industry-leading experts — Entrupy, PCGS, Pest Control — to ensure what you buy is exactly what it says it is.",
  },
  {
    icon: Lock,
    title: "Provenance Tracking",
    color: "text-pink-400",
    bg: "bg-pink-500/10",
    desc: "We track the complete ownership history of every item. From the original sale to every subsequent transaction, the chain of custody is documented, verifiable, and permanent.",
  },
  {
    icon: Gem,
    title: "Curated Excellence",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    desc: "We don't accept everything. Our editorial team reviews every new listing for rarity, authenticity credentials, and market significance. The standard is non-negotiable.",
  },
]

const team = [
  { name: "Alexandre Moreau",  title: "Co-founder & CEO",          initials: "AM", gradient: "from-violet-600 to-violet-900" },
  { name: "Isabelle Fontaine", title: "Co-founder & Chief of Auth", initials: "IF", gradient: "from-pink-600 to-pink-900"   },
  { name: "Kenji Watanabe",    title: "VP Engineering",             initials: "KW", gradient: "from-amber-600 to-amber-900"  },
  { name: "Sofia Marchetti",   title: "Head of Seller Relations",   initials: "SM", gradient: "from-emerald-600 to-emerald-900" },
]

export default function AboutPage() {
  return (
    <div className="bg-midnight">
      {/* Hero */}
      <section className="relative overflow-hidden py-24 sm:py-32">
        <HeroBlobBackground />
        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-violet-400">
            Our Story
          </p>
          <h1
            className="font-display font-bold leading-tight tracking-tight text-foreground"
            style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)" }}
          >
            Built for those who <br />
            <GradientText animated>collect the rare.</GradientText>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Aureon was founded by collectors, for collectors. We saw a fragmented market — where
            authenticity was guesswork, provenance was paper-thin, and trust was a luxury few could
            afford. We built the platform we always wished existed.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-white/5 bg-midnight-50/40 py-14">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {stats.map(({ label, value }) => (
              <div key={label} className="text-center">
                <p className="font-display text-4xl font-bold text-foreground">{value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="mx-auto max-w-4xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="glass-card rounded-3xl p-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-pink-400">Mission</p>
          <blockquote className="mt-4 font-display text-2xl font-bold leading-relaxed text-foreground sm:text-3xl">
            "To make the world's rarest objects accessible to serious collectors — with the
            authentication, provenance, and trust they deserve."
          </blockquote>
          <p className="mt-6 leading-relaxed text-muted-foreground">
            The secondary market for luxury collectibles is worth over $400 billion globally. Yet
            buyers still lose millions each year to counterfeits, misrepresented provenance, and
            opaque pricing. Aureon is changing that — one verified item at a time.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="mx-auto max-w-5xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-400">
            What We Stand For
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold text-foreground sm:text-4xl">
            Our Values
          </h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          {values.map(({ icon: Icon, title, color, bg, desc }) => (
            <div key={title} className="glass-card rounded-2xl p-6">
              <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${bg}`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <h3 className="mb-2 font-display text-lg font-bold text-foreground">{title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="border-t border-white/5 bg-midnight-50/30 py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-violet-400">
              The People
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold text-foreground sm:text-4xl">
              Meet the team
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {team.map(({ name, title, initials, gradient }) => (
              <div key={name} className="glass-card rounded-2xl p-6 text-center">
                <div
                  className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-2xl font-bold text-white`}
                >
                  {initials}
                </div>
                <p className="font-semibold text-foreground">{name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why collectors choose us */}
      <section className="mx-auto max-w-4xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
            Why collectors choose <GradientText>Aureon</GradientText>
          </h2>
        </div>
        <div className="space-y-4">
          {[
            "Multi-point authentication on every single item — no exceptions",
            "Independent third-party certificates from globally recognised graders",
            "Escrow-protected payments — funds release only on delivery confirmation",
            "14-day returns if an item is materially misrepresented",
            "Blockchain provenance records coming in Phase 2 — immutable ownership chain",
          ].map((point) => (
            <div key={point} className="flex items-start gap-3">
              <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
              <p className="text-muted-foreground">{point}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/5 bg-midnight-50/30 py-20">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
          <h2 className="font-display text-3xl font-bold text-foreground">
            Ready to start collecting?
          </h2>
          <p className="mt-4 text-muted-foreground">
            Browse thousands of authenticated items or apply to become a verified seller.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button
              size="lg"
              className="gradient-brand btn-glow h-12 gap-2 border-0 px-8 text-white hover:opacity-90"
              asChild
            >
              <Link href="/browse">
                Explore collection <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 border-white/15 px-8 hover:bg-white/5"
              asChild
            >
              <Link href="/seller/apply">Become a seller</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
