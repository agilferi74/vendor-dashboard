"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function getInvoices() {
  return prisma.invoice.findMany({
    where: { isDeleted: false, isCancelled: false },
    include: {
      service: { select: { providerServiceId: true, serviceType: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function getInvoiceById(id: string) {
  return prisma.invoice.findUnique({
    where: { id },
    include: {
      service: { select: { id: true, providerServiceId: true, serviceType: true, mtcCost: true, otpCost: true } },
    },
  })
}

export async function getServicesForInvoice() {
  return prisma.service.findMany({
    where: { isDeleted: false },
    select: { id: true, providerServiceId: true, serviceType: true, mtcCost: true },
    orderBy: { createdAt: "desc" },
  })
}

export async function createMtcInvoice(data: {
  serviceId: string
  invoiceNumber: string
  period: string
  invoiceAmount: number
  paidAmount: number
  invoiceDate: string
  dueDate: string
  paymentDate: string
  invoiceDocumentUrl: string
  paymentProofUrl: string
}) {
  await prisma.invoice.create({
    data: {
      serviceId: data.serviceId,
      paymentType: "MTC",
      invoiceNumber: data.invoiceNumber,
      period: data.period,
      invoiceAmount: data.invoiceAmount,
      paidAmount: data.paidAmount,
      invoiceDate: data.invoiceDate ? new Date(data.invoiceDate) : null,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      paymentDate: data.paymentDate ? new Date(data.paymentDate) : null,
      invoiceDocumentUrl: data.invoiceDocumentUrl,
      paymentProofUrl: data.paymentProofUrl,
    },
  })
  revalidatePath("/invoices")
  redirect("/invoices")
}

export async function updateInvoice(id: string, data: {
  invoiceNumber: string
  paidAmount: number
  invoiceDate: string
  dueDate: string
  paymentDate: string
  invoiceDocumentUrl: string
  paymentProofUrl: string
}) {
  await prisma.invoice.update({
    where: { id },
    data: {
      invoiceNumber: data.invoiceNumber,
      paidAmount: data.paidAmount,
      invoiceDate: data.invoiceDate ? new Date(data.invoiceDate) : null,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      paymentDate: data.paymentDate ? new Date(data.paymentDate) : null,
      invoiceDocumentUrl: data.invoiceDocumentUrl,
      paymentProofUrl: data.paymentProofUrl,
    },
  })
  revalidatePath("/invoices")
  redirect("/invoices")
}

export async function getLatestMtcCost(serviceId: string) {
  // Check latest Upgrade/Downgrade activity
  const latestActivity = await prisma.serviceActivity.findFirst({
    where: {
      serviceId,
      isDeleted: false,
      activityType: { in: ["Upgrade", "Downgrade"] },
    },
    orderBy: { startDate: "desc" },
    select: { mtcCost: true },
  })

  if (latestActivity) return latestActivity.mtcCost

  // Fallback to service mtcCost
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    select: { mtcCost: true },
  })

  return service?.mtcCost || 0
}
