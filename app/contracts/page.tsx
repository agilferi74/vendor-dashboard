import { getContracts } from "./actions"
import { requireAuth } from "@/lib/auth"
import Sidebar from "@/components/sidebar"
import { ContractTable } from "./contract-table"

export default async function ContractsPage() {
  const user = await requireAuth()
  const contracts = await getContracts()

  const serialized = contracts.map((c) => ({
    id: c.id,
    title: c.title,
    providerServiceId: c.service.providerServiceId,
    serviceType: c.service.serviceType,
    startDate: c.startDate.toISOString(),
    endDate: c.endDate.toISOString(),
    documentUrl: c.documentUrl,
    isTerminated: c.isTerminated,
  }))

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role={user.role} />
      <div className="flex-1 p-4 sm:p-6 lg:p-10 w-full overflow-hidden pt-16 lg:pt-4 sm:pt-6">
        <ContractTable contracts={serialized} />
      </div>
    </div>
  )
}
