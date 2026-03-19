"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { FileText } from "lucide-react"

interface InvoiceItem {
  id: string; providerServiceId: string; serviceType: string; paymentType: string
  invoiceNumber: string; period: string; invoiceAmount: number; paidAmount: number
  invoiceDate: string; dueDate: string; paymentDate: string
  invoiceDocumentUrl: string; paymentProofUrl: string
}

const ITEMS_PER_PAGE = 10
const formatCurrency = (v: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(v)
const formatDate = (s: string) => {
  if (!s) return "-"
  return new Date(s).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
}

export function InvoiceTable({ invoices, canWrite, canCreate }: { invoices: InvoiceItem[]; canWrite: boolean; canCreate: boolean }) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("ALL")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [currentPage, setCurrentPage] = useState(1)

  const filtered = useMemo(() => {
    return invoices.filter((inv) => {
      const matchSearch =
        inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
        inv.providerServiceId.toLowerCase().includes(search.toLowerCase()) ||
        inv.serviceType.toLowerCase().includes(search.toLowerCase())
      const matchType = typeFilter === "ALL" || inv.paymentType === typeFilter
      const matchStatus =
        statusFilter === "ALL" ||
        (statusFilter === "LUNAS" && inv.paidAmount >= inv.invoiceAmount) ||
        (statusFilter === "SEBAGIAN" && inv.paidAmount > 0 && inv.paidAmount < inv.invoiceAmount) ||
        (statusFilter === "BELUM" && inv.paidAmount === 0)
      return matchSearch && matchType && matchStatus
    })
  }, [invoices, search, typeFilter, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const getStatusBadge = (inv: InvoiceItem) => {
    if (inv.paidAmount >= inv.invoiceAmount) return <Badge variant="default">Lunas</Badge>
    if (inv.paidAmount > 0) return <Badge variant="secondary">Sebagian</Badge>
    return <Badge variant="destructive">Belum Bayar</Badge>
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">Invoice Management</h1>
        {canCreate && <Button onClick={() => router.push("/invoices/form")} className="w-full sm:w-auto">+ Add MTC Invoice</Button>}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Input placeholder="Cari invoice..." value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }} className="w-full sm:max-w-sm" />
        <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setCurrentPage(1) }}>
          <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Jenis Pembayaran" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Semua Jenis</SelectItem>
            <SelectItem value="OTP">OTP</SelectItem>
            <SelectItem value="MTC">MTC</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1) }}>
          <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Status Pembayaran" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Semua Status</SelectItem>
            <SelectItem value="LUNAS">Lunas</SelectItem>
            <SelectItem value="SEBAGIAN">Sebagian</SelectItem>
            <SelectItem value="BELUM">Belum Bayar</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No. Invoice</TableHead><TableHead>ID Layanan</TableHead><TableHead>Jenis</TableHead>
                <TableHead>Periode</TableHead><TableHead className="text-right">Nilai Invoice</TableHead>
                <TableHead className="text-right">Terbayar</TableHead><TableHead>Tgl Invoice</TableHead>
                <TableHead>Jatuh Tempo</TableHead><TableHead>Tgl Bayar</TableHead><TableHead>Status</TableHead>
                <TableHead>Dokumen</TableHead><TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow><TableCell colSpan={12} className="text-center text-gray-500 py-8">Tidak ada data invoice</TableCell></TableRow>
              ) : (
                paginated.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-medium">{inv.invoiceNumber || "-"}</TableCell>
                    <TableCell>{inv.providerServiceId}</TableCell>
                    <TableCell><Badge variant={inv.paymentType === "OTP" ? "outline" : "secondary"}>{inv.paymentType}</Badge></TableCell>
                    <TableCell>{inv.period || "-"}</TableCell>
                    <TableCell className="text-right">{formatCurrency(inv.invoiceAmount)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(inv.paidAmount)}</TableCell>
                    <TableCell>{formatDate(inv.invoiceDate)}</TableCell>
                    <TableCell>{formatDate(inv.dueDate)}</TableCell>
                    <TableCell>{formatDate(inv.paymentDate)}</TableCell>
                    <TableCell>{getStatusBadge(inv)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {inv.invoiceDocumentUrl && (
                          <a href={inv.invoiceDocumentUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800" title="Invoice"><FileText className="h-4 w-4" /></a>
                        )}
                        {inv.paymentProofUrl && (
                          <a href={inv.paymentProofUrl} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-800" title="Bukti Bayar"><FileText className="h-4 w-4" /></a>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {canWrite && <Button size="sm" variant="outline" onClick={() => router.push(`/invoices/form?id=${inv.id}`)}>Edit</Button>}
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
