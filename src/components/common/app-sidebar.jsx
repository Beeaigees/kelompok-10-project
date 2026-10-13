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

import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Badge } from "../ui/badge";

import {} from "../../constants/sidebar-constant";
import Link from "next/link";
import Image from "next/image";
import { cn } from "../../lib/utils";
import { usePathname } from "next/navigation";
import {
  ChefHat,
  CirclePile,
  Coins,
  Dot,
  LogOut,
  User2,
  UserGroup,
} from "lucide-react";

// konten Core Terminal
export const CORE_LIST = [
  {
    icon: Coins,
    title: "Cashier POS",
    url: "cashier", // urlnya sesuai kata awal kayak "/admin" atau "/kitchen"
  },
  {
    icon: ChefHat,
    title: "Kitchen KDS",
    url: "kitchen",
  },
  {
    icon: CirclePile,
    title: "Admin & Analytics",
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
  {
    icon: UserGroup,
    title: "Staff Roster",
    url: "staff",
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center justify-around  gap-2">
              <div className="flex flex-1 gap-2">
                <Image
                  src="/kopi_logo.jpeg"
                  alt="hasiba"
                  height={50}
                  width={50}
                  className=""
                />
                <div className="flex flex-col">
                  <h1 className="md:text-md font-semibold">BrewOps</h1>
                  <p className="text-xs  text-brown-primary">System Core</p>
                </div>
              </div>

              <Badge className="bg-green-300 text-green-800 dark:bg-green-950 dark:text-green-300">
                <Dot size={64} />
                <p className="font-semibold">Live</p>
              </Badge>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-brown-primary uppercase">
            Core terminals
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {CORE_LIST.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    render={<Link href={`/${item.url}`} />}
                    className={cn("px-2 py-4 ", {
                      "bg-brown-primary text-white  hover:bg-brown-primary-hover hover:text-white":
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
          <SidebarGroupLabel className="text-brown-primary">
            FLOOR OPS
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {FLOOR_OPS.map((item) => (
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
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarMenuButton size="lg" className="h-auto py-3">
                    <Avatar>
                      <AvatarFallback>A</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start text-left">
                      <span className="text-sm font-medium">
                        Muhammad Arya fattah
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Admin
                      </span>
                    </div>
                  </SidebarMenuButton>
                }
              />
              <DropdownMenuContent
                side="right"
                align="end"
                sideOffset={8}
                className="w-auto min-w-30 p-1"
              >
                <DropdownMenuItem>
                  <LogOut />{" "}
                  <span className="text-red-500 font-bold">Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
