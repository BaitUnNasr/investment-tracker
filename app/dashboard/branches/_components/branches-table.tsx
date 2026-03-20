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
  BuildingIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"
import { toast } from "sonner"
import { EditBranchDialog, type Branch as BranchBase } from "./edit-branch-dialog"
import { deleteBranch } from "@/app/dashboard/branches/actions"

type Branch = BranchBase & {
  clients: number
  totalCorpus: number
}

const PAGE_SIZE_OPTIONS = [5, 10, 25, 50]

export function BranchesTable({ data }: { data: Branch[] }) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all")
  const [pageSize, setPageSize] = useState(5)
  const [page, setPage] = useState(1)
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null)
  const [branchToDelete, setBranchToDelete] = useState<Branch | null>(null)
  const [isPending, startTransition] = useTransition()

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return data.filter((b) => {
      const matchesSearch =
        !q ||
        b.code.toLowerCase().includes(q) ||
        b.name.toLowerCase().includes(q) ||
        (b.city ?? "").toLowerCase().includes(q) ||
        (b.phone ?? "").toLowerCase().includes(q)

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && b.isActive) ||
        (statusFilter === "inactive" && !b.isActive)

      return matchesSearch && matchesStatus
    })
  }, [data, search, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const start = (safePage - 1) * pageSize
  const pageRows = filtered.slice(start, start + pageSize)

  function confirmDelete() {
    if (!branchToDelete) return
    const branch = branchToDelete
    setBranchToDelete(null)
    startTransition(async () => {
      const result = await deleteBranch(branch.id)
      if ("error" in result) {
        toast.error(result.error)
      } else {
        toast.success(`Branch "${branch.name}" deleted`)
      }
    })
  }

  // Reset to page 1 on search/filter/size changes
  function handleSearch(v: string) { setSearch(v); setPage(1) }
  function handleStatus(v: string | null) { if (v) { setStatusFilter(v as "all" | "active" | "inactive"); setPage(1) } }
  function handlePageSize(v: string | null) { if (v) { setPageSize(Number(v)); setPage(1) } }

  // Pagination page numbers with ellipsis
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

        <div className="relative ml-auto flex-1 min-w-[180px] max-w-xs">
          <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            className="pl-8 h-9"
            placeholder="Search branch…"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

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
          <BuildingIcon className="mb-3 size-10 text-muted-foreground/40" />
          <p className="text-sm font-medium">No branches found</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {search || statusFilter !== "all"
              ? "Try adjusting your search or filter."
              : "Click \"Add Branch\" to create your first branch."}
          </p>
        </div>
      ) : (
        <div className="rounded-lg border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="font-semibold text-foreground">Code</TableHead>
                <TableHead className="font-semibold text-foreground">Status</TableHead>
                <TableHead className="font-semibold text-foreground">Branch</TableHead>
                <TableHead className="font-semibold text-foreground">Phone</TableHead>
                <TableHead className="font-semibold text-foreground text-right">Clients</TableHead>
                <TableHead className="font-semibold text-foreground text-right">Total Corpus</TableHead>
                <TableHead className="font-semibold text-foreground">Active</TableHead>
                <TableHead className="font-semibold text-foreground text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageRows.map((branch) => (
                <TableRow key={branch.id}>
                  <TableCell className="font-mono font-semibold text-primary">
                    #{branch.code}
                  </TableCell>

                  <TableCell>
                    {branch.isActive ? (
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
                    <div className="font-medium leading-tight">{branch.name}</div>
                    {branch.city && (
                      <div className="text-xs text-muted-foreground">{branch.city}</div>
                    )}
                  </TableCell>

                  <TableCell className="text-sm">{branch.phone ?? "—"}</TableCell>

                  <TableCell className="text-right tabular-nums">{branch.clients}</TableCell>

                  <TableCell className="text-right font-medium tabular-nums">
                    ₹{branch.totalCorpus.toLocaleString("en-IN")}
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant={branch.isActive ? "default" : "secondary"}
                      className={
                        branch.isActive
                          ? "bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900 dark:text-green-300"
                          : ""
                      }
                    >
                      {branch.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={<Button variant="ghost" size="icon" className="size-8" aria-label="More actions" />}
                      >
                        <MoreHorizontalIcon className="size-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditingBranch(branch)}>
                          <PencilIcon className="size-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => setBranchToDelete(branch)}
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

      {/* Edit dialog — rendered outside DropdownMenu to avoid Base UI portal conflicts */}
      {editingBranch && (
        <EditBranchDialog
          branch={editingBranch}
          open={true}
          onClose={() => setEditingBranch(null)}
        />
      )}

      {/* Delete confirmation dialog */}
      <Dialog
        open={branchToDelete !== null}
        onOpenChange={(open) => { if (!open) setBranchToDelete(null) }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Branch</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-medium text-foreground">{branchToDelete?.name}</span>?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-2">
            <Button
              variant="outline"
              onClick={() => setBranchToDelete(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={isPending}
              onClick={confirmDelete}
            >
              {isPending ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
