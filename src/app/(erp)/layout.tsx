"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { useSidebarStore } from "@/stores";
import { cn } from "@/lib/utils";

export default function ERPLayout({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebarStore();

  return (
    <div className="min-h-screen bg-[#F5F2F8]">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div
        className={cn(
          "flex flex-col min-h-screen transition-all duration-300",
          isCollapsed ? "ml-[72px]" : "ml-[280px]"
        )}
      >
        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
