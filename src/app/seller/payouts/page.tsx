import { CheckCircle, Clock, CreditCard, ShieldAlert } from "lucide-react"
import { GradientText } from "@/components/brand/gradient-text"
import { ConnectPayoutsButton } from "@/components/seller/connect-payouts-button"
import { useLiveData, appConfig } from "@/lib/config"
import { requireUser } from "@/lib/auth/session"
import { createSupabaseServerAdminClient } from "@/lib/supabase/server"
import { getConnectStatus } from "@/lib/stripe/connect"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Payouts" }

async function loadPayoutState(userId: string) {
  const admin = await createSupabaseServerAdminClient()
  const { data: seller } = await admin
    .from("seller_profiles")
    .select("id, business_name, stripe_account_id, stripe_onboarding_complete")
    .eq("user_id", userId)
    .maybeSingle()

  if (!seller) return { seller: null, status: null }

  const status = await getConnectStatus(seller.stripe_account_id)

  // Keep the denormalized flag on seller_profiles in sync with Stripe's live
  // state, so the checkout webhook's transfer gate stays accurate.
  const onboardingComplete = status.payoutsEnabled && status.detailsSubmitted
  if (onboardingComplete !== seller.stripe_onboarding_complete) {
    await admin
      .from("seller_profiles")
      .update({ stripe_onboarding_complete: onboardingComplete })
      .eq("id", seller.id)
  }

  return { seller, status }
}

export default async function SellerPayoutsPage() {
  const user = await requireUser(["seller", "admin", "support"])
  const state = useLiveData ? await loadPayoutState(user.id) : null

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-violet-400">Seller Hub</p>
        <h1 className="mt-1 font-display text-3xl font-bold">
          Payouts &amp; <GradientText>Stripe Connect</GradientText>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Aureon pays sellers via Stripe Connect. A {appConfig.stripe.platformFeePercent}% platform
          fee is deducted from each sale; the rest is transferred to your connected account.
        </p>
      </div>

      {!useLiveData ? (
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
            <div>
              <p className="font-semibold text-foreground">Live configuration required</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Stripe Connect onboarding runs against real Supabase + Stripe credentials.
                Set <code className="rounded bg-white/10 px-1 text-xs">DEVELOPMENT_MODE=false</code> with
                live keys to enable it.
              </p>
            </div>
          </div>
        </div>
      ) : !state?.seller ? (
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
            <div>
              <p className="font-semibold text-foreground">No seller profile</p>
              <p className="mt-1 text-sm text-muted-foreground">
                This account isn&apos;t an approved seller yet. Once an admin approves your
                application, you can set up payouts here.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <PayoutStatusCard
          businessName={state.seller.business_name}
          payoutsEnabled={state.status?.payoutsEnabled ?? false}
          detailsSubmitted={state.status?.detailsSubmitted ?? false}
          hasAccount={Boolean(state.seller.stripe_account_id)}
        />
      )}
    </div>
  )
}

function PayoutStatusCard({
  businessName, payoutsEnabled, detailsSubmitted, hasAccount,
}: {
  businessName: string
  payoutsEnabled: boolean
  detailsSubmitted: boolean
  hasAccount: boolean
}) {
  const active = payoutsEnabled && detailsSubmitted
  const pending = hasAccount && !active

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-xl ${
              active ? "bg-emerald-500/10" : pending ? "bg-amber-500/10" : "bg-white/5"
            }`}
          >
            {active ? (
              <CheckCircle className="h-5 w-5 text-emerald-400" />
            ) : pending ? (
              <Clock className="h-5 w-5 text-amber-400" />
            ) : (
              <CreditCard className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          <div>
            <p className="font-semibold text-foreground">{businessName}</p>
            <p className="text-sm text-muted-foreground">
              {active
                ? "Payouts active — you're ready to receive transfers."
                : pending
                  ? "Onboarding started but not finished — a few details are still required."
                  : "Payouts not set up yet."}
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <StatusRow label="Details submitted" ok={detailsSubmitted} />
          <StatusRow label="Payouts enabled" ok={payoutsEnabled} />
        </div>
      </div>

      {!active && (
        <div className="glass-card rounded-2xl p-6">
          <p className="mb-4 text-sm text-muted-foreground">
            {pending
              ? "Resume onboarding to finish setting up payouts."
              : "Set up your Stripe Connect account to start receiving payouts on your sales."}
          </p>
          <ConnectPayoutsButton label={pending ? "Resume onboarding" : "Set up payouts"} />
        </div>
      )}
    </div>
  )
}

function StatusRow({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/2 p-3">
      {ok ? (
        <CheckCircle className="h-4 w-4 text-emerald-400" />
      ) : (
        <Clock className="h-4 w-4 text-muted-foreground" />
      )}
      <span className={`text-sm ${ok ? "text-foreground" : "text-muted-foreground"}`}>{label}</span>
    </div>
  )
}
