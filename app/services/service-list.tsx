"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { useRouter } from "next/navigation"

interface ServiceItem {
  id: string
  vendorName: string
  providerServiceId: string
  serviceType: string
  location: string
  capacity: string
  otpCost: number
  mtcCost: number
  internalPic: string
  contractStartDate: string
  contractEndDate: string
  isTerminated: boolean
}

const ITEMS_PER_PAGE = 5

const isActive = (s: ServiceItem) => {
  if (s.isTerminated) return false
  if (!s.contractStartDate || !s.contractEndDate) return false
  const now = new Date()
  return new Date(s.contractStartDate) <= now && now <= new Date(s.contractEndDate)
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(value)

const formatDate = (dateString: string) => {
  if (!dateString) return "-"
  return new Date(dateString).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
}

export function ServiceList({ services, canWrite }: { services: ServiceItem[]; canWrite: boolean }) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL")
  const [currentPage, setCurrentPage] = useState(1)

  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      const matchSearch =
        s.serviceType.toLowerCase().includes(search.toLowerCase()) ||
        s.providerServiceId.toLowerCase().includes(search.toLowerCase()) ||
        s.location.toLowerCase().includes(search.toLowerCase())
      const active = isActive(s)
      const matchStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && active) ||
        (statusFilter === "INACTIVE" && !active)
      return matchSearch && matchStatus
    })
  }, [services, search, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filteredServices.length / ITEMS_PER_PAGE))
  const paginatedServices = filteredServices.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">Service Management</h1>
        {canWrite && <Button onClick={() => router.push("/services/form")} className="w-full sm:w-auto">+ Add Service</Button>}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Input placeholder="Search service..." value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }} className="w-full sm:max-w-sm" />
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v as "ALL" | "ACTIVE" | "INACTIVE"); setCurrentPage(1) }}>
          <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Filter Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="INACTIVE">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-4 mb-6">
        {paginatedServices.map((service) => {
          const active = isActive(service)
          return (
            <div key={service.id} className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{service.serviceType}</h3>
                      <Badge variant={active ? "default" : "destructive"}>{active ? "ACTIVE" : "INACTIVE"}</Badge>
                    </div>
                    <p className="text-sm text-gray-600">{service.vendorName} • {service.providerServiceId}</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                    <div><p className="text-xs text-gray-500 mb-1">Location</p><p className="text-sm font-medium text-gray-900">{service.location}</p></div>
                    <div><p className="text-xs text-gray-500 mb-1">Capacity</p><p className="text-sm font-medium text-gray-900">{service.capacity}</p></div>
                    <div><p className="text-xs text-gray-500 mb-1">PIC Internal</p><p className="text-sm font-medium text-gray-900">{service.internalPic}</p></div>
                  </div>
                </div>
                <div className="lg:w-80 space-y-3 lg:border-l lg:pl-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div><p className="text-xs text-gray-500 mb-1">OTP Cost</p><p className="text-sm font-semibold text-gray-900">{formatCurrency(service.otpCost)}</p></div>
                    <div><p className="text-xs text-gray-500 mb-1">Monthly Cost</p><p className="text-sm font-semibold text-gray-900">{formatCurrency(service.mtcCost)}</p></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                    <div><p className="text-xs text-gray-500 mb-1">Contract Start</p><p className="text-sm font-medium text-gray-900">{formatDate(service.contractStartDate)}</p></div>
                    <div><p className="text-xs text-gray-500 mb-1">Contract End</p><p className="text-sm font-medium text-gray-900">{formatDate(service.contractEndDate)}</p></div>
                  </div>
                  <div className="pt-2">
                    <Button size="sm" variant="outline" className="w-full" onClick={() => router.push(`/services/${service.id}`)}>View Detail</Button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex flex-col sm:flex-row justify-between sm:justify-end items-center gap-4 mt-6">
        <span className="text-sm order-2 sm:order-1">Page {currentPage} of {totalPages}</span>
        <div className="flex gap-2 order-1 sm:order-2">
          <Button variant="outline" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)} className="w-20">Prev</Button>
          <Button variant="outline" disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)} className="w-20">Next</Button>
        </div>
      </div>
    </>
  )
}
