"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { useRouter } from "next/navigation"

interface Vendor {
  id: string
  name: string
  address: string
  picCommercialName: string
  picCommercialPhone: string
  picTechnicalName: string
  picTechnicalPhone: string
  npwp: string
}

const ITEMS_PER_PAGE = 5

export function VendorTable({ vendors, canWrite }: { vendors: Vendor[]; canWrite: boolean }) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  const filteredVendors = useMemo(() => {
    return vendors.filter((v) =>
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.npwp.toLowerCase().includes(search.toLowerCase()) ||
      v.picCommercialName.toLowerCase().includes(search.toLowerCase()) ||
      v.picTechnicalName.toLowerCase().includes(search.toLowerCase()) ||
      v.picCommercialPhone.includes(search) ||
      v.picTechnicalPhone.includes(search)
    )
  }, [vendors, search])

  const totalPages = Math.ceil(filteredVendors.length / ITEMS_PER_PAGE)
  const paginatedVendors = filteredVendors.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">Vendor Management</h1>
        {canWrite && (
          <Button onClick={() => router.push("/vendors/form")} className="w-full sm:w-auto">
            + Add Vendor
          </Button>
        )}
      </div>

      <div className="mb-6">
        <Input
          placeholder="Search by name, NPWP, or PIC..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
          className="w-full sm:max-w-sm"
        />
      </div>

      <div className="border rounded-lg overflow-x-auto bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="whitespace-nowrap">Nama Vendor</TableHead>
              <TableHead className="whitespace-nowrap">Alamat</TableHead>
              <TableHead className="whitespace-nowrap">PIC Komersial</TableHead>
              <TableHead className="whitespace-nowrap">PIC Teknikal</TableHead>
              <TableHead className="whitespace-nowrap">NPWP</TableHead>
              <TableHead className="whitespace-nowrap">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedVendors.map((vendor) => (
              <TableRow key={vendor.id}>
                <TableCell className="font-medium whitespace-nowrap">{vendor.name}</TableCell>
                <TableCell className="max-w-xs truncate">{vendor.address}</TableCell>
                <TableCell>
                  <div className="text-sm whitespace-nowrap">
                    <div className="font-medium">{vendor.picCommercialName}</div>
                    <div className="text-muted-foreground">{vendor.picCommercialPhone}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm whitespace-nowrap">
                    <div className="font-medium">{vendor.picTechnicalName}</div>
                    <div className="text-muted-foreground">{vendor.picTechnicalPhone}</div>
                  </div>
                </TableCell>
                <TableCell className="whitespace-nowrap">{vendor.npwp}</TableCell>
                <TableCell className="whitespace-nowrap">
                  {canWrite && (
                    <Button size="sm" variant="outline" onClick={() => router.push(`/vendors/form?id=${vendor.id}`)}>
                      Edit
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
