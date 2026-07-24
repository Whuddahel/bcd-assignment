import { getStripe } from "@/lib/stripe/server"

export type ConnectStatus = {
  accountId: string | null
  chargesEnabled: boolean
  payoutsEnabled: boolean
  detailsSubmitted: boolean
}

/**
 * Creates a Stripe Connect account for a seller, or returns the existing one.
 *
 * Uses Standard accounts: Malaysia-registered platforms (this project's Stripe
 * account) can't create Express/Custom accounts — Stripe blocks loss-liable
 * account types in MY. Standard accounts still support Account Links onboarding
 * and receive marketplace payouts via stripe.transfers.create in the webhook.
 */
export async function createConnectAccount(email: string | null): Promise<string> {
  const stripe = getStripe()
  const account = await stripe.accounts.create({
    type: "standard",
    ...(email ? { email } : {}),
  })
  return account.id
}

/**
 * A one-time onboarding URL. Stripe expires these quickly, so a fresh link is
 * generated each time the seller starts or resumes onboarding.
 */
export async function createOnboardingLink(
  accountId: string,
  origin: string,
): Promise<string> {
  const stripe = getStripe()
  const link = await stripe.accountLinks.create({
    account: accountId,
    // Stripe sends the seller back here whether they finish or bail; the
    // payouts page re-checks live status on load either way.
    refresh_url: `${origin}/seller/payouts?refresh=1`,
    return_url: `${origin}/seller/payouts?return=1`,
    type: "account_onboarding",
  })
  return link.url
}

export async function getConnectStatus(accountId: string | null): Promise<ConnectStatus> {
  if (!accountId) {
    return { accountId: null, chargesEnabled: false, payoutsEnabled: false, detailsSubmitted: false }
  }

  const stripe = getStripe()
  const account = await stripe.accounts.retrieve(accountId)

  return {
    accountId,
    chargesEnabled: account.charges_enabled,
    payoutsEnabled: account.payouts_enabled,
    detailsSubmitted: account.details_submitted,
  }
}
