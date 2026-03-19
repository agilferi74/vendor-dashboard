import { createSupabaseServer } from "./supabase-server"
import { prisma } from "./prisma"
import { redirect } from "next/navigation"
import type { Role } from "@/app/generated/prisma/client"

export type UserSession = {
  id: string
  name: string
  email: string
  role: Role
}

export async function getCurrentUser(): Promise<UserSession | null> {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const dbUser = await prisma.user.findUnique({
    where: { supabaseUserId: user.id, isDeleted: false },
    select: { id: true, name: true, email: true, role: true },
  })

  return dbUser
}

export async function requireAuth(): Promise<UserSession> {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  return user
}

export async function requireRole(allowedRoles: Role[]): Promise<UserSession> {
  const user = await requireAuth()
  if (!allowedRoles.includes(user.role)) redirect("/")
  return user
}

// Permission helpers
export function canWrite(module: string, role: Role): boolean {
  const permissions: Record<string, Role[]> = {
    vendor: ["HR"],
    service: ["HR"],
    activity: ["HR"],
    contract: [],
    invoice: ["HR", "Finance"],
    user: ["HR"],
  }
  return permissions[module]?.includes(role) || false
}
