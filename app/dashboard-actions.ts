"use server"

import { prisma } from "@/lib/prisma"

const EXPIRING_DAYS = 60

export async function getDashboardData() {
  const now = new Date()
  const futureDate = new Date(now)
  futureDate.setDate(futureDate.getDate() + EXPIRING_DAYS)

  // All active services (not deleted, has active non-terminated contract)
  const allServices = await prisma.service.findMany({
    where: { isDeleted: false },
    select: { id: true },
  })

  const activeContracts = await prisma.contract.findMany({
    where: {
      isDeleted: false,
      isTerminated: false,
      startDate: { lte: now },
      endDate: { gte: now },
    },
    select: { serviceId: true },
  })
  const activeServiceIds = new Set(activeContracts.map((c) => c.serviceId))
  const activeServicesCount = activeServiceIds.size
  const totalServicesCount = allServices.length

  // Unpaid invoices — fetch all non-deleted non-cancelled, filter in JS (Prisma can't compare two fields)
  const allInvoices = await prisma.invoice.findMany({
    where: { isDeleted: false, isCancelled: false },
    include: {
      service: { select: { providerServiceId: true, serviceType: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  const unpaidInvoices = allInvoices.filter(
    (inv) => inv.invoiceAmount > 0 && inv.paidAmount < inv.invoiceAmount
  )

  const overdueCount = unpaidInvoices.filter(
    (inv) => inv.dueDate && inv.dueDate < now
  ).length

  const totalOutstanding = unpaidInvoices.reduce(
    (sum, inv) => sum + (inv.invoiceAmount - inv.paidAmount), 0
  )

  // Expiring contracts (ending within EXPIRING_DAYS)
  const expiringContractsRaw = await prisma.contract.findMany({
    where: {
      isDeleted: false,
      isTerminated: false,
      endDate: { gte: now, lte: futureDate },
    },
    include: {
      service: {
        select: {
          id: true,
          providerServiceId: true,
          serviceType: true,
          location: true,
          vendor: { select: { name: true } },
        },
      },
    },
    orderBy: { endDate: "asc" },
  })

  // Monthly expenses (paid invoices grouped by month)
  const paidInvoices = await prisma.invoice.findMany({
    where: {
      isDeleted: false,
      isCancelled: false,
      paidAmount: { gt: 0 },
      paymentDate: { not: null },
    },
    select: { paymentType: true, paidAmount: true, paymentDate: true },
    orderBy: { paymentDate: "asc" },
  })

  // Serialize dates
  const serializedUnpaid = unpaidInvoices
    .sort((a, b) => {
      const aOverdue = a.dueDate && a.dueDate < now ? 0 : 1
      const bOverdue = b.dueDate && b.dueDate < now ? 0 : 1
      if (aOverdue !== bOverdue) return aOverdue - bOverdue
      if (a.dueDate && b.dueDate) return a.dueDate.getTime() - b.dueDate.getTime()
      return 0
    })
    .map((inv) => ({
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      providerServiceId: inv.service.providerServiceId,
      paymentType: inv.paymentType,
      period: inv.period,
      invoiceAmount: inv.invoiceAmount,
      paidAmount: inv.paidAmount,
      dueDate: inv.dueDate?.toISOString() || "",
    }))

  const serializedExpiring = expiringContractsRaw.map((c) => ({
    id: c.id,
    serviceId: c.service.id,
    providerServiceId: c.service.providerServiceId,
    serviceType: c.service.serviceType,
    vendorName: c.service.vendor.name,
    location: c.service.location,
    endDate: c.endDate.toISOString(),
  }))

  // Build monthly expenses
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"]
  const months: Record<string, { month: string; OTP: number; MTC: number }> = {}
  paidInvoices.forEach((inv) => {
    if (inv.paymentDate) {
      const date = inv.paymentDate
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      const label = `${monthNames[date.getMonth()]} ${date.getFullYear()}`
      if (!months[key]) months[key] = { month: label, OTP: 0, MTC: 0 }
      months[key][inv.paymentType] += inv.paidAmount
    }
  })
  const monthlyExpenses = Object.entries(months)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([, data]) => data)

  return {
    activeServicesCount,
    totalServicesCount,
    unpaidCount: unpaidInvoices.length,
    overdueCount,
    expiringCount: expiringContractsRaw.length,
    totalOutstanding,
    unpaidInvoices: serializedUnpaid,
    expiringContracts: serializedExpiring,
    monthlyExpenses,
  }
}
