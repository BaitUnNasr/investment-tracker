"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select"
import { toast } from "sonner"
import { updateClient } from "@/app/dashboard/clients/actions"

const schema = z.object({
  clientCode: z.string().min(1, "Client code is required").max(20),
  firstName:  z.string().min(1, "First name is required").max(100),
  lastName:   z.string().min(1, "Last name is required").max(100),
  email:      z.string().email("Invalid email").optional().or(z.literal("")),
  phone:      z.string().max(20).optional(),
  address:    z.string().optional(),
  branchId:   z.string().min(1, "Branch is required"),
  isActive:   z.boolean(),
})

type FormValues = z.infer<typeof schema>

export interface ClientRow {
  id:         string
  clientCode: string
  firstName:  string
  lastName:   string
  email:      string | null
  phone:      string | null
  address?:   string | null
  branchId:   string | null
  isActive:   boolean | null
}

interface Branch { id: string; code: string; name: string }

interface EditClientDialogProps {
  client:   ClientRow
  branches: Branch[]
  open:     boolean
  onClose:  () => void
}

export function EditClientDialog({ client, branches, open, onClose }: EditClientDialogProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: toDefaults(client),
  })

  useEffect(() => {
    if (open) form.reset(toDefaults(client))
  }, [open, client, form])

  const isSubmitting = form.formState.isSubmitting
  const selectedBranchId = form.watch("branchId")
  const selectedBranch   = branches.find((b) => b.id === selectedBranchId)

  async function onSubmit(values: FormValues) {
    const result = await updateClient(client.id, {
      ...values,
      branchId: values.branchId,
    })
    if ("error" in result) {
      toast.error(result.error)
      return
    }
    toast.success(`Client "${values.firstName} ${values.lastName}" updated`)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Client</DialogTitle>
          <DialogDescription>
            Update details for{" "}
            <span className="font-mono font-medium">{client.clientCode}</span>.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="clientCode" render={({ field }) => (
                <FormItem>
                  <FormLabel>Client Code <span className="text-destructive">*</span></FormLabel>
                  <FormControl><Input placeholder="e.g. 075-009" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="branchId" render={({ field }) => (
                <FormItem>
                  <FormLabel>Branch <span className="text-destructive">*</span></FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <span className={selectedBranch ? "text-foreground" : "text-muted-foreground"}>
                          {selectedBranch
                            ? `${selectedBranch.code} — ${selectedBranch.name}`
                            : "Select branch"}
                        </span>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {branches.map((b) => (
                        <SelectItem key={b.id} value={b.id}>{b.code} — {b.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="firstName" render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name <span className="text-destructive">*</span></FormLabel>
                  <FormControl><Input placeholder="First name" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="lastName" render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name <span className="text-destructive">*</span></FormLabel>
                  <FormControl><Input placeholder="Last name" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl><Input placeholder="email@example.com" type="email" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl><Input placeholder="9876543210" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="address" render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl><Input placeholder="Street address" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="isActive" render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <FormLabel>Active</FormLabel>
                  <p className="text-xs text-muted-foreground">
                    Inactive clients are excluded from weekly collection
                  </p>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )} />

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving…" : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

function toDefaults(c: ClientRow): FormValues {
  return {
    clientCode: c.clientCode,
    firstName:  c.firstName,
    lastName:   c.lastName,
    email:      c.email ?? "",
    phone:      c.phone ?? "",
    address:    c.address ?? "",
    branchId:   c.branchId ?? "",
    isActive:   c.isActive ?? true,
  }
}
