"use client"

import { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table, TableBody, TableCell, TableHeader, TableRow,
} from "@/components/ui/table"
import { useRouter } from "next/navigation"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts"
import { Pagination } from "@/components/ui/pagination"
import { SortableHeader, useSort, sortData } from "@/components/ui/sortable-header"

const PER_PAGE = 5
const EXPIRING_DAYS = 60

type UnpaidInvoice = {
  id: string
  invoiceNumber: string
  providerServiceId: string
  paymentType: string
  period: string
  invoiceAmount: number
  paidAmount: number
  dueDate: string
}

type ExpiringContract = {
  id: string
  serviceId: string
  providerServiceId: string
  serviceType: string
  vendorName: string
  location: string
  endDate: string
}

type MonthlyExpense = { month: string; OTP: number; MTC: number }

type DashboardProps = {
  activeServicesCount: number
  totalServicesCount: number
  unpaidCount: number
  overdueCount: number
  expiringCount: number
  totalOutstanding: number
  unpaidInvoices: UnpaidInvoice[]
  expiringContracts: ExpiringContract[]
  monthlyExpenses: MonthlyExpense[]
  canEditInvoice: boolean
  canViewInvoices: boolean
  canViewServices: boolean
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(value)

const formatDate = (dateString: string) => {
  if (!dateString) return "-"
  return new Date(dateString).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
}

const formatChartValue = (value: number) => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(0)}jt`
  if (value >= 1000) return `${(value / 1000).toFixed(0)}rb`
  return value.toString()
}

export default function DashboardClient(props: DashboardProps) {
  const router = useRouter()
  const [unpaidPage, setUnpaidPage] = useState(1)
  const [expiringPage, setExpiringPage] = useState(1)
  const { sortConfig: unpaidSort, handleSort: handleUnpaidSort } = useSort()
  const { sortConfig: expiringSort, handleSort: handleExpiringSort } = useSort()
  const now = new Date()

  const {
    activeServicesCount, totalServicesCount, unpaidCount, overdueCount,
    expiringCount, totalOutstanding, unpaidInvoices, expiringContracts, monthlyExpenses, canEditInvoice, canViewInvoices, canViewServices,
  } = props

  const sortedUnpaid = useMemo(() => sortData(unpaidInvoices, unpaidSort, (item, key) => {
    switch (key) {
      case "invoiceNumber": return item.invoiceNumber
      case "providerServiceId": return item.providerServiceId
      case "paymentType": return item.paymentType
      case "period": return item.period
      case "outstanding": return item.invoiceAmount - item.paidAmount
      case "dueDate": return item.dueDate
      default: return ""
    }
  }), [unpaidInvoices, unpaidSort])

  const unpaidTotalPages = Math.max(1, Math.ceil(sortedUnpaid.length / PER_PAGE))
  const paginatedUnpaid = sortedUnpaid.slice((unpaidPage - 1) * PER_PAGE, unpaidPage * PER_PAGE)

  const sortedExpiring = useMemo(() => sortData(expiringContracts, expiringSort, (item, key) => {
    switch (key) {
      case "providerServiceId": return item.providerServiceId
      case "serviceType": return item.serviceType
      case "vendorName": return item.vendorName
      case "location": return item.location
      case "endDate": return item.endDate
      default: return ""
    }
  }), [expiringContracts, expiringSort])

  const expiringTotalPages = Math.max(1, Math.ceil(sortedExpiring.length / PER_PAGE))
  const paginatedExpiring = sortedExpiring.slice((expiringPage - 1) * PER_PAGE, expiringPage * PER_PAGE)

  const getDaysUntil = (dateString: string) =>
    Math.ceil((new Date(dateString).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  return (
    <>
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <h3 className="text-sm text-gray-600">Layanan Aktif</h3>
            <p className="text-2xl sm:text-3xl font-bold mt-2">{activeServicesCount}</p>
            <p className="text-xs text-gray-500 mt-1">dari {totalServicesCount} layanan</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 sm:p-6">
            <h3 className="text-sm text-gray-600">Invoice Belum Bayar</h3>
            <p className="text-2xl sm:text-3xl font-bold mt-2 text-red-600">{unpaidCount}</p>
            <p className="text-xs text-gray-500 mt-1">{overdueCount} sudah jatuh tempo</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 sm:p-6">
            <h3 className="text-sm text-gray-600">Layanan Akan Berakhir</h3>
            <p className="text-2xl sm:text-3xl font-bold mt-2 text-amber-600">{expiringCount}</p>
            <p className="text-xs text-gray-500 mt-1">dalam {EXPIRING_DAYS} hari ke depan</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 sm:p-6">
            <h3 className="text-sm text-gray-600">Total Belum Terbayar</h3>
            <p className="text-xl sm:text-2xl font-bold mt-2 text-red-600">{formatCurrency(totalOutstanding)}</p>
            <p className="text-xs text-gray-500 mt-1">dari {unpaidCount} invoice</p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Expenses Chart */}
      <div className="mt-8">
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Pengeluaran per Bulan</h2>
          <div className="h-72 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyExpenses} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={formatChartValue} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} labelStyle={{ fontWeight: "bold" }} />
                <Legend />
                <Bar dataKey="OTP" name="OTP (One Time)" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="MTC" name="MTC (Bulanan)" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Unpaid Invoices Table */}
      <div className="mt-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
          <h2 className="text-lg sm:text-xl font-semibold">Invoice Belum Bayar</h2>
          {canViewInvoices && <Button variant="outline" size="sm" onClick={() => router.push("/invoices")}>Lihat Semua</Button>}
        </div>
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <SortableHeader label="No. Invoice" sortKey="invoiceNumber" sortConfig={unpaidSort} onSort={handleUnpaidSort} />
                  <SortableHeader label="Layanan" sortKey="providerServiceId" sortConfig={unpaidSort} onSort={handleUnpaidSort} />
                  <SortableHeader label="Jenis" sortKey="paymentType" sortConfig={unpaidSort} onSort={handleUnpaidSort} />
                  <SortableHeader label="Periode" sortKey="period" sortConfig={unpaidSort} onSort={handleUnpaidSort} />
                  <SortableHeader label="Nilai" sortKey="outstanding" sortConfig={unpaidSort} onSort={handleUnpaidSort} className="text-right" />
                  <SortableHeader label="Jatuh Tempo" sortKey="dueDate" sortConfig={unpaidSort} onSort={handleUnpaidSort} />
                  <th className="p-2 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="p-2 text-sm font-medium text-muted-foreground text-right">Actions</th>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedUnpaid.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-gray-500 py-8">Tidak ada invoice belum bayar</TableCell>
                  </TableRow>
                ) : (
                  paginatedUnpaid.map((inv) => {
                    const isOverdue = inv.dueDate && new Date(inv.dueDate) < now
                    return (
                      <TableRow key={inv.id}>
                        <TableCell className="font-medium">{inv.invoiceNumber || "-"}</TableCell>
                        <TableCell>{inv.providerServiceId || "-"}</TableCell>
                        <TableCell>
                          <Badge variant={inv.paymentType === "OTP" ? "outline" : "secondary"}>{inv.paymentType}</Badge>
                        </TableCell>
                        <TableCell>{inv.period || "-"}</TableCell>
                        <TableCell className="text-right">{formatCurrency(inv.invoiceAmount - inv.paidAmount)}</TableCell>
                        <TableCell>{formatDate(inv.dueDate)}</TableCell>
                        <TableCell>
                          {isOverdue ? (
                            <Badge variant="destructive">Overdue</Badge>
                          ) : inv.paidAmount > 0 ? (
                            <Badge variant="secondary">Sebagian</Badge>
                          ) : !inv.invoiceNumber ? (
                            <Badge variant="outline">Belum Terima</Badge>
                          ) : (
                            <Badge variant="destructive">Belum Bayar</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {canEditInvoice && <Button size="sm" variant="outline" onClick={() => router.push(`/invoices/form?id=${inv.id}`)}>Edit</Button>}
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
        {unpaidInvoices.length > PER_PAGE && (
          <Pagination currentPage={unpaidPage} totalPages={unpaidTotalPages} onPageChange={setUnpaidPage} />
        )}
      </div>

      {/* Expiring Contracts Table */}
      <div className="mt-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
          <h2 className="text-lg sm:text-xl font-semibold">Layanan Akan Berakhir</h2>
          {canViewServices && <Button variant="outline" size="sm" onClick={() => router.push("/services")}>Lihat Semua</Button>}
        </div>
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <SortableHeader label="ID Layanan" sortKey="providerServiceId" sortConfig={expiringSort} onSort={handleExpiringSort} />
                  <SortableHeader label="Jenis Layanan" sortKey="serviceType" sortConfig={expiringSort} onSort={handleExpiringSort} />
                  <SortableHeader label="Vendor" sortKey="vendorName" sortConfig={expiringSort} onSort={handleExpiringSort} />
                  <SortableHeader label="Lokasi" sortKey="location" sortConfig={expiringSort} onSort={handleExpiringSort} />
                  <SortableHeader label="Tanggal Berakhir" sortKey="endDate" sortConfig={expiringSort} onSort={handleExpiringSort} />
                  <th className="p-2 text-sm font-medium text-muted-foreground">Sisa Hari</th>
                  <th className="p-2 text-sm font-medium text-muted-foreground text-right">Actions</th>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedExpiring.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-gray-500 py-8">Tidak ada layanan yang akan berakhir dalam {EXPIRING_DAYS} hari</TableCell>
                  </TableRow>
                ) : (
                  paginatedExpiring.map((c) => {
                    const daysLeft = getDaysUntil(c.endDate)
                    return (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium">{c.providerServiceId || "-"}</TableCell>
                        <TableCell>{c.serviceType || "-"}</TableCell>
                        <TableCell>{c.vendorName}</TableCell>
                        <TableCell>{c.location || "-"}</TableCell>
                        <TableCell>{formatDate(c.endDate)}</TableCell>
                        <TableCell>
                          <Badge variant={daysLeft <= 30 ? "destructive" : "secondary"}>{daysLeft} hari</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {canViewServices && <Button size="sm" variant="outline" onClick={() => router.push(`/services/${c.serviceId}`)}>Detail</Button>}
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
        {expiringContracts.length > PER_PAGE && (
          <Pagination currentPage={expiringPage} totalPages={expiringTotalPages} onPageChange={setExpiringPage} />
        )}
      </div>
    </>
  )
}
