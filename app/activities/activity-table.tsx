"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { FileText } from "lucide-react"

interface ActivityItem {
  id: string
  providerServiceId: string
  serviceType: string
  vendorName: string
  activityType: string
  startDate: string
  internalPic: string
  capacity: string
  mtcCost: number
  documentUrl: string
  reason: string
}

const ITEMS_PER_PAGE = 10

const formatCurrency = (v: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(v)
const formatDate = (s: string) => {
  if (!s) return "-"
  return new Date(s).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
}
const getBadgeVariant = (type: string) => {
  switch (type) {
    case "Aktivasi": return "default"
    case "Upgrade": return "secondary"
    case "Downgrade": return "outline"
    case "Terminate": return "destructive"
    default: return "default"
  }
}

export function ActivityTable({ activities, canWrite }: { activities: ActivityItem[]; canWrite: boolean }) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("ALL")
  const [currentPage, setCurrentPage] = useState(1)

  const filtered = useMemo(() => {
    return activities.filter((act) => {
      const matchSearch =
        act.providerServiceId.toLowerCase().includes(search.toLowerCase()) ||
        act.serviceType.toLowerCase().includes(search.toLowerCase()) ||
        act.internalPic.toLowerCase().includes(search.toLowerCase())
      const matchType = typeFilter === "ALL" || act.activityType === typeFilter
      return matchSearch && matchType
    })
  }, [activities, search, typeFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">Service Activities</h1>
        {canWrite && <Button onClick={() => router.push("/activities/form")} className="w-full sm:w-auto">+ Add Activity</Button>}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Input placeholder="Search by service or PIC..." value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }} className="w-full sm:max-w-sm" />
        <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setCurrentPage(1) }}>
          <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Jenis Aktivitas" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Semua Jenis</SelectItem>
            <SelectItem value="Aktivasi">Aktivasi</SelectItem>
            <SelectItem value="Upgrade">Upgrade</SelectItem>
            <SelectItem value="Downgrade">Downgrade</SelectItem>
            <SelectItem value="Terminate">Terminate</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID Layanan</TableHead><TableHead>Jenis Layanan</TableHead><TableHead>Vendor</TableHead>
                <TableHead>Jenis Aktivitas</TableHead><TableHead>Tanggal Mulai</TableHead><TableHead>PIC Internal</TableHead>
                <TableHead>Kapasitas</TableHead><TableHead className="text-right">Biaya MTC</TableHead><TableHead>Keterangan</TableHead><TableHead>Dokumen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow><TableCell colSpan={10} className="text-center text-gray-500 py-8">Tidak ada data aktivitas</TableCell></TableRow>
              ) : (
                paginated.map((act) => (
                  <TableRow key={act.id}>
                    <TableCell className="font-medium">{act.providerServiceId}</TableCell>
                    <TableCell>{act.serviceType}</TableCell>
                    <TableCell>{act.vendorName}</TableCell>
                    <TableCell><Badge variant={getBadgeVariant(act.activityType) as "default" | "secondary" | "outline" | "destructive"}>{act.activityType}</Badge></TableCell>
                    <TableCell>{formatDate(act.startDate)}</TableCell>
                    <TableCell>{act.internalPic}</TableCell>
                    <TableCell>{act.capacity || "-"}</TableCell>
                    <TableCell className="text-right">{act.activityType === "Terminate" ? "-" : formatCurrency(act.mtcCost)}</TableCell>
                    <TableCell className="text-sm text-gray-600">{act.reason || "-"}</TableCell>
                    <TableCell>
                      {act.documentUrl ? (
                        <a href={act.documentUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800">
                          <FileText className="h-4 w-4" /> View
                        </a>
                      ) : "-"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
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
