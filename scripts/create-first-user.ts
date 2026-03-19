// Run: npx tsx scripts/create-first-user.ts
// Creates the first HR (superadmin) user

import "dotenv/config"
import { createClient } from "@supabase/supabase-js"
import { Pool } from "pg"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../app/generated/prisma/client"

const EMAIL = "admin@gmail.com"  // Ganti dengan email HR
const PASSWORD = "P4ssword!"         // Ganti dengan password yang aman
const NAME = "Admin"             // Ganti dengan nama

async function main() {
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // Create in Supabase Auth
  const { data, error } = await admin.auth.admin.createUser({
    email: EMAIL,
    password: PASSWORD,
    email_confirm: true,
  })

  if (error) {
    console.error("Error creating auth user:", error.message)
    process.exit(1)
  }

  console.log("Supabase Auth user created:", data.user.id)

  // Create in database
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({ adapter })

  await prisma.user.create({
    data: {
      supabaseUserId: data.user.id,
      name: NAME,
      email: EMAIL,
      role: "HR",
    },
  })

  console.log("Database user created successfully!")
  console.log(`\nLogin with:\n  Email: ${EMAIL}\n  Password: ${PASSWORD}`)

  await pool.end()
  process.exit(0)
}

main()
