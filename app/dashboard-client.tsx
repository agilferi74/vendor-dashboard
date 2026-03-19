"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { useRouter } from "next/navigation"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts"

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
  const now = new Date()

  const {
    activeServicesCount, totalServicesCount, unpaidCount, overdueCount,
    expiringCount, totalOutstanding, unpaidInvoices, expiringContracts, monthlyExpenses, canEditInvoice,
  } = props

  const unpaidTotalPages = Math.max(1, Math.ceil(unpaidInvoices.length / PER_PAGE))
  const paginatedUnpaid = unpaidInvoices.slice((unpaidPage - 1) * PER_PAGE, unpaidPage * PER_PAGE)

  const expiringTotalPages = Math.max(1, Math.ceil(expiringContracts.length / PER_PAGE))
  const paginatedExpiring = expiringContracts.slice((expiringPage - 1) * PER_PAGE, expiringPage * PER_PAGE)

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
          <Button variant="outline" size="sm" onClick={() => router.push("/invoices")}>Lihat Semua</Button>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No. Invoice</TableHead>
                  <TableHead>Layanan</TableHead>
                  <TableHead>Jenis</TableHead>
                  <TableHead>Periode</TableHead>
                  <TableHead className="text-right">Nilai</TableHead>
                  <TableHead>Jatuh Tempo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
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
          <div className="flex flex-col sm:flex-row justify-between sm:justify-end items-center gap-4 mt-4">
            <span className="text-sm order-2 sm:order-1">Page {unpaidPage} of {unpaidTotalPages}</span>
            <div className="flex gap-2 order-1 sm:order-2">
              <Button variant="outline" disabled={unpaidPage === 1} onClick={() => setUnpaidPage((p) => p - 1)} className="w-20">Prev</Button>
              <Button variant="outline" disabled={unpaidPage === unpaidTotalPages} onClick={() => setUnpaidPage((p) => p + 1)} className="w-20">Next</Button>
            </div>
          </div>
        )}
      </div>

      {/* Expiring Contracts Table */}
      <div className="mt-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
          <h2 className="text-lg sm:text-xl font-semibold">Layanan Akan Berakhir</h2>
          <Button variant="outline" size="sm" onClick={() => router.push("/services")}>Lihat Semua</Button>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID Layanan</TableHead>
                  <TableHead>Jenis Layanan</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Lokasi</TableHead>
                  <TableHead>Tanggal Berakhir</TableHead>
                  <TableHead>Sisa Hari</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
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
                          <Button size="sm" variant="outline" onClick={() => router.push(`/services/${c.serviceId}`)}>Detail</Button>
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
          <div className="flex flex-col sm:flex-row justify-between sm:justify-end items-center gap-4 mt-4">
            <span className="text-sm order-2 sm:order-1">Page {expiringPage} of {expiringTotalPages}</span>
            <div className="flex gap-2 order-1 sm:order-2">
              <Button variant="outline" disabled={expiringPage === 1} onClick={() => setExpiringPage((p) => p - 1)} className="w-20">Prev</Button>
              <Button variant="outline" disabled={expiringPage === expiringTotalPages} onClick={() => setExpiringPage((p) => p + 1)} className="w-20">Next</Button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
