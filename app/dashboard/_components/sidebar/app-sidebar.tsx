"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { NavSecondary } from "@/app/dashboard/_components/sidebar/nav-secondary"
import { NavUser } from "@/app/dashboard/_components/sidebar/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import {
  LayoutDashboardIcon,
  BuildingIcon,
  UsersIcon,
  TrendingUpIcon,
  UploadIcon,
  SlidersHorizontalIcon,
  BarChart3Icon,
  Settings2Icon,
  CircleHelpIcon,
  FileText,
  ChevronRightIcon,
  CoinsIcon,
} from "lucide-react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

const navMain = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: <LayoutDashboardIcon />,
  },
  {
    title: "Branches",
    url: "/dashboard/branches",
    icon: <BuildingIcon />,
  },
  {
    title: "Clients",
    url: "/dashboard/clients",
    icon: <UsersIcon />,
  },
]

const navInvestments = [
  {
    title: "Investments",
    icon: <TrendingUpIcon />,
    items: [
      { title: "Accounts", url: "/dashboard/investments/accounts" },
      { title: "Transactions", url: "/dashboard/investments/transactions" },
    ],
  },
  {
    title: "Funds",
    icon: <CoinsIcon />,
    items: [
      { title: "NAV Data", url: "/dashboard/funds/nav" },
      { title: "Allocation Settings", url: "/dashboard/funds/settings" },
    ],
  },
  {
    title: "Reports",
    icon: <BarChart3Icon />,
    items: [
      { title: "Client Reports", url: "/dashboard/reports/clients" },
      { title: "Branch Reports", url: "/dashboard/reports/branches" },
      { title: "Fund Reports", url: "/dashboard/reports/funds" },
    ],
  },
]

const navSecondary = [
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: <Settings2Icon />,
  },
  {
    title: "Help",
    url: "#",
    icon: <CircleHelpIcon />,
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()

  const [openSections, setOpenSections] = React.useState<Record<string, boolean>>(
    () =>
      Object.fromEntries(
        navInvestments.map((s) => [s.title, s.items.some((i) => pathname.startsWith(i.url))]),
      ),
  )

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link href="/dashboard">
                <CoinsIcon className="size-5! text-primary" />
                <span className="text-base font-semibold">BUN Admin</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navMain.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={pathname === item.url}
                  >
                    <Link href={item.url}>
                      {item.icon}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Collapsible Sections */}
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navInvestments.map((section) => (
                <Collapsible
                  key={section.title}
                  open={openSections[section.title] ?? false}
                  onOpenChange={(open) =>
                    setOpenSections((prev) => ({ ...prev, [section.title]: open }))
                  }
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton tooltip={section.title}>
                        {section.icon}
                        <span>{section.title}</span>
                        <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {section.items.map((item) => (
                          <SidebarMenuSubItem key={item.title}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={pathname === item.url}
                            >
                              <Link href={item.url}>
                                <span>{item.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
