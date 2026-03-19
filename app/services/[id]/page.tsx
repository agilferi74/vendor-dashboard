import Sidebar from "@/components/sidebar"
import { getServiceById } from "../actions"
import { requireAuth } from "@/lib/auth"
import { ServiceDetail } from "./service-detail"
import { notFound } from "next/navigation"

export default async function ServiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth()
  const { id } = await params
  const service = await getServiceById(id)

  if (!service) return notFound()

  const contract = service.contracts[0] || null

  const serialized = {
    id: service.id,
    serviceType: service.serviceType,
    providerServiceId: service.providerServiceId,
    location: service.location,
    capacity: service.capacity,
    otpCost: service.otpCost,
    mtcCost: service.mtcCost,
    unit: service.unit,
    internalPic: service.internalPic,
    vendor: {
      name: service.vendor.name,
      address: service.vendor.address,
      npwp: service.vendor.npwp,
      picCommercialName: service.vendor.picCommercialName,
      picCommercialPhone: service.vendor.picCommercialPhone,
      picTechnicalName: service.vendor.picTechnicalName,
      picTechnicalPhone: service.vendor.picTechnicalPhone,
    },
    contract: contract ? {
      title: contract.title,
      startDate: contract.startDate.toISOString(),
      endDate: contract.endDate.toISOString(),
      documentUrl: contract.documentUrl,
      isTerminated: contract.isTerminated,
    } : null,
    activities: service.activities.map((a) => ({
      id: a.id,
      activityType: a.activityType,
      startDate: a.startDate.toISOString(),
      internalPic: a.internalPic,
      capacity: a.capacity,
      mtcCost: a.mtcCost,
      documentUrl: a.documentUrl,
      reason: a.reason,
    })),
    invoices: service.invoices.map((inv) => ({
      id: inv.id,
      paymentType: inv.paymentType,
      invoiceNumber: inv.invoiceNumber,
      period: inv.period,
      invoiceAmount: inv.invoiceAmount,
      paidAmount: inv.paidAmount,
      invoiceDate: inv.invoiceDate?.toISOString() || "",
      dueDate: inv.dueDate?.toISOString() || "",
      invoiceDocumentUrl: inv.invoiceDocumentUrl,
      isCancelled: inv.isCancelled,
    })),
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role={user.role} />
      <div className="flex-1 p-4 sm:p-6 lg:p-10 w-full overflow-hidden pt-16 lg:pt-4 sm:pt-6">
        <ServiceDetail service={serialized} canWrite={user.role === "HR"} canEditInvoice={user.role === "HR" || user.role === "Finance"} />
      </div>
    </div>
  )
}
