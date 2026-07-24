import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { useLiveData } from "@/lib/config"
import { env } from "@/lib/env"
import { createSupabaseServerClient, createSupabaseServerAdminClient } from "@/lib/supabase/server"
import { createConnectAccount, createOnboardingLink } from "@/lib/stripe/connect"

async function getOrigin(): Promise<string> {
  const h = await headers()
  const forwardedHost = h.get("x-forwarded-host")
  const forwardedProto = h.get("x-forwarded-proto") ?? "https"
  if (forwardedHost) return `${forwardedProto}://${forwardedHost}`
  return env.NEXT_PUBLIC_APP_URL
}

export async function POST() {
  if (!useLiveData) {
    return NextResponse.json(
      { error: "Payouts onboarding requires a live Supabase + Stripe configuration." },
      { status: 503 },
    )
  }

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "You must be signed in." }, { status: 401 })
  }

  const admin = await createSupabaseServerAdminClient()
  const { data: seller, error } = await admin
    .from("seller_profiles")
    .select("id, stripe_account_id")
    .eq("user_id", user.id)
    .maybeSingle()

  if (error || !seller) {
    return NextResponse.json(
      { error: "No approved seller profile found for this account." },
      { status: 403 },
    )
  }

  // Create the Connect account on first onboarding, then reuse it.
  let accountId = seller.stripe_account_id
  if (!accountId) {
    accountId = await createConnectAccount(user.email ?? null)
    const { error: updateError } = await admin
      .from("seller_profiles")
      .update({ stripe_account_id: accountId })
      .eq("id", seller.id)

    if (updateError) {
      return NextResponse.json({ error: "Could not save payout account." }, { status: 500 })
    }
  }

  const origin = await getOrigin()
  const url = await createOnboardingLink(accountId, origin)

  return NextResponse.json({ url })
}
