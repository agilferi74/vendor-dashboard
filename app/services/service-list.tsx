"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { Pagination } from "@/components/ui/pagination"
import { useSort, sortData } from "@/components/ui/sortable-header"

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

type ServiceStatus = "ACTIVE" | "BELUM_AKTIF" | "EXPIRED" | "DIBERHENTIKAN"

const getServiceStatus = (s: ServiceItem): ServiceStatus => {
  if (s.isTerminated) return "DIBERHENTIKAN"
  if (!s.contractStartDate || !s.contractEndDate) return "BELUM_AKTIF"
  const now = new Date()
  if (new Date(s.contractStartDate) > now) return "BELUM_AKTIF"
  if (new Date(s.contractEndDate) < now) return "EXPIRED"
  return "ACTIVE"
}

const statusConfig: Record<ServiceStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  ACTIVE: { label: "Active", variant: "default" },
  BELUM_AKTIF: { label: "Belum Aktif", variant: "secondary" },
  EXPIRED: { label: "Expired", variant: "outline" },
  DIBERHENTIKAN: { label: "Diberhentikan", variant: "destructive" },
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
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [currentPage, setCurrentPage] = useState(1)
  const { sortConfig, setSortConfig } = useSort()

  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      const q = search.toLowerCase()
      const matchSearch =
        s.serviceType.toLowerCase().includes(q) ||
        s.providerServiceId.toLowerCase().includes(q) ||
        s.location.toLowerCase().includes(q) ||
        s.vendorName.toLowerCase().includes(q) ||
        s.capacity.toLowerCase().includes(q) ||
        s.internalPic.toLowerCase().includes(q)
      const status = getServiceStatus(s)
      const matchStatus = statusFilter === "ALL" || status === statusFilter
      return matchSearch && matchStatus
    })
  }, [services, search, statusFilter])

  const sortedServices = useMemo(() => sortData(filteredServices, sortConfig, (item, key) => {
    switch (key) {
      case "serviceType": return item.serviceType
      case "vendorName": return item.vendorName
      case "location": return item.location
      case "otpCost": return item.otpCost
      case "mtcCost": return item.mtcCost
      case "contractEndDate": return item.contractEndDate
      default: return ""
    }
  }), [filteredServices, sortConfig])

  const totalPages = Math.max(1, Math.ceil(sortedServices.length / ITEMS_PER_PAGE))
  const paginatedServices = sortedServices.slice(
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
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1) }}>
          <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Filter Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Semua Status</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="BELUM_AKTIF">Belum Aktif</SelectItem>
            <SelectItem value="EXPIRED">Expired</SelectItem>
            <SelectItem value="DIBERHENTIKAN">Diberhentikan</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortConfig.key ? `${sortConfig.key}-${sortConfig.direction}` : "default"} onValueChange={(v) => {
          if (v === "default") { setSortConfig({ key: "", direction: null }) } else {
            const parts = v.split("-")
            const dir = parts.pop() as "asc" | "desc"
            const key = parts.join("-")
            setSortConfig({ key, direction: dir })
          }
        }}>
          <SelectTrigger className="w-full sm:w-[200px]"><SelectValue placeholder="Urutkan" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Default</SelectItem>
            <SelectItem value="serviceType-asc">Nama A-Z</SelectItem>
            <SelectItem value="serviceType-desc">Nama Z-A</SelectItem>
            <SelectItem value="vendorName-asc">Vendor A-Z</SelectItem>
            <SelectItem value="vendorName-desc">Vendor Z-A</SelectItem>
            <SelectItem value="mtcCost-asc">Biaya MTC Terendah</SelectItem>
            <SelectItem value="mtcCost-desc">Biaya MTC Tertinggi</SelectItem>
            <SelectItem value="contractEndDate-asc">Kontrak Berakhir Terdekat</SelectItem>
            <SelectItem value="contractEndDate-desc">Kontrak Berakhir Terjauh</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-4 mb-6">
        {paginatedServices.map((service) => {
          const status = getServiceStatus(service)
          const cfg = statusConfig[status]
          return (
            <div key={service.id} className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{service.serviceType}</h3>
                      <Badge variant={cfg.variant}>{cfg.label}</Badge>
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

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
    </>
  )
}
