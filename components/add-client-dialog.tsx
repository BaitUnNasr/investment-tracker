"use client"

import { useState } from "react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select"
import { PlusIcon } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/app/dashboard/clients/actions"

const SCHEME_LABELS: Record<string, string> = {
  RTD:  "RTD — Recurring Term Deposit",
  DSTD: "DSTD — Direct Small Term Deposit",
  LTD:  "LTD — Lumpsum Term Deposit",
}

const schema = z.object({
  // Client fields (required)
  clientCode: z.string().min(1, "Client code is required").max(20),
  firstName:  z.string().min(1, "First name is required").max(100),
  lastName:   z.string().min(1, "Last name is required").max(100),
  branchId:   z.string().min(1, "Branch is required"),
  // Client fields (optional)
  email:   z.email("Invalid email").optional().or(z.literal("")),
  phone:   z.string().max(20).optional(),
  address: z.string().optional(),
  // Investment account (all optional)
  accountNumber: z.string().max(30).optional(),
  schemeType:    z.enum(["RTD", "DSTD", "LTD"]).optional(),
  weeklyAmount:  z.number().positive("Must be greater than 0").optional(),
  startDate:     z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface Branch { id: string; code: string; name: string }

export function AddClientDialog({ branches }: { branches: Branch[] }) {
  const [open, setOpen] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      clientCode: "", firstName: "", lastName: "", branchId: "",
      email: "", phone: "", address: "",
      accountNumber: "", schemeType: undefined, weeklyAmount: undefined, startDate: "",
    },
  })

  const isSubmitting = form.formState.isSubmitting
  const selectedBranchId  = form.watch("branchId")
  const selectedScheme    = form.watch("schemeType")
  const selectedBranch    = branches.find((b) => b.id === selectedBranchId)

  async function onSubmit(values: FormValues) {
    const result = await createClient(values)
    if ("error" in result) {
      toast.error(result.error)
      return
    }
    toast.success(`Client "${values.firstName} ${values.lastName}" created`)
    form.reset()
    setOpen(false)
  }

  function handleClose() {
    setOpen(false)
    form.reset()
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <PlusIcon className="mr-2 size-4" />
        Add Client
      </Button>

      <Dialog
        open={open}
        onOpenChange={(v, details) => {
          if (!v && details?.reason === "outside-press") return
          setOpen(v)
          if (!v) form.reset()
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Client</DialogTitle>
            <DialogDescription>
              Create a client record. Investment account details are optional and can be added later.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

              {/* ── Client details ── */}
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Client Details
                </p>
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
                            {/* Render label manually — base-ui Select.Value shows raw value string */}
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
                <div className="mt-4">
                  <FormField control={form.control} name="address" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl><Input placeholder="Street address" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>

              {/* ── Investment account (optional) ── */}
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Investment Account
                  <span className="ml-2 font-normal normal-case text-muted-foreground/60">(optional)</span>
                </p>
                <p className="mb-3 text-xs text-muted-foreground">
                  Leave blank to add an account later.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="accountNumber" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Number</FormLabel>
                      <FormControl><Input placeholder="e.g. 075-009" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="schemeType" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Scheme Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value ?? ""}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <span className={selectedScheme ? "text-foreground" : "text-muted-foreground"}>
                              {selectedScheme ? SCHEME_LABELS[selectedScheme] : "Select scheme"}
                            </span>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="RTD">RTD — Recurring Term Deposit</SelectItem>
                          <SelectItem value="DSTD">DSTD — Direct Small Term Deposit</SelectItem>
                          <SelectItem value="LTD">LTD — Lumpsum Term Deposit</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="weeklyAmount" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weekly Amount (₹)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="500"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value === "" ? undefined : e.target.valueAsNumber)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="startDate" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl><Input type="date" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating…" : "Create Client"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  )
}
