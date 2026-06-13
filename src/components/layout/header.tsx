"use client";

import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { useSidebarStore } from "@/stores";
import { cn } from "@/lib/utils";
import { Bell, Search, Menu } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/products": "Products",
  "/customers": "Customers",
  "/vendors": "Vendors",
  "/sales-orders": "Sales Orders",
  "/purchase-orders": "Purchase Orders",
  "/bom": "Bill of Materials",
  "/manufacturing": "Manufacturing",
  "/work-orders": "Work Orders",
  "/inventory": "Inventory",
  "/audit-logs": "Audit Logs",
  "/settings": "Settings",
  "/users": "User Management",
};

function getPageTitle(pathname: string): string {
  // Exact match first
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];

  // Try matching parent path
  const segments = pathname.split("/").filter(Boolean);
  for (let i = segments.length; i > 0; i--) {
    const path = "/" + segments.slice(0, i).join("/");
    if (PAGE_TITLES[path]) return PAGE_TITLES[path];
  }

  return "Dashboard";
}

interface HeaderProps {
  userRole?: string;
}

export function Header({ userRole }: HeaderProps) {
  const pathname = usePathname();
  const { isCollapsed, setCollapsed } = useSidebarStore();
  const title = getPageTitle(pathname);

  return (
    <header
      className={cn(
        "sticky top-0 z-30 h-16 bg-white border-b border-[#E0E0E0] flex items-center justify-between px-6 transition-all duration-300",
        "shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
      )}
    >
      {/* Left: Menu toggle + Page title */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setCollapsed(!isCollapsed)}
          className="p-2 rounded-lg text-[#595959] hover:bg-[#F5F2F8] hover:text-[#820AD1] transition-colors lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-semibold text-[#1A1A1A]">{title}</h1>
        </div>
      </div>

      {/* Center: Search */}
      <div className="hidden md:flex flex-1 max-w-md mx-8">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C8C8C]" />
          <Input
            placeholder="Search products, orders, vendors..."
            className="pl-10 bg-[#F5F2F8] border-transparent focus:border-[#820AD1] focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Right: Notifications + Role + User */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <Tooltip>
          <TooltipTrigger className="relative p-2 rounded-lg text-[#595959] hover:bg-[#F5F2F8] hover:text-[#820AD1] transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#E53935] rounded-full" />
          </TooltipTrigger>
          <TooltipContent>Notifications</TooltipContent>
        </Tooltip>

        {/* Role Badge */}
        {userRole && (
          <Badge
            variant="secondary"
            className="bg-[#F5F2F8] text-[#820AD1] border-[#EBE3F2] font-medium text-xs hidden sm:inline-flex"
          >
            {userRole}
          </Badge>
        )}

        {/* User Button */}
        <UserButton
          afterSignOutUrl="/sign-in"
          appearance={{
            elements: {
              avatarBox: "w-9 h-9 rounded-lg",
            },
          }}
        />
      </div>
    </header>
  );
}
