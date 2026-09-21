"use client";

import DashboardBreadcrumb from "./_components/dashboard-breadcrumb";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { ModeToggle } from "../../components/common/Mode-toggle";
import { Separator } from "../../components/ui/separator";
import { AppSidebar } from "../../components/common/app-sidebar";
export default function DashboardLayout({ children }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="overflow-x-hidden">
        <header className="flex justify-between h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="cursor-pointer" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <DashboardBreadcrumb />
          </div>
          <div className="absolute right-1 p-3">
            <ModeToggle />
          </div>
        </header>

        <main className="flex-1 w-full min-w-0 overflow-x-hidden p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
