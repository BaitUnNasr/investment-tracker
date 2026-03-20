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
import { toast } from "sonner"
import { updateBranch } from "@/app/dashboard/branches/actions"

const schema = z.object({
  code:     z.string().min(1, "Branch code is required").max(20),
  name:     z.string().min(1, "Branch name is required").max(255),
  city:     z.string().max(100).optional(),
  phone:    z.string().max(20).optional(),
  address:  z.string().optional(),
  isActive: z.boolean(),
})

type FormValues = z.infer<typeof schema>

export interface Branch {
  id:       string
  code:     string
  name:     string
  city:     string | null
  phone:    string | null
  address:  string | null
  isActive: boolean | null
}

interface EditBranchDialogProps {
  branch: Branch
  open: boolean
  onClose: () => void
}

export function EditBranchDialog({ branch, open, onClose }: EditBranchDialogProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      code:     branch.code,
      name:     branch.name,
      city:     branch.city ?? "",
      phone:    branch.phone ?? "",
      address:  branch.address ?? "",
      isActive: branch.isActive ?? true,
    },
  })

  // Sync form values when branch changes (e.g. editing a different row)
  useEffect(() => {
    if (open) {
      form.reset({
        code:     branch.code,
        name:     branch.name,
        city:     branch.city ?? "",
        phone:    branch.phone ?? "",
        address:  branch.address ?? "",
        isActive: branch.isActive ?? true,
      })
    }
  }, [open, branch, form])

  const isSubmitting = form.formState.isSubmitting

  async function onSubmit(values: FormValues) {
    const result = await updateBranch(branch.id, values)
    if ("error" in result) {
      toast.error(result.error)
      return
    }
    toast.success(`Branch "${values.name}" updated`)
    onClose()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => { if (!open) onClose() }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Branch</DialogTitle>
          <DialogDescription>
            Update details for branch <span className="font-mono font-medium">{branch.code}</span>.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Branch Code <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 075" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Branch Name <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Bandra West" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Mumbai" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 9876543210" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Street address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <FormLabel>Active</FormLabel>
                    <p className="text-xs text-muted-foreground">
                      Inactive branches are hidden from client onboarding
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
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
