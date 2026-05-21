import Link from "next/link"
import { ArrowRight, ExternalLink, Download, Newspaper } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GradientText } from "@/components/brand/gradient-text"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Press — Aureon" }

const COVERAGE = [
  {
    outlet: "Financial Times",
    date: "Dec 2024",
    headline: "Aureon raises $8M to authenticate the $400B collectibles market",
    tag: "Funding",
    tagColor: "border-violet-500/20 text-violet-400",
    excerpt:
      "The Geneva-based startup uses a combination of expert authentication, third-party grading partnerships, and blockchain provenance to bring institutional trust to the secondary luxury market.",
  },
  {
    outlet: "TechCrunch",
    date: "Nov 2024",
    headline: "How Aureon is using AI-assisted grading to cut authentication time from weeks to hours",
    tag: "Technology",
    tagColor: "border-pink-500/20 text-pink-400",
    excerpt:
      "Aureon's proprietary grading pipeline combines expert review with computer vision to flag anomalies in watches, handbags, and trading cards — dramatically compressing the authentication window.",
  },
  {
    outlet: "Hodinkee",
    date: "Oct 2024",
    headline: "The platform serious watch collectors have been waiting for",
    tag: "Editorial",
    tagColor: "border-amber-500/20 text-amber-400",
    excerpt:
      "Unlike grey-market dealers or auction houses with opaque provenance, Aureon lists every service history, original box status, and independent authentication report alongside each watch.",
  },
  {
    outlet: "Artnet News",
    date: "Sep 2024",
    headline: "Aureon expands into fine art and prints with gallery-grade provenance tracking",
    tag: "Expansion",
    tagColor: "border-emerald-500/20 text-emerald-400",
    excerpt:
      "Following a successful launch in the watch category, Aureon has onboarded three blue-chip art dealers and introduced artist-studio COA integration.",
  },
]

const BRAND_ASSETS = [
  { label: "Logo Pack (SVG, PNG)",   size: "340 KB" },
  { label: "Brand Guidelines (PDF)", size: "2.1 MB" },
  { label: "Photography Kit",        size: "18 MB"  },
  { label: "Founder Headshots",      size: "4.2 MB" },
]

export default function PressPage() {
  return (
    <div className="bg-midnight">
      {/* Hero */}
      <div className="border-b border-white/5 bg-midnight-50/30 py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-violet-400">
            Press Room
          </p>
          <h1 className="font-display text-4xl font-bold text-foreground sm:text-5xl">
            <GradientText>Aureon</GradientText> in the news
          </h1>
          <p className="mt-4 max-w-xl text-muted-foreground">
            Media enquiries, brand assets, and press coverage. For interview requests contact{" "}
            <a href="mailto:press@aureon.io" className="text-violet-400 hover:text-violet-300 transition-colors">
              press@aureon.io
            </a>
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1fr_280px]">
          {/* Coverage */}
          <div>
            <h2 className="mb-6 font-display text-2xl font-bold text-foreground">
              Recent Coverage
            </h2>
            <div className="space-y-5">
              {COVERAGE.map((item) => (
                <div
                  key={item.headline}
                  className="glass-card group rounded-2xl p-6 transition-all hover:border-white/10"
                >
                  <div className="mb-3 flex flex-wrap items-center gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5">
                      <Newspaper className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <span className="text-sm font-semibold text-foreground">{item.outlet}</span>
                    <span className="text-xs text-muted-foreground">{item.date}</span>
                    <Badge variant="outline" className={`ml-auto text-[10px] ${item.tagColor}`}>
                      {item.tag}
                    </Badge>
                  </div>
                  <h3 className="font-semibold leading-snug text-foreground group-hover:text-violet-300 transition-colors">
                    {item.headline}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {item.excerpt}
                  </p>
                  <button className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-violet-400 transition-colors">
                    Read full article <ExternalLink className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Press contact */}
            <div className="glass-card rounded-2xl p-6">
              <h3 className="mb-1 font-semibold text-foreground">Press Contact</h3>
              <p className="text-sm text-muted-foreground">For enquiries, interviews, and exclusives:</p>
              <a
                href="mailto:press@aureon.io"
                className="mt-3 block text-sm font-medium text-violet-400 hover:text-violet-300 transition-colors"
              >
                press@aureon.io
              </a>
              <p className="mt-1 text-xs text-muted-foreground">Response within 2 business hours</p>
            </div>

            {/* Brand assets */}
            <div className="glass-card rounded-2xl p-6">
              <h3 className="mb-4 font-semibold text-foreground">Brand Assets</h3>
              <div className="space-y-3">
                {BRAND_ASSETS.map(({ label, size }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between rounded-lg border border-white/5 bg-white/3 px-3 py-2.5"
                  >
                    <div>
                      <p className="text-xs font-medium text-foreground">{label}</p>
                      <p className="text-[10px] text-muted-foreground">{size}</p>
                    </div>
                    <button className="text-muted-foreground hover:text-violet-400 transition-colors">
                      <Download className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 w-full border-white/10 hover:bg-white/5"
              >
                <Download className="mr-2 h-3.5 w-3.5" /> Download full kit
              </Button>
            </div>

            {/* Key facts */}
            <div className="glass-card rounded-2xl p-6">
              <h3 className="mb-4 font-semibold text-foreground">Key Facts</h3>
              <div className="space-y-3 text-sm">
                {[
                  ["Founded",     "2024, Geneva"],
                  ["Funding",     "$8M Seed"],
                  ["Team",        "12 people"],
                  ["HQ",          "Geneva, Switzerland"],
                  ["Categories",  "Watches, Art, Designer,\nRare Items, Jewellery"],
                ].map(([key, val]) => (
                  <div key={key} className="flex justify-between gap-3 border-t border-white/5 pt-3 first:border-0 first:pt-0">
                    <span className="shrink-0 text-muted-foreground">{key}</span>
                    <span className="text-right text-foreground">{val}</span>
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
