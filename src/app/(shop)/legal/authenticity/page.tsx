import { Shield, CheckCircle, AlertCircle, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GradientText } from "@/components/brand/gradient-text"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Authenticity Guarantee — Aureon" }

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="mb-3 font-display text-xl font-bold text-foreground">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  )
}

const PARTNERS = [
  { name: "Entrupy",          category: "Handbags & Apparel",    description: "AI-powered microscopic authentication" },
  { name: "PCGS",             category: "Coins & Bullion",       description: "Professional Coin Grading Service"     },
  { name: "PSA",              category: "Trading Cards",         description: "Professional Sports Authenticator"     },
  { name: "Pest Control",     category: "Banksy Prints",         description: "Official Banksy authentication body"   },
  { name: "WOSTEP Partners",  category: "Watches",               description: "Certified horology experts"            },
  { name: "GIA",              category: "Diamonds & Jewellery",  description: "Gemological Institute of America"      },
]

const PROCESS = [
  { step: "01", title: "Seller submission",   desc: "Seller submits item details, photos, and all existing authentication documents."                                     },
  { step: "02", title: "Expert review",       desc: "Our in-house specialists and/or category-specific partners review the submission against authenticity criteria."        },
  { step: "03", title: "Physical inspection", desc: "High-value items (>$5,000) require physical inspection at the seller's location or our regional inspection centres."  },
  { step: "04", title: "Verification issued", desc: "Authenticated items receive an Aureon Verification Certificate linked to the listing. Buyers can scan QR to verify." },
]

export default function AuthenticityPage() {
  return (
    <div className="bg-midnight">
      {/* Hero */}
      <div className="border-b border-white/5 bg-midnight-50/30 py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-violet-400">Legal</p>
          <h1 className="font-display text-4xl font-bold text-foreground sm:text-5xl">
            Authenticity <GradientText>Guarantee</GradientText>
          </h1>
          <p className="mt-4 max-w-xl text-muted-foreground">
            Every item on Aureon is authenticated. Here's exactly what that means, how it works,
            and what you're protected against.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Guarantee banner */}
        <div className="mb-12 flex items-start gap-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-6">
          <Shield className="mt-0.5 h-6 w-6 shrink-0 text-emerald-400" />
          <div>
            <p className="font-semibold text-emerald-300">The Aureon Guarantee</p>
            <p className="mt-1 text-sm text-emerald-300/80">
              If you receive an item that does not match its authentication status, Aureon will
              provide a <strong>full refund including shipping costs</strong> — no questions asked.
              This guarantee is backed by Aureon Inc. and applies to all transactions on the platform.
            </p>
          </div>
        </div>

        <div className="grid gap-12 lg:grid-cols-[1fr_340px]">
          <div>
            <Section title="What authentication means">
              <p>When you see the "Verified Authentic" badge on an Aureon listing, it means the item
                has been assessed against category-specific authenticity criteria by qualified experts.
                This is not a price guarantee or investment advice — it is a statement that the item
                is what it claims to be.</p>
              <p>Authentication covers: identity of the maker or artist; originality of the item (not
                a replica, reproduction, or counterfeit); condition grade as described; and — where
                applicable — edition numbering and provenance chain.</p>
            </Section>

            <Section title="Authentication process">
              <div className="space-y-4">
                {PROCESS.map(({ step, title, desc }) => (
                  <div key={step} className="flex gap-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 text-xs font-bold text-violet-300">
                      {step}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{title}</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="What is NOT covered">
              <div className="space-y-2">
                {[
                  "Items purchased off-platform or through private arrangements with sellers",
                  "Changes in market value or collector interest",
                  "Wear or damage occurring after confirmed delivery",
                  "Items described as 'vintage replica' or 'inspired by' — these are not listed as originals",
                ].map((point) => (
                  <div key={point} className="flex items-start gap-2.5">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                    <p>{point}</p>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Filing a claim">
              <p>If you believe an item is not authentic, contact us at claims@aureon.io within 14
                days of delivery with: your order number; clear photos of the item, serial numbers,
                and any authentication markers; and a description of the discrepancy. We respond
                within 24 hours.</p>
              <p>We may request the item be sent for independent re-authentication. Aureon covers
                all shipping costs for valid claims. Refunds are processed within 5 business days
                of claim approval.</p>
            </Section>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Partners */}
            <div className="glass-card rounded-2xl p-6">
              <h3 className="mb-4 font-semibold text-foreground">Authentication Partners</h3>
              <div className="space-y-3">
                {PARTNERS.map(({ name, category, description }) => (
                  <div key={name} className="flex items-start gap-3 border-t border-white/5 pt-3 first:border-0 first:pt-0">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg gradient-brand text-[10px] font-bold text-white">
                      {name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-medium text-foreground">{name}</p>
                        <CheckCircle className="h-3 w-3 text-emerald-400" />
                      </div>
                      <p className="text-[10px] text-muted-foreground">{category}</p>
                      <p className="text-[10px] text-muted-foreground/70">{description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Blockchain teaser */}
            <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-5">
              <Badge variant="outline" className="mb-3 border-violet-500/30 text-violet-400 text-[10px]">
                Phase 2
              </Badge>
              <p className="text-sm font-semibold text-foreground">Blockchain certificates</p>
              <p className="mt-1.5 text-xs text-muted-foreground">
                Every authentication certificate will be minted on-chain — immutable, publicly
                verifiable, and transferable with the item.
              </p>
            </div>

            {/* CTA */}
            <div className="glass-card rounded-2xl p-5 text-center">
              <p className="text-sm font-semibold text-foreground">Have a question?</p>
              <p className="mt-1 text-xs text-muted-foreground">Our authentication team is here to help.</p>
              <Button
                size="sm"
                className="gradient-brand mt-4 w-full border-0 text-white hover:opacity-90"
                asChild
              >
                <Link href="/contact">
                  Contact us <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
