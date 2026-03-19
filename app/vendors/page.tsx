import { getVendors } from "./actions"
import { requireAuth } from "@/lib/auth"
import Sidebar from "@/components/sidebar"
import { VendorTable } from "./vendor-table"

export default async function VendorsPage() {
  const user = await requireAuth()
  const vendors = await getVendors()

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role={user.role} />
      <div className="flex-1 p-4 sm:p-6 lg:p-10 w-full pt-16 lg:pt-4 sm:pt-6">
        <VendorTable vendors={vendors} canWrite={user.role === "HR"} />
      </div>
    </div>
  )
}
