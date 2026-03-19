import { getServices } from "./actions"
import { requireAuth } from "@/lib/auth"
import Sidebar from "@/components/sidebar"
import { ServiceList } from "./service-list"

export default async function ServicesPage() {
  const user = await requireAuth()
  const services = await getServices()

  const serialized = services.map((s) => ({
    id: s.id,
    vendorName: s.vendor.name,
    providerServiceId: s.providerServiceId,
    serviceType: s.serviceType,
    location: s.location,
    capacity: s.capacity,
    otpCost: s.otpCost,
    mtcCost: s.mtcCost,
    internalPic: s.internalPic,
    contractStartDate: s.contracts[0]?.startDate?.toISOString() || "",
    contractEndDate: s.contracts[0]?.endDate?.toISOString() || "",
    isTerminated: s.contracts[0]?.isTerminated || false,
  }))

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role={user.role} />
      <div className="flex-1 p-4 sm:p-6 lg:p-10 w-full overflow-hidden pt-16 lg:pt-4 sm:pt-6">
        <ServiceList services={serialized} canWrite={user.role === "HR"} />
      </div>
    </div>
  )
}
