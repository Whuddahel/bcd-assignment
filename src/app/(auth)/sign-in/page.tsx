import { Suspense } from "react"
import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getSessionUser } from "@/lib/auth/session"
import { ROLE_HOME, useMockAuth } from "@/lib/config"
import { Skeleton } from "@/components/ui/skeleton"
import { SignInForm } from "./sign-in-form"

export const metadata: Metadata = {
  title: "Sign in · Aureon",
  description: "Sign in to your Aureon account.",
}

export default async function SignInPage() {
  // Already signed in? Skip the form. (Not in mock mode — there is always a
  // fake session there, which would make the page unreachable.)
  if (!useMockAuth) {
    const user = await getSessionUser()
    if (user) redirect(ROLE_HOME[user.role] ?? "/account")
  }

  return (
    <Suspense fallback={<Skeleton className="h-[520px] w-full rounded-3xl" />}>
      <SignInForm />
    </Suspense>
  )
}
