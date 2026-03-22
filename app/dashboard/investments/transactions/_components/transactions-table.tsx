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
  type FilterFn,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
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

export type TransactionRow = {
  date: string
  transId: string
  type: string
  rcVc: string
  account: string
  client: string
  amount: number
  direction: string
  installment: number
}

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]

const directionFilterFn: FilterFn<TransactionRow> = (row, _, filterValue) => {
  if (filterValue === "all") return true
  return row.original.direction === filterValue
}

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

export function TransactionsTable({ data }: { data: TransactionRow[] }) {
  const [sorting, setSorting]           = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState("")
  const [directionFilter, setDirectionFilter] = useState("all")

  const columns = useMemo<ColumnDef<TransactionRow>[]>(() => [
    {
      accessorKey: "date",
      header: ({ column }) => <SortableHeader column={column} label="Date" />,
      cell: ({ getValue }) => <span className="text-sm">{getValue<string>()}</span>,
    },
    {
      accessorKey: "transId",
      header: ({ column }) => <SortableHeader column={column} label="Trans ID" />,
      cell: ({ getValue }) => (
        <span className="font-mono text-sm">{getValue<string>()}</span>
      ),
    },
    {
      accessorKey: "type",
      header: ({ column }) => <SortableHeader column={column} label="Type" />,
      cell: ({ getValue }) => (
        <Badge variant="outline">{getValue<string>()}</Badge>
      ),
    },
    {
      accessorKey: "account",
      header: ({ column }) => <SortableHeader column={column} label="Account" />,
      cell: ({ getValue }) => (
        <span className="font-mono text-sm font-medium">{getValue<string>()}</span>
      ),
    },
    {
      accessorKey: "client",
      header: ({ column }) => <SortableHeader column={column} label="Client" />,
      cell: ({ getValue }) => (
        <span className="text-sm">{getValue<string>()}</span>
      ),
    },
    {
      accessorKey: "installment",
      header: ({ column }) => (
        <SortableHeader column={column} label="Installment #" className="ml-auto" />
      ),
      cell: ({ getValue }) => (
        <div className="text-right tabular-nums text-sm">{getValue<number>()}</div>
      ),
    },
    {
      accessorKey: "amount",
      header: ({ column }) => (
        <SortableHeader column={column} label="Amount (₹)" className="ml-auto" />
      ),
      cell: ({ getValue }) => (
        <div className="text-right font-medium tabular-nums">
          {getValue<number>().toLocaleString("en-IN")}
        </div>
      ),
    },
    {
      id: "direction",
      accessorKey: "direction",
      header: ({ column }) => <SortableHeader column={column} label="Direction" />,
      filterFn: directionFilterFn,
      cell: ({ getValue }) => {
        const credit = getValue<string>() === "credit"
        return (
          <Badge
            variant="outline"
            className={
              credit
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-red-200 bg-red-50 text-red-700"
            }
          >
            <span className={`mr-1.5 size-1.5 rounded-full inline-block ${credit ? "bg-emerald-500" : "bg-red-500"}`} />
            {getValue<string>()}
          </Badge>
        )
      },
    },
  ], [])

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
      columnFilters: [{ id: "direction", value: directionFilter }],
    },
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
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b">
        <div className="relative min-w-[220px] max-w-xs flex-1">
          <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            className="pl-8 h-9 bg-background"
            placeholder="Filter by account, client, trans ID…"
            value={globalFilter}
            onChange={(e) => { setGlobalFilter(e.target.value); table.setPageIndex(0) }}
          />
        </div>

        <Select value={directionFilter} onValueChange={(v) => { setDirectionFilter(v); table.setPageIndex(0) }}>
          <SelectTrigger className="h-9 w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="credit">Credit</SelectItem>
            <SelectItem value="debit">Debit</SelectItem>
          </SelectContent>
        </Select>
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
                <TableCell colSpan={columns.length} className="py-16 text-center text-sm text-muted-foreground">
                  No transactions found.
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
