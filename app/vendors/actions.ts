"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function getVendors() {
  return prisma.vendor.findMany({
    where: { isDeleted: false },
    orderBy: { createdAt: "desc" },
  })
}

export async function getVendorById(id: string) {
  return prisma.vendor.findUnique({ where: { id } })
}

export async function createVendor(formData: FormData) {
  await prisma.vendor.create({
    data: {
      name: formData.get("name") as string,
      address: formData.get("address") as string,
      picCommercialName: formData.get("picCommercialName") as string,
      picCommercialPhone: formData.get("picCommercialPhone") as string,
      picTechnicalName: formData.get("picTechnicalName") as string,
      picTechnicalPhone: formData.get("picTechnicalPhone") as string,
      npwp: formData.get("npwp") as string,
    },
  })
  revalidatePath("/vendors")
  redirect("/vendors")
}

export async function updateVendor(id: string, formData: FormData) {
  await prisma.vendor.update({
    where: { id },
    data: {
      name: formData.get("name") as string,
      address: formData.get("address") as string,
      picCommercialName: formData.get("picCommercialName") as string,
      picCommercialPhone: formData.get("picCommercialPhone") as string,
      picTechnicalName: formData.get("picTechnicalName") as string,
      picTechnicalPhone: formData.get("picTechnicalPhone") as string,
      npwp: formData.get("npwp") as string,
    },
  })
  revalidatePath("/vendors")
  redirect("/vendors")
}

export async function deleteVendor(id: string) {
  await prisma.vendor.update({
    where: { id },
    data: { isDeleted: true },
  })
  revalidatePath("/vendors")
  redirect("/vendors")
}
