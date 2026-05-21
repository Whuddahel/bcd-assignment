import { GradientText } from "@/components/brand/gradient-text"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Privacy Policy — Aureon" }

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="mb-3 font-display text-xl font-bold text-foreground">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  )
}

export default function PrivacyPage() {
  return (
    <div className="bg-midnight">
      <div className="border-b border-white/5 bg-midnight-50/30 py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-violet-400">Legal</p>
          <h1 className="font-display text-4xl font-bold text-foreground">
            Privacy <GradientText>Policy</GradientText>
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">Last updated: 1 December 2024</p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="glass-card rounded-2xl p-8 lg:p-10">
          <Section title="1. Who we are">
            <p>
              Aureon Inc. ("Aureon", "we", "us") operates the marketplace at aureon.io. We are
              registered in Geneva, Switzerland. Our data protection officer can be reached at
              privacy@aureon.io.
            </p>
          </Section>

          <Section title="2. Data we collect">
            <p>We collect information you provide directly — name, email, shipping address, payment
              details — and data generated through your use of the platform, including browsing
              history, wishlist activity, and search queries.</p>
            <p>We use cookies and similar tracking technologies to personalise your experience and
              measure performance. See our Cookie Policy for details.</p>
          </Section>

          <Section title="3. How we use your data">
            <p>We use your data to: process transactions and communicate order updates; verify
              identity and comply with KYC/AML obligations; personalise recommendations and
              marketing communications (with consent); detect and prevent fraud; and improve our
              platform through analytics.</p>
            <p>We do not sell your personal data to third parties for their own marketing purposes.</p>
          </Section>

          <Section title="4. Legal bases for processing (GDPR)">
            <p>Where the GDPR applies, we process personal data on the bases of: contract
              performance (order fulfilment); legal obligation (KYC/AML); legitimate interests
              (fraud prevention, analytics); and consent (marketing emails, non-essential cookies).</p>
          </Section>

          <Section title="5. Sharing with third parties">
            <p>We share data with: payment processors (Stripe); shipping partners; authentication
              experts and grading services; identity verification providers; and cloud infrastructure
              providers (Supabase, Vercel). All sub-processors are bound by GDPR-compliant data
              processing agreements.</p>
          </Section>

          <Section title="6. Data retention">
            <p>We retain account data for as long as your account is active and for 7 years
              thereafter to comply with financial regulations. Transaction records are kept for
              10 years. You may request deletion of non-essential data at any time.</p>
          </Section>

          <Section title="7. Your rights">
            <p>Under the GDPR and applicable laws, you have the right to: access the data we hold
              about you; correct inaccurate data; request erasure; restrict or object to processing;
              and data portability. Submit requests to privacy@aureon.io. We respond within 30 days.</p>
          </Section>

          <Section title="8. International transfers">
            <p>We operate globally. Data may be transferred outside the EEA using Standard
              Contractual Clauses approved by the European Commission. A copy of our SCCs is
              available on request.</p>
          </Section>

          <Section title="9. Security">
            <p>We use industry-standard encryption (TLS 1.3 in transit, AES-256 at rest),
              access controls, and regular security audits. No system is completely secure;
              we will notify you of any breach affecting your data as required by law.</p>
          </Section>

          <Section title="10. Changes to this policy">
            <p>We may update this policy. Material changes will be communicated by email and a
              prominent notice on the platform at least 30 days before taking effect.</p>
            <p>For questions, contact privacy@aureon.io.</p>
          </Section>
        </div>
      </div>
    </div>
  )
}
