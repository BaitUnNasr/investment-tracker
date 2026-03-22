"use client"

import { useState, useMemo, useTransition } from "react"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  SearchIcon,
  Trash2Icon,
  PencilIcon,
  LockIcon,
  UsersIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  ChevronsUpDownIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { EditClientDialog, type ClientRow } from "./edit-client-dialog"
import { deleteClient } from "@/app/dashboard/clients/actions"

interface Branch { id: string; code: string; name: string }

interface ClientData extends ClientRow {
  branchCode:    string | null
  branchName:    string | null
  account:       { schemeType: string; weeklyAmount: string } | null
  totalInvested: number
}

const SCHEME_COLORS: Record<string, string> = {
  RTD:  "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300",
  DSTD: "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-300",
  LTD:  "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300",
}

const PAGE_SIZE_OPTIONS = [5, 10, 25, 50]

// Stable filter functions — defined outside component to avoid recreation
const statusFilterFn: FilterFn<ClientData> = (row, _, filterValue) => {
  if (filterValue === "all") return true
  return filterValue === "active" ? !!row.original.isActive : !row.original.isActive
}

const branchFilterFn: FilterFn<ClientData> = (row, _, filterValue) => {
  if (filterValue === "all") return true
  return row.original.branchId === filterValue
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

export function ClientsTable({
  data,
  branches,
}: {
  data:     ClientData[]
  branches: Branch[]
}) {
  const [sorting, setSorting]           = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [branchFilter, setBranchFilter] = useState("all")
  const [editingClient, setEditingClient]   = useState<ClientData | null>(null)
  const [clientToDelete, setClientToDelete] = useState<ClientData | null>(null)
  const [isPending, startTransition]    = useTransition()

  const columns = useMemo<ColumnDef<ClientData>[]>(() => [
    {
      accessorKey: "clientCode",
      header: ({ column }) => <SortableHeader column={column} label="Code" />,
      cell: ({ getValue }) => (
        <span className="font-mono text-sm font-medium text-primary">
          {getValue<string>()}
        </span>
      ),
    },
    {
      id: "name",
      accessorFn: (row) => `${row.firstName} ${row.lastName}`,
      header: ({ column }) => <SortableHeader column={column} label="Client" />,
      cell: ({ row }) => (
        <div>
          <div className="font-medium leading-tight">
            {row.original.firstName} {row.original.lastName}
          </div>
          {row.original.email && (
            <div className="text-xs text-muted-foreground">{row.original.email}</div>
          )}
          {!row.original.email && row.original.phone && (
            <div className="text-xs text-muted-foreground">{row.original.phone}</div>
          )}
        </div>
      ),
    },
    {
      id: "branch",
      accessorFn: (row) => row.branchCode ?? "",
      header: ({ column }) => <SortableHeader column={column} label="Branch" />,
      cell: ({ row }) =>
        row.original.branchCode ? (
          <div>
            <div className="font-mono text-sm font-medium">{row.original.branchCode}</div>
            {row.original.branchName && (
              <div className="text-xs text-muted-foreground">{row.original.branchName}</div>
            )}
          </div>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      id: "scheme",
      accessorFn: (row) => row.account?.schemeType ?? "",
      header: ({ column }) => <SortableHeader column={column} label="Scheme" />,
      cell: ({ row }) =>
        row.original.account ? (
          <Badge variant="outline" className={SCHEME_COLORS[row.original.account.schemeType] ?? ""}>
            {row.original.account.schemeType}
          </Badge>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
    },
    {
      id: "weeklyAmount",
      accessorFn: (row) => row.account ? parseFloat(row.account.weeklyAmount) : 0,
      header: ({ column }) => (
        <SortableHeader column={column} label="Weekly (₹)" className="ml-auto" />
      ),
      cell: ({ row }) => (
        <div className="text-right tabular-nums text-sm">
          {row.original.account
            ? parseFloat(row.original.account.weeklyAmount).toLocaleString("en-IN")
            : "—"}
        </div>
      ),
    },
    {
      accessorKey: "totalInvested",
      header: ({ column }) => (
        <SortableHeader column={column} label="Total Invested" className="ml-auto" />
      ),
      cell: ({ getValue }) => (
        <div className="text-right tabular-nums text-sm font-medium">
          ₹{getValue<number>().toLocaleString("en-IN")}
        </div>
      ),
    },
    {
      id: "isActive",
      accessorFn: (row) => row.isActive,
      header: ({ column }) => <SortableHeader column={column} label="Status" />,
      filterFn: statusFilterFn,
      cell: ({ row }) => {
        const active = !!row.original.isActive
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
            {active ? "Active" : "Inactive"}
          </Badge>
        )
      },
    },
    {
      id: "branchId",
      accessorKey: "branchId",
      filterFn: branchFilterFn,
      enableSorting: false,
    },
    {
      id: "actions",
      header: () => <div className="text-right pr-2">Actions</div>,
      enableSorting: false,
      cell: ({ row }) => {
        const locked = row.original.totalInvested > 0
        return (
          <TooltipProvider>
            <div className="flex items-center justify-end gap-1 pr-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground hover:text-foreground"
                    onClick={() => setEditingClient(row.original)}
                  >
                    <PencilIcon className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Edit</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <span tabIndex={locked ? 0 : -1} className="inline-flex">
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "size-8",
                        locked
                          ? "text-muted-foreground/40 cursor-not-allowed pointer-events-none"
                          : "text-muted-foreground hover:text-destructive hover:bg-destructive/10",
                      )}
                      disabled={locked}
                      onClick={() => !locked && setClientToDelete(row.original)}
                    >
                      {locked ? <LockIcon className="size-4" /> : <Trash2Icon className="size-4" />}
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  {locked ? "Cannot delete — client has investments" : "Delete"}
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
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
      columnFilters: [
        { id: "isActive", value: statusFilter },
        { id: "branchId", value: branchFilter },
      ],
      columnVisibility: { branchId: false },
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

  function confirmDelete() {
    if (!clientToDelete) return
    const client = clientToDelete
    setClientToDelete(null)
    startTransition(async () => {
      const result = await deleteClient(client.id)
      if ("error" in result) {
        toast.error(result.error)
      } else {
        toast.success(`Client "${client.firstName} ${client.lastName}" deleted`)
      }
    })
  }

  return (
    <div className="space-y-0">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b">
        <div className="relative min-w-[220px] max-w-xs flex-1">
          <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            className="pl-8 h-9 bg-background"
            placeholder="Filter client name, code…"
            value={globalFilter}
            onChange={(e) => { setGlobalFilter(e.target.value); table.setPageIndex(0) }}
          />
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={branchFilter}
            onValueChange={(v) => { setBranchFilter(v); table.setPageIndex(0) }}
          >
            <SelectTrigger className="h-9 w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Branches</SelectItem>
              {branches.map((b) => (
                <SelectItem key={b.id} value={b.id}>{b.code} — {b.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={statusFilter}
            onValueChange={(v) => { setStatusFilter(v); table.setPageIndex(0) }}
          >
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

      {/* Table — header always visible */}
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
                <TableCell colSpan={columns.length} className="py-20 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <UsersIcon className="size-10 text-muted-foreground/30" />
                    <p className="text-sm font-medium">No clients found</p>
                    <p className="text-xs text-muted-foreground">
                      {globalFilter || statusFilter !== "all" || branchFilter !== "all"
                        ? "Try adjusting your search or filters."
                        : "Click \"Add Client\" to get started."}
                    </p>
                  </div>
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

      {editingClient && (
        <EditClientDialog
          client={editingClient}
          branches={branches}
          open={true}
          onClose={() => setEditingClient(null)}
        />
      )}

      <Dialog
        open={clientToDelete !== null}
        onOpenChange={(open) => { if (!open) setClientToDelete(null) }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Client</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-medium text-foreground">
                {clientToDelete?.firstName} {clientToDelete?.lastName}
              </span>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setClientToDelete(null)}>Cancel</Button>
            <Button variant="destructive" disabled={isPending} onClick={confirmDelete}>
              {isPending ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
