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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  SearchIcon,
  EyeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  ChevronsUpDownIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

export type AccountRow = {
  id: string
  accountNo: string
  client: string
  scheme: string
  weeklyAmt: number
  startDate: string
  installments: number
  totalInvested: number
  status: string
}

const SCHEME_COLORS: Record<string, string> = {
  RTD:  "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300",
  DSTD: "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-300",
  LTD:  "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300",
}

const PAGE_SIZE_OPTIONS = [5, 10, 25, 50]

const schemeFilterFn: FilterFn<AccountRow> = (row, _, filterValue) => {
  if (filterValue === "all") return true
  return row.original.scheme === filterValue
}

const statusFilterFn: FilterFn<AccountRow> = (row, _, filterValue) => {
  if (filterValue === "all") return true
  return row.original.status === filterValue
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

export function AccountsTable({ data }: { data: AccountRow[] }) {
  const [sorting, setSorting]           = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState("")
  const [schemeFilter, setSchemeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  const schemes = useMemo(() => [...new Set(data.map((a) => a.scheme))].sort(), [data])

  const columns = useMemo<ColumnDef<AccountRow>[]>(() => [
    {
      accessorKey: "accountNo",
      header: ({ column }) => <SortableHeader column={column} label="Account No." />,
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
      id: "scheme",
      accessorKey: "scheme",
      header: ({ column }) => <SortableHeader column={column} label="Scheme" />,
      filterFn: schemeFilterFn,
      cell: ({ getValue }) => {
        const scheme = getValue<string>()
        return (
          <Badge variant="outline" className={SCHEME_COLORS[scheme] ?? ""}>{scheme}</Badge>
        )
      },
    },
    {
      accessorKey: "weeklyAmt",
      header: ({ column }) => (
        <SortableHeader column={column} label="Weekly (₹)" className="ml-auto" />
      ),
      cell: ({ getValue }) => (
        <div className="text-right tabular-nums text-sm">
          {getValue<number>().toLocaleString("en-IN")}
        </div>
      ),
    },
    {
      accessorKey: "startDate",
      header: ({ column }) => <SortableHeader column={column} label="Start Date" />,
      cell: ({ getValue }) => <span className="text-sm">{getValue<string>()}</span>,
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
      accessorKey: "totalInvested",
      header: ({ column }) => (
        <SortableHeader column={column} label="Total Invested (₹)" className="ml-auto" />
      ),
      cell: ({ getValue }) => (
        <div className="text-right tabular-nums text-sm font-medium">
          {getValue<number>().toLocaleString("en-IN")}
        </div>
      ),
    },
    {
      id: "status",
      accessorKey: "status",
      header: ({ column }) => <SortableHeader column={column} label="Status" />,
      filterFn: statusFilterFn,
      cell: ({ getValue }) => {
        const active = getValue<string>() === "active"
        return (
          <Badge
            variant="outline"
            className={
              active
                ? "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400"
                : "border-border bg-muted text-muted-foreground"
            }
          >
            <span className={`mr-1.5 size-1.5 rounded-full inline-block ${active ? "bg-green-500" : "bg-muted-foreground"}`} />
            {getValue<string>()}
          </Badge>
        )
      },
    },
    {
      id: "actions",
      header: () => null,
      enableSorting: false,
      cell: () => (
        <TooltipProvider>
          <div className="flex justify-end pr-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-foreground">
                  <EyeIcon className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>View account</TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      ),
    },
  ], [])

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
      columnFilters: [
        { id: "scheme", value: schemeFilter },
        { id: "status", value: statusFilter },
      ],
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
            placeholder="Filter account no., client…"
            value={globalFilter}
            onChange={(e) => { setGlobalFilter(e.target.value); table.setPageIndex(0) }}
          />
        </div>

        <div className="flex items-center gap-2">
          <Select value={schemeFilter} onValueChange={(v) => { setSchemeFilter(v); table.setPageIndex(0) }}>
            <SelectTrigger className="h-9 w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Schemes</SelectItem>
              {schemes.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); table.setPageIndex(0) }}>
            <SelectTrigger className="h-9 w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
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
                  No accounts found.
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
