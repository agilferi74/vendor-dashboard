"use client"

import { useState } from "react"
import { TableHead } from "@/components/ui/table"
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"

export type SortDirection = "asc" | "desc" | null
export type SortConfig = { key: string; direction: SortDirection }

interface SortableHeaderProps {
  label: string
  sortKey: string
  sortConfig: SortConfig
  onSort: (key: string) => void
  className?: string
}

export function SortableHeader({ label, sortKey, sortConfig, onSort, className }: SortableHeaderProps) {
  const isActive = sortConfig.key === sortKey
  return (
    <TableHead className={`cursor-pointer select-none hover:bg-gray-50 ${className || ""}`} onClick={() => onSort(sortKey)}>
      <div className="flex items-center gap-1">
        {label}
        {isActive ? (
          sortConfig.direction === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
        ) : (
          <ArrowUpDown className="h-3 w-3 text-gray-400" />
        )}
      </div>
    </TableHead>
  )
}

export function useSort(defaultKey = "", defaultDir: SortDirection = null) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: defaultKey, direction: defaultDir })

  const handleSort = (key: string) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        if (prev.direction === "asc") return { key, direction: "desc" }
        if (prev.direction === "desc") return { key: "", direction: null }
        return { key, direction: "asc" }
      }
      return { key, direction: "asc" }
    })
  }

  return { sortConfig, setSortConfig, handleSort }
}

export function sortData<T>(data: T[], sortConfig: SortConfig, getValue: (item: T, key: string) => string | number): T[] {
  if (!sortConfig.key || !sortConfig.direction) return data
  return [...data].sort((a, b) => {
    const aVal = getValue(a, sortConfig.key)
    const bVal = getValue(b, sortConfig.key)
    if (typeof aVal === "number" && typeof bVal === "number") {
      return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal
    }
    const aStr = String(aVal).toLowerCase()
    const bStr = String(bVal).toLowerCase()
    if (aStr < bStr) return sortConfig.direction === "asc" ? -1 : 1
    if (aStr > bStr) return sortConfig.direction === "asc" ? 1 : -1
    return 0
  })
}
