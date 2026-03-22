"use client"

import { useState, useMemo } from "react"
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type Column,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  SearchIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  ChevronsUpDownIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

export type NavRow = {
  date: string
  nav: number
  change: number
}

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]

function SortableHeader<T>({
  column,
  label,
  className,
}: {
  column: Column<T, unknown>
  label: string
  className?: string
}) {
  const sorted = column.getIsSorted()
  return (
    <button
      className={cn(
        "flex items-center gap-1 select-none transition-colors cursor-pointer",
        sorted ? "text-primary" : "text-muted-foreground hover:text-foreground",
        className,
      )}
      onClick={column.getToggleSortingHandler()}
    >
      {label}
      {sorted === "asc"  && <ChevronUpIcon className="size-3.5" />}
      {sorted === "desc" && <ChevronDownIcon className="size-3.5" />}
      {!sorted           && <ChevronsUpDownIcon className="size-3.5 opacity-40" />}
    </button>
  )
}

export function NavTable({ data }: { data: NavRow[] }) {
  const [sorting, setSorting]           = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState("")

  const columns = useMemo<ColumnDef<NavRow>[]>(() => [
    {
      accessorKey: "date",
      header: ({ column }) => <SortableHeader column={column} label="Date" />,
      cell: ({ getValue }) => <span className="text-sm">{getValue<string>()}</span>,
    },
    {
      accessorKey: "nav",
      header: ({ column }) => (
        <SortableHeader column={column} label="NAV (₹)" className="ml-auto" />
      ),
      cell: ({ getValue }) => (
        <div className="text-right font-mono font-medium tabular-nums">
          {getValue<number>().toFixed(4)}
        </div>
      ),
    },
    {
      accessorKey: "change",
      header: ({ column }) => (
        <SortableHeader column={column} label="Change" className="ml-auto" />
      ),
      cell: ({ getValue }) => {
        const v = getValue<number>()
        return (
          <div className={cn("text-right tabular-nums font-medium", v >= 0 ? "text-emerald-600" : "text-red-500")}>
            {v >= 0 ? "+" : ""}
            {v.toFixed(2)}
          </div>
        )
      },
    },
  ], [])

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    enableSortingRemoval: true,
    autoResetPageIndex: false,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  })

  const { pageIndex, pageSize } = table.getState().pagination
  const totalFiltered = table.getFilteredRowModel().rows.length
  const pageCount = table.getPageCount()

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center gap-3 p-4 border-b">
        <div className="relative min-w-[200px] max-w-xs flex-1">
          <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            className="pl-8 h-9 bg-background"
            placeholder="Filter by date…"
            value={globalFilter}
            onChange={(e) => { setGlobalFilter(e.target.value); table.setPageIndex(0) }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="bg-muted/50 hover:bg-muted/50 border-b">
                {hg.headers.map((header) => (
                  <TableHead key={header.id} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground py-3">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="py-12 text-center text-sm text-muted-foreground">
                  No NAV records found.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer */}
      {totalFiltered > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3 text-sm text-muted-foreground">
          <span className="shrink-0">
            {totalFiltered} row{totalFiltered !== 1 ? "s" : ""}
          </span>

          <div className="flex items-center gap-4 ml-auto">
            <div className="flex items-center gap-2">
              <span className="shrink-0">Rows per page</span>
              <Select
                value={String(pageSize)}
                onValueChange={(v) => { table.setPageSize(Number(v)); table.setPageIndex(0) }}
              >
                <SelectTrigger className="h-8 w-16">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZE_OPTIONS.map((n) => (
                    <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <span className="shrink-0">Page {pageIndex + 1} of {pageCount}</span>

            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="size-8"
                disabled={!table.getCanPreviousPage()} onClick={() => table.setPageIndex(0)} aria-label="First page">
                <ChevronsLeftIcon className="size-4" />
              </Button>
              <Button variant="outline" size="icon" className="size-8"
                disabled={!table.getCanPreviousPage()} onClick={() => table.previousPage()} aria-label="Previous page">
                <ChevronLeftIcon className="size-4" />
              </Button>
              <Button variant="outline" size="icon" className="size-8"
                disabled={!table.getCanNextPage()} onClick={() => table.nextPage()} aria-label="Next page">
                <ChevronRightIcon className="size-4" />
              </Button>
              <Button variant="outline" size="icon" className="size-8"
                disabled={!table.getCanNextPage()} onClick={() => table.setPageIndex(pageCount - 1)} aria-label="Last page">
                <ChevronsRightIcon className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
