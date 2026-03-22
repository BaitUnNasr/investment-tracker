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

export type ClientReportRow = {
  code: string
  name: string
  installments: number
  total: number
  tef: number
  tgf: number
  property: number
}

const PAGE_SIZE_OPTIONS = [5, 10, 25, 50]

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

export function ClientReportTable({ data }: { data: ClientReportRow[] }) {
  const [sorting, setSorting]           = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState("")

  const columns = useMemo<ColumnDef<ClientReportRow>[]>(() => [
    {
      accessorKey: "code",
      header: ({ column }) => <SortableHeader column={column} label="Code" />,
      cell: ({ getValue }) => (
        <span className="font-mono text-sm font-medium">{getValue<string>()}</span>
      ),
    },
    {
      accessorKey: "name",
      header: ({ column }) => <SortableHeader column={column} label="Client" />,
      cell: ({ getValue }) => (
        <span className="text-sm">{getValue<string>()}</span>
      ),
    },
    {
      accessorKey: "installments",
      header: ({ column }) => (
        <SortableHeader column={column} label="Installments" className="ml-auto" />
      ),
      cell: ({ getValue }) => (
        <div className="text-right tabular-nums text-sm">{getValue<number>()}</div>
      ),
    },
    {
      accessorKey: "total",
      header: ({ column }) => (
        <SortableHeader column={column} label="Total Invested" className="ml-auto" />
      ),
      cell: ({ getValue }) => (
        <div className="text-right font-semibold tabular-nums">
          ₹{getValue<number>().toLocaleString("en-IN")}
        </div>
      ),
    },
    {
      accessorKey: "tef",
      header: ({ column }) => (
        <SortableHeader column={column} label="TEF (35%)" className="ml-auto text-blue-600" />
      ),
      cell: ({ getValue }) => (
        <div className="text-right text-blue-600 tabular-nums">
          ₹{getValue<number>().toLocaleString("en-IN")}
        </div>
      ),
    },
    {
      accessorKey: "tgf",
      header: ({ column }) => (
        <SortableHeader column={column} label="TGF (30%)" className="ml-auto text-amber-600" />
      ),
      cell: ({ getValue }) => (
        <div className="text-right text-amber-600 tabular-nums">
          ₹{getValue<number>().toLocaleString("en-IN")}
        </div>
      ),
    },
    {
      accessorKey: "property",
      header: ({ column }) => (
        <SortableHeader column={column} label="Property (35%)" className="ml-auto text-emerald-600" />
      ),
      cell: ({ getValue }) => (
        <div className="text-right text-emerald-600 tabular-nums">
          ₹{getValue<number>().toLocaleString("en-IN")}
        </div>
      ),
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

  // Grand total computed from filtered rows only — updates as search changes
  const filteredTotal = useMemo(() => table.getFilteredRowModel().rows.reduce(
    (acc, row) => ({
      total:    acc.total    + row.original.total,
      tef:      acc.tef      + row.original.tef,
      tgf:      acc.tgf      + row.original.tgf,
      property: acc.property + row.original.property,
    }),
    { total: 0, tef: 0, tgf: 0, property: 0 },
  ), [table.getFilteredRowModel().rows]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center gap-3 p-4 border-b">
        <div className="relative min-w-[220px] max-w-xs flex-1">
          <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            className="pl-8 h-9 bg-background"
            placeholder="Filter by code or client name…"
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
                <TableCell colSpan={columns.length} className="py-16 text-center text-sm text-muted-foreground">
                  No clients found.
                </TableCell>
              </TableRow>
            ) : (
              <>
                {table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} className="border-b hover:bg-muted/30 transition-colors">
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
                {/* Grand total — always visible, reflects filtered data */}
                <TableRow className="border-t-2 bg-muted/30 font-bold hover:bg-muted/40">
                  <TableCell colSpan={3} className="text-right text-muted-foreground text-sm py-3">
                    {globalFilter ? "Filtered Total" : "Grand Total"}
                  </TableCell>
                  <TableCell className="text-right tabular-nums py-3">
                    ₹{filteredTotal.total.toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell className="text-right text-blue-600 tabular-nums py-3">
                    ₹{filteredTotal.tef.toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell className="text-right text-amber-600 tabular-nums py-3">
                    ₹{filteredTotal.tgf.toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell className="text-right text-emerald-600 tabular-nums py-3">
                    ₹{filteredTotal.property.toLocaleString("en-IN")}
                  </TableCell>
                </TableRow>
              </>
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
