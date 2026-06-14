"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSidebarStore, useAIAssistantStore } from "@/stores";
import {
  LayoutDashboard,
  Package,
  Users,
  Truck,
  ShoppingCart,
  ClipboardList,
  Layers,
  Factory,
  Wrench,
  Warehouse,
  ScrollText,
  Bot,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const NAV_SECTIONS = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Catalog",
    items: [
      { title: "Products", href: "/products", icon: Package },
      { title: "Customers", href: "/customers", icon: Users },
      { title: "Vendors", href: "/vendors", icon: Truck },
    ],
  },
  {
    label: "Operations",
    items: [
      { title: "Sales Orders", href: "/sales", icon: ShoppingCart },
      { title: "Purchase Orders", href: "/purchases", icon: ClipboardList },
    ],
  },
  {
    label: "Manufacturing",
    items: [
      { title: "Bill of Materials", href: "/bom", icon: Layers },
      { title: "Manufacturing", href: "/manufacturing", icon: Factory },
      { title: "Work Orders", href: "/work-orders", icon: Wrench },
    ],
  },
  {
    label: "Inventory",
    items: [
      { title: "Inventory", href: "/inventory", icon: Warehouse },
    ],
  },
  {
    label: "System",
    items: [
      { title: "User Management", href: "/users", icon: Users },
      { title: "Audit Logs", href: "/audit-logs", icon: ScrollText },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isCollapsed, setCollapsed } = useSidebarStore();
  const { setOpen: setAIOpen } = useAIAssistantStore();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen flex flex-col transition-all duration-300 ease-in-out erp-scrollbar",
        "bg-[#820AD1] text-white",
        isCollapsed ? "w-[72px]" : "w-[280px]"
      )}
    >
      {/* Logo Area */}
      <div
        className={cn(
          "flex items-center h-16 px-4 border-b border-white/10 shrink-0",
          isCollapsed ? "justify-center" : "gap-3"
        )}
      >
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/20 shrink-0">
          <Factory className="w-5 h-5 text-white" />
        </div>
        {!isCollapsed && (
          <div className="min-w-0">
            <h1 className="text-sm font-bold leading-tight truncate">
              Shiv Furniture
            </h1>
            <p className="text-[10px] text-white/60 leading-tight">Mini ERP</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            {!isCollapsed && (
              <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/40">
                {section.label}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" &&
                    pathname.startsWith(item.href));
                const Icon = item.icon;

                const linkClasses = cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-white/20 text-white shadow-sm"
                    : "text-white/70 hover:bg-white/10 hover:text-white",
                  isCollapsed && "justify-center px-2 cursor-pointer w-full"
                );

                const iconClasses = cn(
                  "shrink-0 transition-colors",
                  isActive ? "text-white" : "text-white/70",
                  isCollapsed ? "w-5 h-5" : "w-4 h-4"
                );

                if (isCollapsed) {
                  return (
                    <Tooltip key={item.href}>
                      <TooltipTrigger 
                        className={linkClasses}
                        onClick={() => router.push(item.href)}
                      >
                        <Icon className={iconClasses} />
                      </TooltipTrigger>
                      <TooltipContent side="right" sideOffset={12}>
                        {item.title}
                      </TooltipContent>
                    </Tooltip>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={linkClasses}
                  >
                    <Icon className={iconClasses} />
                    <span className="truncate">{item.title}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* AI Assistant Button */}
      <div className="px-2 py-2 border-t border-white/10">
        <button
          onClick={() => setAIOpen(true)}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium w-full transition-all duration-200",
            "bg-white/10 text-white/80 hover:bg-white/20 hover:text-white",
            isCollapsed && "justify-center px-2"
          )}
        >
          <Bot className={cn("shrink-0", isCollapsed ? "w-5 h-5" : "w-4 h-4")} />
          {!isCollapsed && <span>AI Assistant</span>}
        </button>
      </div>

      {/* Collapse Toggle */}
      <div className="px-2 py-2 border-t border-white/10 shrink-0">
        <button
          onClick={() => setCollapsed(!isCollapsed)}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium w-full transition-all duration-200",
            "text-white/50 hover:bg-white/10 hover:text-white",
            isCollapsed && "justify-center px-2"
          )}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
