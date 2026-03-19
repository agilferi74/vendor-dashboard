"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { ActivityType } from "@/app/generated/prisma/client"

export async function getActivities() {
  return prisma.serviceActivity.findMany({
    where: { isDeleted: false },
    include: {
      service: {
        include: { vendor: true },
      },
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function getServicesForSelect() {
  return prisma.service.findMany({
    where: { isDeleted: false },
    select: { id: true, providerServiceId: true, serviceType: true },
    orderBy: { createdAt: "desc" },
  })
}

export async function createActivity(data: {
  serviceId: string
  activityType: string
  startDate: string
  internalPic: string
  capacity: string
  mtcCost: number
  documentUrl: string
  reason: string
}) {
  await prisma.serviceActivity.create({
    data: {
      serviceId: data.serviceId,
      activityType: data.activityType as ActivityType,
      startDate: new Date(data.startDate),
      internalPic: data.internalPic,
      capacity: data.activityType === "Terminate" ? "" : data.capacity,
      mtcCost: data.activityType === "Terminate" ? 0 : data.mtcCost,
      documentUrl: data.documentUrl,
      reason: data.reason,
    },
  })

  // If terminate, flag contracts as terminated and cancel unpaid invoices
  if (data.activityType === "Terminate") {
    await prisma.contract.updateMany({
      where: { serviceId: data.serviceId, isDeleted: false, isTerminated: false },
      data: { isTerminated: true },
    })

    await prisma.invoice.updateMany({
      where: { serviceId: data.serviceId, isDeleted: false, isCancelled: false, paidAmount: 0 },
      data: { isCancelled: true },
    })
  }

  revalidatePath("/activities")
  revalidatePath(`/services/${data.serviceId}`)
  revalidatePath("/invoices")
  revalidatePath("/")
  redirect("/activities")
}
