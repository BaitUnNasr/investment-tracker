"use client"

import { useState, useMemo, useTransition } from "react"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  SearchIcon,
  CheckCircle2Icon,
  XCircleIcon,
  Trash2Icon,
  PencilIcon,
  MoreHorizontalIcon,
  UsersIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"
import { toast } from "sonner"
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
  RTD:  "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  DSTD: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  LTD:  "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
}

const PAGE_SIZE_OPTIONS = [5, 10, 25, 50]

export function ClientsTable({
  data,
  branches,
}: {
  data:     ClientData[]
  branches: Branch[]
}) {
  const [search, setSearch]               = useState("")
  const [statusFilter, setStatusFilter]   = useState<"all" | "active" | "inactive">("all")
  const [branchFilter, setBranchFilter]   = useState<string>("all")
  const [pageSize, setPageSize]           = useState(5)
  const [page, setPage]                   = useState(1)
  const [editingClient, setEditingClient] = useState<ClientData | null>(null)
  const [clientToDelete, setClientToDelete] = useState<ClientData | null>(null)
  const [isPending, startTransition]      = useTransition()

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return data.filter((c) => {
      const matchesSearch =
        !q ||
        c.clientCode.toLowerCase().includes(q) ||
        c.firstName.toLowerCase().includes(q) ||
        c.lastName.toLowerCase().includes(q) ||
        (c.email ?? "").toLowerCase().includes(q) ||
        (c.phone ?? "").toLowerCase().includes(q) ||
        (c.branchCode ?? "").toLowerCase().includes(q)

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && (c.isActive ?? false)) ||
        (statusFilter === "inactive" && !(c.isActive ?? false))

      const matchesBranch =
        branchFilter === "all" || c.branchId === branchFilter

      return matchesSearch && matchesStatus && matchesBranch
    })
  }, [data, search, statusFilter, branchFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage   = Math.min(page, totalPages)
  const start      = (safePage - 1) * pageSize
  const pageRows   = filtered.slice(start, start + pageSize)

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

  function handleSearch(v: string)        { setSearch(v);                                               setPage(1) }
  function handleStatus(v: string | null) { if (v) { setStatusFilter(v as "all" | "active" | "inactive"); setPage(1) } }
  function handleBranch(v: string | null) { if (v) { setBranchFilter(v);                                 setPage(1) } }
  function handlePageSize(v: string | null) { if (v) { setPageSize(Number(v));                           setPage(1) } }

  function getPageNumbers() {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1)
    const pages: (number | "…")[] = [1]
    if (safePage > 3) pages.push("…")
    for (let i = Math.max(2, safePage - 1); i <= Math.min(totalPages - 1, safePage + 1); i++) {
      pages.push(i)
    }
    if (safePage < totalPages - 2) pages.push("…")
    pages.push(totalPages)
    return pages
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Show</span>
          <Select value={String(pageSize)} onValueChange={handlePageSize}>
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

        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            className="pl-8 h-9"
            placeholder="Search client…"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        <Select value={branchFilter} onValueChange={handleBranch}>
          <SelectTrigger className="h-9 w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Branches</SelectItem>
            {branches.map((b) => (
              <SelectItem key={b.id} value={b.id}>{b.code} — {b.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={handleStatus}>
          <SelectTrigger className="h-9 w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <UsersIcon className="mb-3 size-10 text-muted-foreground/40" />
          <p className="text-sm font-medium">No clients found</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {search || statusFilter !== "all" || branchFilter !== "all"
              ? "Try adjusting your search or filters."
              : `Use "Add Client" to get started.`}
          </p>
        </div>
      ) : (
        <div className="rounded-lg border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="font-semibold text-foreground">Code</TableHead>
                <TableHead className="font-semibold text-foreground">Status</TableHead>
                <TableHead className="font-semibold text-foreground">Client</TableHead>
                <TableHead className="font-semibold text-foreground">Branch</TableHead>
                <TableHead className="font-semibold text-foreground">Scheme</TableHead>
                <TableHead className="font-semibold text-foreground text-right">Weekly (₹)</TableHead>
                <TableHead className="font-semibold text-foreground text-right">Total Invested</TableHead>
                <TableHead className="font-semibold text-foreground">Active</TableHead>
                <TableHead className="font-semibold text-foreground text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageRows.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-mono font-semibold text-primary">
                    {client.clientCode}
                  </TableCell>

                  <TableCell>
                    {client.isActive ? (
                      <span className="flex size-8 items-center justify-center rounded-full bg-green-50 dark:bg-green-950">
                        <CheckCircle2Icon className="size-4 text-green-600 dark:text-green-400" />
                      </span>
                    ) : (
                      <span className="flex size-8 items-center justify-center rounded-full bg-muted">
                        <XCircleIcon className="size-4 text-muted-foreground" />
                      </span>
                    )}
                  </TableCell>

                  <TableCell>
                    <div className="font-medium leading-tight">
                      {client.firstName} {client.lastName}
                    </div>
                    {client.email && (
                      <div className="text-xs text-muted-foreground">{client.email}</div>
                    )}
                    {!client.email && client.phone && (
                      <div className="text-xs text-muted-foreground">{client.phone}</div>
                    )}
                  </TableCell>

                  <TableCell>
                    {client.branchCode ? (
                      <>
                        <div className="font-mono text-sm font-medium">{client.branchCode}</div>
                        {client.branchName && (
                          <div className="text-xs text-muted-foreground">{client.branchName}</div>
                        )}
                      </>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>

                  <TableCell>
                    {client.account ? (
                      <Badge
                        variant="secondary"
                        className={SCHEME_COLORS[client.account.schemeType] ?? ""}
                      >
                        {client.account.schemeType}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>

                  <TableCell className="text-right tabular-nums">
                    {client.account
                      ? parseFloat(client.account.weeklyAmount).toLocaleString("en-IN")
                      : "—"}
                  </TableCell>

                  <TableCell className="text-right font-medium tabular-nums">
                    ₹{client.totalInvested.toLocaleString("en-IN")}
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant={client.isActive ? "default" : "secondary"}
                      className={
                        client.isActive
                          ? "bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900 dark:text-green-300"
                          : ""
                      }
                    >
                      {client.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8" aria-label="More actions">
                          <MoreHorizontalIcon className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditingClient(client)}>
                          <PencilIcon className="size-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => setClientToDelete(client)}
                        >
                          <Trash2Icon className="size-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Footer */}
      {filtered.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
          <span>
            Showing {start + 1} to {Math.min(start + pageSize, filtered.length)} of {filtered.length} entries
          </span>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3"
              disabled={safePage === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeftIcon className="size-4 mr-1" />
              Previous
            </Button>

            {getPageNumbers().map((p, i) =>
              p === "…" ? (
                <span key={`ellipsis-${i}`} className="px-1">…</span>
              ) : (
                <Button
                  key={p}
                  variant={p === safePage ? "default" : "outline"}
                  size="sm"
                  className="size-8 p-0"
                  onClick={() => setPage(p)}
                >
                  {p}
                </Button>
              )
            )}

            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3"
              disabled={safePage === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
              <ChevronRightIcon className="size-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Edit dialog */}
      {editingClient && (
        <EditClientDialog
          client={editingClient}
          branches={branches}
          open={true}
          onClose={() => setEditingClient(null)}
        />
      )}

      {/* Delete confirmation dialog */}
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
              </span>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setClientToDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" disabled={isPending} onClick={confirmDelete}>
              {isPending ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
