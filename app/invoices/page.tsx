import { getInvoices } from "./actions"
import { requireAuth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Sidebar from "@/components/sidebar"
import { InvoiceTable } from "./invoice-table"

export default async function InvoicesPage() {
  const user = await requireAuth()
  if (user.role === "Operasional") redirect("/")
  const invoices = await getInvoices()

  const serialized = invoices.map((inv) => ({
    id: inv.id,
    providerServiceId: inv.service.providerServiceId,
    serviceType: inv.service.serviceType,
    paymentType: inv.paymentType,
    invoiceNumber: inv.invoiceNumber,
    period: inv.period,
    invoiceAmount: inv.invoiceAmount,
    paidAmount: inv.paidAmount,
    invoiceDate: inv.invoiceDate?.toISOString() || "",
    dueDate: inv.dueDate?.toISOString() || "",
    paymentDate: inv.paymentDate?.toISOString() || "",
    invoiceDocumentUrl: inv.invoiceDocumentUrl,
    paymentProofUrl: inv.paymentProofUrl,
  }))

  // HR: full CRUD, Finance: create + edit payment, Operasional: read only
  const canWrite = user.role === "HR" || user.role === "Finance"

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role={user.role} />
      <div className="flex-1 p-4 sm:p-6 lg:p-10 w-full overflow-hidden pt-16 lg:pt-4 sm:pt-6">
        <InvoiceTable invoices={serialized} canWrite={canWrite} canCreate={canWrite} />
      </div>
    </div>
  )
}
