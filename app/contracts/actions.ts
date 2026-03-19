"use server"

import { prisma } from "@/lib/prisma"

export async function getContracts() {
  return prisma.contract.findMany({
    where: { isDeleted: false },
    include: {
      service: {
        select: { providerServiceId: true, serviceType: true },
      },
    },
    orderBy: { endDate: "desc" },
  })
}
