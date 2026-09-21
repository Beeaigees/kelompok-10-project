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
} from "../../components/ui/sidebar";

import {} from "../../constants/sidebar-constant";
import Link from "next/link";
import Image from "next/image";
import { cn } from "../../lib/utils";
import { usePathname } from "next/navigation";
import { ChefHat, CirclePile, Coins, UserGroup } from "lucide-react";

// konten Core Terminal
export const CORE_LIST = [
  {
    icon: Coins,
    title: "Cashier POS",
    url: "cashier", // urlnya sesuai kata awal kayak "/admin" atau "/kitchen"
  },
  {
    icon: ChefHat,
    title: "Kitchen POS",
    url: "kitchen",
  },
  {
    icon: CirclePile,
    title: "Admin POS",
    url: "admin",
  },
];

// konten Floor ops
export const FLOOR_OPS = [
  {
    icon: CirclePile,
    title: "Inventory POS",
    url: "inventory",
  },
  { icon: UserGroup, title: "Staff", url: "staff" },
];

export function AppSidebar() {
  const pathname = usePathname();
  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-2">
              <Image
                src="/kopi_logo.jpeg"
                alt="hasiba"
                height={30}
                width={30}
              />
              <p className="md:text-md font-semibold">BrewOps</p>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Core terminal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {CORE_LIST.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    render={<Link href={`/${item.url}`} />}
                    className={cn("px-2 py-4", {
                      "bg-[#d4af37]  hover:bg-[#bb9d3a]":
                        pathname === `/${item.url}`,
                    })}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>FLOOR OPS</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {FLOOR_OPS.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    render={<Link href={`/${item.url}`} />}
                    className={cn("px-2 py-4", {
                      "bg-[#d4af37]  hover:bg-[#bb9d3a]":
                        pathname === `/${item.value}`,
                    })}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu></SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
