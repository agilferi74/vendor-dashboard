import { getActivities } from "./actions"
import { requireAuth } from "@/lib/auth"
import Sidebar from "@/components/sidebar"
import { ActivityTable } from "./activity-table"

export default async function ActivitiesPage() {
  const user = await requireAuth()
  const activities = await getActivities()

  const serialized = activities.map((act) => ({
    id: act.id,
    providerServiceId: act.service.providerServiceId,
    serviceType: act.service.serviceType,
    vendorName: act.service.vendor.name,
    activityType: act.activityType,
    startDate: act.startDate.toISOString(),
    internalPic: act.internalPic,
    capacity: act.capacity,
    mtcCost: act.mtcCost,
    documentUrl: act.documentUrl,
    reason: act.reason,
  }))

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role={user.role} />
      <div className="flex-1 p-4 sm:p-6 lg:p-10 w-full overflow-hidden pt-16 lg:pt-4 sm:pt-6">
        <ActivityTable activities={serialized} canWrite={user.role === "HR"} />
      </div>
    </div>
  )
}
