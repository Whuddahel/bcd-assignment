import { GradientText } from "@/components/brand/gradient-text"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Terms of Service — Aureon" }

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="mb-3 font-display text-xl font-bold text-foreground">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  )
}

export default function TermsPage() {
  return (
    <div className="bg-midnight">
      <div className="border-b border-white/5 bg-midnight-50/30 py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-violet-400">Legal</p>
          <h1 className="font-display text-4xl font-bold text-foreground">
            Terms of <GradientText>Service</GradientText>
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">Last updated: 1 December 2024</p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="glass-card rounded-2xl p-8 lg:p-10">
          <Section title="1. Acceptance">
            <p>By accessing or using Aureon, you agree to be bound by these Terms of Service and our
              Privacy Policy. If you do not agree, do not use the platform. These terms apply to
              all buyers, sellers, and visitors.</p>
          </Section>

          <Section title="2. The platform">
            <p>Aureon is a marketplace that facilitates transactions between independent sellers and
              buyers of luxury collectibles. Aureon is not a party to any transaction between users
              and does not hold inventory.</p>
            <p>Aureon provides authentication and provenance verification services. A "Verified"
              status means the item has passed Aureon's authentication process at the time of
              listing — it is not an investment advice or value guarantee.</p>
          </Section>

          <Section title="3. Accounts">
            <p>You must be 18 or older to create an account. You are responsible for maintaining the
              confidentiality of your credentials and for all activity under your account. Notify us
              immediately of any unauthorised access at security@aureon.io.</p>
          </Section>

          <Section title="4. Buyers">
            <p>When you purchase an item, you enter a binding contract with the seller. Aureon holds
              payment in escrow and releases it to the seller only upon your confirmed receipt and
              acceptance of the item.</p>
            <p>You may return an item within 14 days of delivery if it is materially misrepresented
              in the listing. "Materially misrepresented" means a significant discrepancy in
              condition, authenticity, or provenance — not a change of mind.</p>
          </Section>

          <Section title="5. Sellers">
            <p>Sellers must apply and be approved before listing. You warrant that you are the lawful
              owner of each item listed, that all descriptions are accurate and not misleading, and
              that all required authentication documents are valid and current.</p>
            <p>Sellers may not list counterfeit, stolen, or legally restricted items. Violations
              result in immediate suspension and referral to relevant authorities.</p>
            <p>Aureon charges a platform fee of 10% on each completed sale, deducted before payout.
              Payouts are processed via Stripe Connect within 5 business days of buyer confirmation.</p>
          </Section>

          <Section title="6. Prohibited conduct">
            <p>You may not: manipulate prices or create artificial demand; circumvent the platform to
              transact off-platform; harass or threaten other users; or use the platform for money
              laundering or other illegal purposes. Violations result in permanent suspension.</p>
          </Section>

          <Section title="7. Intellectual property">
            <p>All content on the Aureon platform — logos, copy, design — is owned by Aureon Inc.
              Sellers grant Aureon a licence to use listing content (images, descriptions) for
              platform and marketing purposes during and after the listing period.</p>
          </Section>

          <Section title="8. Limitation of liability">
            <p>Aureon is not liable for: the authenticity of items (beyond the authentication
              services described); seller or buyer conduct; loss of value of collectibles; or
              indirect, incidental, or consequential damages. Aureon's total liability is capped
              at the transaction value in question.</p>
          </Section>

          <Section title="9. Governing law">
            <p>These terms are governed by Swiss law. Disputes shall be submitted to the competent
              courts of Geneva, Switzerland, unless mandatory consumer law in your country
              of residence provides otherwise.</p>
          </Section>

          <Section title="10. Changes">
            <p>We may amend these terms. Continued use after the effective date constitutes
              acceptance. Material changes will be communicated 30 days in advance by email.</p>
            <p>Questions? Contact legal@aureon.io.</p>
          </Section>
        </div>
      </div>
    </div>
  )
}
