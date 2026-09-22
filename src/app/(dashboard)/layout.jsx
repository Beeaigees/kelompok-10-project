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
import DashboardTimeShift from "./_components/dashboard-time-shift";
import DashboardDate from "./_components/dashboard_date";
export default function DashboardLayout({ children }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="overflow-x-hidden">
        <header className="flex justify-between h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-3 px-4 w-full h-14 border-b">
            {/* Bagian Kiri: Navigasi (Trigger & Breadcrumb) */}
            <div className="flex items-center gap-3">
              <SidebarTrigger className="cursor-pointer" />
              <Separator orientation="vertical" className="h-4 self-center" />
              <DashboardBreadcrumb />
            </div>

            {/* Bagian Kanan: Shift, Jam/Tanggal, & Tombol Tema */}
            <div className="ml-auto flex items-center gap-3">
              <DashboardTimeShift />
              <Separator orientation="vertical" className="h-4 self-center" />
              <DashboardDate />
              <Separator orientation="vertical" className="h-4 self-center" />
              <ModeToggle />
            </div>
          </div>
        </header>

        <main className="flex-1 w-full min-w-0 overflow-x-hidden p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
