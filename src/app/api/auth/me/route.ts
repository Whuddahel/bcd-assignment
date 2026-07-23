import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth/session"

/** Session snapshot for client components. Backs the `useUser()` hook. */
export async function GET() {
  const user = await getSessionUser()
  return NextResponse.json({ user })
}
