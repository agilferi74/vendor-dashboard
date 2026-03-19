"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function getServices() {
  return prisma.service.findMany({
    where: { isDeleted: false },
    include: {
      vendor: true,
      contracts: {
        where: { isDeleted: false },
        orderBy: { endDate: "desc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function getServiceById(id: string) {
  return prisma.service.findUnique({
    where: { id },
    include: {
      vendor: true,
      contracts: { where: { isDeleted: false }, orderBy: { endDate: "desc" } },
      activities: { where: { isDeleted: false }, orderBy: { startDate: "desc" } },
      invoices: { where: { isDeleted: false }, orderBy: { createdAt: "desc" } },
    },
  })
}

export async function getVendorsForSelect() {
  return prisma.vendor.findMany({
    where: { isDeleted: false },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  })
}

export async function createService(data: {
  vendorId: string
  providerServiceId: string
  serviceType: string
  location: string
  capacity: string
  otpCost: number
  mtcCost: number
  unit: string
  internalPic: string
  contractTitle: string
  contractStartDate: string
  contractEndDate: string
  contractDocumentUrl: string
}) {
  const service = await prisma.service.create({
    data: {
      vendorId: data.vendorId,
      providerServiceId: data.providerServiceId,
      serviceType: data.serviceType,
      location: data.location,
      capacity: data.capacity,
      otpCost: data.otpCost,
      mtcCost: data.mtcCost,
      unit: data.unit,
      internalPic: data.internalPic,
    },
  })

  // Create contract
  await prisma.contract.create({
    data: {
      serviceId: service.id,
      title: data.contractTitle,
      startDate: new Date(data.contractStartDate),
      endDate: new Date(data.contractEndDate),
      documentUrl: data.contractDocumentUrl,
    },
  })

  // Auto-create OTP invoice
  await prisma.invoice.create({
    data: {
      serviceId: service.id,
      paymentType: "OTP",
      invoiceNumber: "",
      period: "",
      invoiceAmount: data.otpCost,
      paidAmount: 0,
      invoiceDocumentUrl: "",
      paymentProofUrl: "",
    },
  })

  revalidatePath("/services")
  redirect("/services")
}

export async function updateService(id: string, data: {
  providerServiceId: string
  location: string
  internalPic: string
}) {
  await prisma.service.update({
    where: { id },
    data: {
      providerServiceId: data.providerServiceId,
      location: data.location,
      internalPic: data.internalPic,
    },
  })
  revalidatePath("/services")
  revalidatePath(`/services/${id}`)
  redirect("/services")
}

export async function terminateService(serviceId: string, reason: string, internalPic: string) {
  // Create terminate activity
  await prisma.serviceActivity.create({
    data: {
      serviceId,
      activityType: "Terminate",
      startDate: new Date(),
      internalPic,
      capacity: "",
      mtcCost: 0,
      documentUrl: "",
      reason,
    },
  })

  // Flag all active contracts as terminated
  await prisma.contract.updateMany({
    where: { serviceId, isDeleted: false, isTerminated: false },
    data: { isTerminated: true },
  })

  // Auto-cancel unpaid invoices (paidAmount = 0)
  await prisma.invoice.updateMany({
    where: { serviceId, isDeleted: false, isCancelled: false, paidAmount: 0 },
    data: { isCancelled: true },
  })

  revalidatePath("/services")
  revalidatePath(`/services/${serviceId}`)
  revalidatePath("/invoices")
  revalidatePath("/")
}
