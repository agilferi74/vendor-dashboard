"use client"

import { useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table"
import { FileText } from "lucide-react"
import { Pagination } from "@/components/ui/pagination"
import { SortableHeader, useSort, sortData } from "@/components/ui/sortable-header"

interface ContractItem {
  id: string; title: string; providerServiceId: string; serviceType: string
  startDate: string; endDate: string; documentUrl: string; isTerminated: boolean
}

const ITEMS_PER_PAGE = 10
const formatDate = (s: string) => new Date(s).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })

const getStatus = (c: ContractItem) => {
  if (c.isTerminated) return { label: "Diberhentikan", variant: "destructive" as const }
  const now = new Date()
  if (new Date(c.startDate) > now) return { label: "Belum Aktif", variant: "secondary" as const }
  if (new Date(c.endDate) < now) return { label: "Expired", variant: "outline" as const }
  return { label: "Active", variant: "default" as const }
}

export function ContractTable({ contracts }: { contracts: ContractItem[] }) {
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const { sortConfig, handleSort } = useSort()

  const filtered = useMemo(() => {
    return contracts.filter((c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.serviceType.toLowerCase().includes(search.toLowerCase()) ||
      c.providerServiceId.toLowerCase().includes(search.toLowerCase())
    )
  }, [contracts, search])

  const sorted = useMemo(() => sortData(filtered, sortConfig, (item, key) => {
    switch (key) {
      case "title": return item.title
      case "providerServiceId": return item.providerServiceId
      case "serviceType": return item.serviceType
      case "startDate": return item.startDate
      case "endDate": return item.endDate
      default: return ""
    }
  }), [filtered, sortConfig])

  const totalPages = Math.max(1, Math.ceil(sorted.length / ITEMS_PER_PAGE))
  const paginated = sorted.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">Contract Management</h1>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Input placeholder="Search contract..." value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }} className="w-full sm:max-w-sm" />
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <SortableHeader label="Judul Kontrak" sortKey="title" sortConfig={sortConfig} onSort={handleSort} />
                <SortableHeader label="ID Layanan" sortKey="providerServiceId" sortConfig={sortConfig} onSort={handleSort} />
                <SortableHeader label="Jenis Layanan" sortKey="serviceType" sortConfig={sortConfig} onSort={handleSort} />
                <th className="p-2 text-sm font-medium text-muted-foreground">Status</th>
                <SortableHeader label="Tanggal Mulai" sortKey="startDate" sortConfig={sortConfig} onSort={handleSort} />
                <SortableHeader label="Tanggal Berakhir" sortKey="endDate" sortConfig={sortConfig} onSort={handleSort} />
                <th className="p-2 text-sm font-medium text-muted-foreground">Dokumen</th>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center text-gray-500 py-8">Tidak ada data kontrak</TableCell></TableRow>
              ) : (
                paginated.map((contract) => {
                  const status = getStatus(contract)
                  return (
                    <TableRow key={contract.id}>
                      <TableCell className="font-medium">{contract.title}</TableCell>
                      <TableCell>{contract.providerServiceId}</TableCell>
                      <TableCell>{contract.serviceType}</TableCell>
                      <TableCell><Badge variant={status.variant}>{status.label}</Badge></TableCell>
                      <TableCell>{formatDate(contract.startDate)}</TableCell>
                      <TableCell>{formatDate(contract.endDate)}</TableCell>
                      <TableCell>
                        {contract.documentUrl ? (
                          <a href={contract.documentUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800">
                            <FileText className="h-4 w-4" /> View
                          </a>
                        ) : "-"}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
    </>
  )
}
