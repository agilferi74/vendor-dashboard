"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileText } from "lucide-react"

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

  const filtered = useMemo(() => {
    return contracts.filter((c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.serviceType.toLowerCase().includes(search.toLowerCase()) ||
      c.providerServiceId.toLowerCase().includes(search.toLowerCase())
    )
  }, [contracts, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

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
                <TableHead>Judul Kontrak</TableHead><TableHead>ID Layanan</TableHead><TableHead>Jenis Layanan</TableHead>
                <TableHead>Status</TableHead><TableHead>Tanggal Mulai</TableHead><TableHead>Tanggal Berakhir</TableHead><TableHead>Dokumen</TableHead>
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
