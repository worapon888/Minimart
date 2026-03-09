"use client";

import * as React from "react";
import {
  IconBuildingStore,
  IconDatabase,
  IconDashboard,
  IconFileAnalytics,
  IconPackage,
  IconReceipt2,
  IconSettings,
  IconUsersGroup,
  IconInnerShadowTop,
} from "@tabler/icons-react";

import { NavMain } from "./nav-main";
import { NavSecondary } from "./nav-secondary";
import { NavUser } from "./nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Overview",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Products",
      url: "/dashboard/products",
      icon: IconBuildingStore,
    },
    {
      title: "Orders",
      url: "/dashboard/orders",
      icon: IconReceipt2,
    },
    {
      title: "Inventory",
      url: "/dashboard/inventory",
      icon: IconPackage,
    },
    {
      title: "Customers",
      url: "/dashboard/customers",
      icon: IconUsersGroup,
    },
    {
      title: "Reports",
      url: "/dashboard/reports",
      icon: IconFileAnalytics,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: IconSettings,
    },
    {
      title: "Data",
      url: "/dashboard/inventory",
      icon: IconDatabase,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/dashboard">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">
                  Minimal Dashboard
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
