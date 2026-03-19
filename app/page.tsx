import { getDashboardData } from "./dashboard-actions"
import { requireAuth } from "@/lib/auth"
import Sidebar from "@/components/sidebar"
import DashboardClient from "./dashboard-client"

export default async function Dashboard() {
  const user = await requireAuth()
  const data = await getDashboardData()

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role={user.role} />
      <div className="flex-1 p-4 sm:p-6 lg:p-10 w-full lg:ml-0 ml-0 pt-16 lg:pt-4 sm:pt-6">
        <DashboardClient {...data} canEditInvoice={user.role === "HR" || user.role === "Finance"} />
      </div>
    </div>
  )
}
