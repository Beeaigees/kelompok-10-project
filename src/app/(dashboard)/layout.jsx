"use client";

import { ReadyOrdersProvider } from "../../components/common/ready-orders-context";
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
import DashboardDate from "./_components/dashboard-date";
import DashboardRecall from "./_components/dashboard-recall";
import { useAuth } from "../../components/common/auth-context";

import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
export default function DashboardLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }

    if (!loading && user) {
      if (pathname.startsWith("/kitchen") && user.role === "cashier") {
        router.push("/cashier");
      } else if (pathname.startsWith("/cashier") && user.role === "kitchen") {
        router.push("/kitchen");
      }
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Memuat aplikasi...
      </div>
    );
  }

  if (!user) {
    return null;
  }
  return (
    <ReadyOrdersProvider>
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
                <DashboardRecall />
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
    </ReadyOrdersProvider>
  );
}
