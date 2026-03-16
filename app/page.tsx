"use client"

import { useMemo, useState } from "react"
import { vendors, services, invoices } from "@/data/dummy"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import Sidebar from "@/components/sidebar"
import { useRouter } from "next/navigation"

const UNPAID_PER_PAGE = 5

export default function Dashboard() {
  const router = useRouter()
  const activeServices = services.filter(s => s.active).length
  const [unpaidPage, setUnpaidPage] = useState(1)

  const unpaidInvoices = useMemo(() =>
    invoices.filter((inv) => inv.paidAmount === 0),
  [])

  const unpaidTotalPages = Math.max(1, Math.ceil(unpaidInvoices.length / UNPAID_PER_PAGE))
  const paginatedUnpaid = unpaidInvoices.slice(
    (unpaidPage - 1) * UNPAID_PER_PAGE,
    unpaidPage * UNPAID_PER_PAGE
  )

  const getServiceInfo = (serviceId: string) =>
    services.find((s) => s.id === serviceId)

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(value)

  const formatDate = (dateString: string) => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-4 sm:p-6 lg:p-10 w-full lg:ml-0 ml-0 pt-16 lg:pt-4 sm:pt-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Dashboard</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <h3 className="text-sm sm:text-base text-gray-600">Total Vendors</h3>
              <p className="text-2xl sm:text-3xl font-bold mt-2">{vendors.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <h3 className="text-sm sm:text-base text-gray-600">Active Services</h3>
              <p className="text-2xl sm:text-3xl font-bold mt-2">{activeServices}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <h3 className="text-sm sm:text-base text-gray-600">Invoice Belum Bayar</h3>
              <p className="text-2xl sm:text-3xl font-bold mt-2 text-red-600">{unpaidInvoices.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Unpaid Invoices Section */}
        <div className="mt-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
            <h2 className="text-lg sm:text-xl font-semibold">Invoice Belum Bayar</h2>
            <Button variant="outline" size="sm" onClick={() => router.push("/invoices")}>
              Lihat Semua
            </Button>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No. Invoice</TableHead>
                    <TableHead>ID Layanan</TableHead>
                    <TableHead>Jenis</TableHead>
                    <TableHead>Periode</TableHead>
                    <TableHead className="text-right">Nilai Invoice</TableHead>
                    <TableHead>Tgl Invoice</TableHead>
                    <TableHead>Jatuh Tempo</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedUnpaid.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                        Tidak ada invoice belum bayar
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedUnpaid.map((inv) => {
                      const service = getServiceInfo(inv.serviceId)
                      return (
                        <TableRow key={inv.id}>
                          <TableCell className="font-medium">{inv.invoiceNumber}</TableCell>
                          <TableCell>{service?.providerServiceId || "-"}</TableCell>
                          <TableCell>
                            <Badge variant={inv.paymentType === "OTP" ? "outline" : "secondary"}>
                              {inv.paymentType}
                            </Badge>
                          </TableCell>
                          <TableCell>{inv.period || "-"}</TableCell>
                          <TableCell className="text-right">{formatCurrency(inv.invoiceAmount)}</TableCell>
                          <TableCell>{formatDate(inv.invoiceDate)}</TableCell>
                          <TableCell>{formatDate(inv.dueDate)}</TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="outline" onClick={() => router.push(`/invoices/form?id=${inv.id}`)}>
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {unpaidInvoices.length > 0 && (
            <div className="flex flex-col sm:flex-row justify-between sm:justify-end items-center gap-4 mt-4">
              <span className="text-sm order-2 sm:order-1">
                Page {unpaidPage} of {unpaidTotalPages}
              </span>
              <div className="flex gap-2 order-1 sm:order-2">
                <Button variant="outline" disabled={unpaidPage === 1} onClick={() => setUnpaidPage((p) => p - 1)} className="w-20">
                  Prev
                </Button>
                <Button variant="outline" disabled={unpaidPage === unpaidTotalPages} onClick={() => setUnpaidPage((p) => p + 1)} className="w-20">
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}