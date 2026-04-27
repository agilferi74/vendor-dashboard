"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table, TableBody, TableCell, TableHeader, TableRow,
} from "@/components/ui/table"
import { useRouter } from "next/navigation"
import { Pagination } from "@/components/ui/pagination"
import { SortableHeader, useSort, sortData } from "@/components/ui/sortable-header"

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
  const { sortConfig, handleSort } = useSort()

  const filtered = useMemo(() => {
    return vendors.filter((v) =>
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.npwp.toLowerCase().includes(search.toLowerCase()) ||
      v.picCommercialName.toLowerCase().includes(search.toLowerCase()) ||
      v.picTechnicalName.toLowerCase().includes(search.toLowerCase()) ||
      v.picCommercialPhone.includes(search) ||
      v.picTechnicalPhone.includes(search)
    )
  }, [vendors, search])

  const sorted = useMemo(() => sortData(filtered, sortConfig, (item, key) => {
    switch (key) {
      case "name": return item.name
      case "address": return item.address
      case "picCommercialName": return item.picCommercialName
      case "picTechnicalName": return item.picTechnicalName
      case "npwp": return item.npwp
      default: return ""
    }
  }), [filtered, sortConfig])

  const totalPages = Math.max(1, Math.ceil(sorted.length / ITEMS_PER_PAGE))
  const paginated = sorted.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">Vendor Management</h1>
        {canWrite && (
          <Button onClick={() => router.push("/vendors/form")} className="w-full sm:w-auto">+ Add Vendor</Button>
        )}
      </div>

      <div className="mb-6">
        <Input placeholder="Search by name, NPWP, or PIC..." value={search}
          onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }} className="w-full sm:max-w-sm" />
      </div>

      <div className="border rounded-lg overflow-x-auto bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableHeader label="Nama Vendor" sortKey="name" sortConfig={sortConfig} onSort={handleSort} className="whitespace-nowrap" />
              <SortableHeader label="Alamat" sortKey="address" sortConfig={sortConfig} onSort={handleSort} className="whitespace-nowrap" />
              <SortableHeader label="PIC Komersial" sortKey="picCommercialName" sortConfig={sortConfig} onSort={handleSort} className="whitespace-nowrap" />
              <SortableHeader label="PIC Teknikal" sortKey="picTechnicalName" sortConfig={sortConfig} onSort={handleSort} className="whitespace-nowrap" />
              <SortableHeader label="NPWP" sortKey="npwp" sortConfig={sortConfig} onSort={handleSort} className="whitespace-nowrap" />
              <th className="whitespace-nowrap p-2 text-sm font-medium text-muted-foreground">Actions</th>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map((vendor) => (
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
                    <Button size="sm" variant="outline" onClick={() => router.push(`/vendors/form?id=${vendor.id}`)}>Edit</Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
    </>
  )
}
