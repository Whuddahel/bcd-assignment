import { GradientText } from "@/components/brand/gradient-text"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Cookie Policy — Aureon" }

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="mb-3 font-display text-xl font-bold text-foreground">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  )
}

const COOKIE_TYPES = [
  {
    name: "Strictly necessary",
    purpose: "Session management, authentication, security (CSRF tokens). Cannot be disabled.",
    examples: "aureon-session, aureon-csrf",
    duration: "Session / 30 days",
    required: true,
  },
  {
    name: "Functional",
    purpose: "Remember your preferences — theme, language, cart contents.",
    examples: "aureon-cart, aureon-prefs",
    duration: "90 days",
    required: false,
  },
  {
    name: "Analytics",
    purpose: "Understand how visitors use the site (page views, funnel drop-off). Data is aggregated and anonymised.",
    examples: "Vercel Analytics",
    duration: "90 days",
    required: false,
  },
  {
    name: "Marketing",
    purpose: "Personalise ads and measure campaign performance. Only placed with your explicit consent.",
    examples: "Google Ads, Meta Pixel (Phase 2)",
    duration: "180 days",
    required: false,
  },
]

export default function CookiesPage() {
  return (
    <div className="bg-midnight">
      <div className="border-b border-white/5 bg-midnight-50/30 py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-violet-400">Legal</p>
          <h1 className="font-display text-4xl font-bold text-foreground">
            Cookie <GradientText>Policy</GradientText>
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">Last updated: 1 December 2024</p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="glass-card rounded-2xl p-8 lg:p-10">
          <Section title="What are cookies?">
            <p>Cookies are small text files stored on your device when you visit a website. They help
              the site remember your preferences and understand how you use it. We also use similar
              technologies — local storage, session storage — for the same purposes.</p>
          </Section>

          <Section title="Cookies we use">
            <p>The table below describes the cookies placed on aureon.io:</p>
          </Section>

          {/* Cookie table */}
          <div className="mb-10 overflow-hidden rounded-xl border border-white/5">
            <div className="grid grid-cols-[1fr_2fr_1fr_auto] gap-3 border-b border-white/5 bg-white/3 px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <span>Type</span>
              <span>Purpose</span>
              <span>Duration</span>
              <span>Required</span>
            </div>
            {COOKIE_TYPES.map((c) => (
              <div
                key={c.name}
                className="grid grid-cols-[1fr_2fr_1fr_auto] items-start gap-3 border-t border-white/5 px-4 py-4 text-sm"
              >
                <div>
                  <p className="font-medium text-foreground">{c.name}</p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">{c.examples}</p>
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">{c.purpose}</p>
                <p className="text-xs text-muted-foreground">{c.duration}</p>
                <span
                  className={`mt-0.5 text-xs font-medium ${
                    c.required ? "text-amber-400" : "text-muted-foreground"
                  }`}
                >
                  {c.required ? "Yes" : "Optional"}
                </span>
              </div>
            ))}
          </div>

          <Section title="Your choices">
            <p>You can manage non-essential cookies via the cookie banner shown on first visit, or
              at any time via your browser settings. Note that disabling functional cookies may
              affect your experience (e.g. your cart may not persist).</p>
            <p>Most browsers allow you to refuse cookies, delete existing cookies, and be warned
              before a cookie is set. Refer to your browser's help section for instructions.</p>
          </Section>

          <Section title="Third-party cookies">
            <p>Some third parties (Stripe for payments) may place their own cookies. These are
              necessary for payment processing and subject to the third party's own privacy policy.
              We do not control these cookies.</p>
          </Section>

          <Section title="Changes">
            <p>We may update this policy as our use of cookies evolves. Check this page periodically
              for updates. Questions? Contact privacy@aureon.io.</p>
          </Section>
        </div>
      </div>
    </div>
  )
}
