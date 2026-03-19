"use server"

import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@supabase/supabase-js"
import type { Role } from "@/app/generated/prisma/client"

// Admin client for user management (uses service_role key)
function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function getUsers() {
  await requireRole(["HR"])
  return prisma.user.findMany({
    where: { isDeleted: false },
    orderBy: { createdAt: "desc" },
  })
}

export async function createUser(data: {
  name: string
  email: string
  password: string
  role: string
}) {
  await requireRole(["HR"])

  const admin = getAdminClient()

  // Create user in Supabase Auth
  const { data: authData, error } = await admin.auth.admin.createUser({
    email: data.email,
    password: data.password,
    email_confirm: true,
  })

  if (error) throw new Error(`Gagal membuat user: ${error.message}`)

  // Create user in our database
  await prisma.user.create({
    data: {
      supabaseUserId: authData.user.id,
      name: data.name,
      email: data.email,
      role: data.role as Role,
    },
  })

  revalidatePath("/users")
  redirect("/users")
}

export async function updateUser(id: string, data: { name: string; role: string }) {
  await requireRole(["HR"])

  await prisma.user.update({
    where: { id },
    data: { name: data.name, role: data.role as Role },
  })

  revalidatePath("/users")
  redirect("/users")
}

export async function deleteUser(id: string) {
  await requireRole(["HR"])

  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) return

  // Soft delete in our DB
  await prisma.user.update({
    where: { id },
    data: { isDeleted: true },
  })

  // Disable in Supabase Auth
  const admin = getAdminClient()
  await admin.auth.admin.updateUserById(user.supabaseUserId, {
    ban_duration: "876600h", // ~100 years
  })

  revalidatePath("/users")
  redirect("/users")
}

export async function getUserById(id: string) {
  await requireRole(["HR"])
  return prisma.user.findUnique({ where: { id } })
}
