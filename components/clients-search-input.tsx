"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useCallback } from "react"
import { Input } from "@/components/ui/input"
import { SearchIcon } from "lucide-react"

export function ClientsSearchInput() {
  const router       = useRouter()
  const pathname     = usePathname()
  const searchParams = useSearchParams()

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const params = new URLSearchParams(searchParams.toString())
      const value  = e.target.value.trim()
      if (value) params.set("q", value)
      else params.delete("q")
      router.replace(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams]
  )

  return (
    <div className="relative max-w-sm flex-1">
      <SearchIcon className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
      <Input
        placeholder="Search by name, code, branch…"
        defaultValue={searchParams.get("q") ?? ""}
        onChange={handleChange}
        className="pl-8"
      />
    </div>
  )
}
