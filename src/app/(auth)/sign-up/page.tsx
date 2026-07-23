import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getSessionUser } from "@/lib/auth/session"
import { ROLE_HOME, useMockAuth } from "@/lib/config"
import { SignUpForm } from "./sign-up-form"

export const metadata: Metadata = {
  title: "Create an account · Aureon",
  description: "Join Aureon and start collecting authenticated rare pieces.",
}

export default async function SignUpPage() {
  if (!useMockAuth) {
    const user = await getSessionUser()
    if (user) redirect(ROLE_HOME[user.role] ?? "/account")
  }

  return <SignUpForm />
}
