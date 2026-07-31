import type { Metadata } from "next"
import { requireUser } from "@/lib/auth/session"
import { getAllProfiles } from "@/lib/data/admin"
import { AdminUsersClient } from "./admin-users-client"

export const metadata: Metadata = { title: "User Management" }

export default async function AdminUsersPage() {
  await requireUser(["admin"])
  const users = await getAllProfiles()
  return <AdminUsersClient users={users} />
}
