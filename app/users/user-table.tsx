"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table"
import { useRouter } from "next/navigation"
import { Pagination } from "@/components/ui/pagination"
import { SortableHeader, useSort, sortData } from "@/components/ui/sortable-header"

interface UserItem {
  id: string; name: string; email: string; role: string; createdAt: string
}

const ITEMS_PER_PAGE = 10

const roleBadge = (role: string) => {
  if (role === "HR") return <Badge variant="default">HR</Badge>
  if (role === "Finance") return <Badge variant="secondary">Finance</Badge>
  return <Badge variant="outline">Operasional</Badge>
}

export function UserTable({ users }: { users: UserItem[] }) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const { sortConfig, handleSort } = useSort()

  const filtered = useMemo(() =>
    users.filter((u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase())
    ), [users, search])

  const sorted = useMemo(() => sortData(filtered, sortConfig, (item, key) => {
    switch (key) {
      case "name": return item.name
      case "email": return item.email
      case "role": return item.role
      default: return ""
    }
  }), [filtered, sortConfig])

  const totalPages = Math.max(1, Math.ceil(sorted.length / ITEMS_PER_PAGE))
  const paginated = sorted.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">User Management</h1>
        <Button onClick={() => router.push("/users/form")} className="w-full sm:w-auto">+ Add User</Button>
      </div>

      <div className="mb-6">
        <Input placeholder="Cari nama, email, atau role..." value={search}
          onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }} className="w-full sm:max-w-sm" />
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <SortableHeader label="Nama" sortKey="name" sortConfig={sortConfig} onSort={handleSort} />
                <SortableHeader label="Email" sortKey="email" sortConfig={sortConfig} onSort={handleSort} />
                <SortableHeader label="Role" sortKey="role" sortConfig={sortConfig} onSort={handleSort} />
                <th className="p-2 text-sm font-medium text-muted-foreground text-right">Actions</th>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center text-gray-500 py-8">Tidak ada data user</TableCell></TableRow>
              ) : (
                paginated.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{roleBadge(u.role)}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" onClick={() => router.push(`/users/form?id=${u.id}`)}>Edit</Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
    </>
  )
}
