import { getUsers } from "./actions"
import { requireRole } from "@/lib/auth"
import Sidebar from "@/components/sidebar"
import { UserTable } from "./user-table"

export default async function UsersPage() {
  const currentUser = await requireRole(["HR"])
  const users = await getUsers()

  const serialized = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    createdAt: u.createdAt.toISOString(),
  }))

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role={currentUser.role} />
      <div className="flex-1 p-4 sm:p-6 lg:p-10 w-full pt-16 lg:pt-4 sm:pt-6">
        <UserTable users={serialized} />
      </div>
    </div>
  )
}
