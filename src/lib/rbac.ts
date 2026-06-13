import { UserRole } from "@prisma/client";

// ─── Permission Types ───────────────────────────────

export type Module =
  | "users"
  | "products"
  | "customers"
  | "vendors"
  | "sales-orders"
  | "purchase-orders"
  | "boms"
  | "manufacturing"
  | "work-orders"
  | "inventory"
  | "stock-ledger"
  | "audit-logs"
  | "dashboard"
  | "ai";

export type Action = "create" | "read" | "update" | "delete" | "manage";

export type Permission = `${Module}:${Action}` | `${Module}:*` | "*";

// ─── Role → Permissions Map ────────────────────────

const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  NONE: [],
  ADMIN: ["*"],

  SALES: [
    "products:read",
    "customers:*",
    "sales-orders:*",
    "dashboard:read",
    "ai:read",
  ],

  PURCHASE: [
    "products:read",
    "vendors:*",
    "purchase-orders:*",
    "dashboard:read",
    "ai:read",
  ],

  MANUFACTURING: [
    "products:read",
    "boms:*",
    "manufacturing:*",
    "work-orders:*",
    "dashboard:read",
    "ai:read",
  ],

  INVENTORY: [
    "products:*",
    "inventory:*",
    "stock-ledger:read",
    "dashboard:read",
    "ai:read",
  ],

  OWNER: [
    "products:read",
    "customers:read",
    "vendors:read",
    "sales-orders:read",
    "purchase-orders:read",
    "boms:read",
    "manufacturing:read",
    "work-orders:read",
    "inventory:read",
    "stock-ledger:read",
    "dashboard:*",
    "ai:*",
  ],
};

// ─── Permission Check ───────────────────────────────

export function hasPermission(
  role: UserRole,
  module: Module,
  action: Action
): boolean {
  const permissions = ROLE_PERMISSIONS[role];

  // Wildcard - full access
  if (permissions.includes("*")) return true;

  // Module wildcard
  if (permissions.includes(`${module}:*` as Permission)) return true;

  // Specific permission
  if (permissions.includes(`${module}:${action}` as Permission)) return true;

  // 'manage' implies all actions
  if (permissions.includes(`${module}:manage` as Permission)) return true;

  return false;
}

// ─── Route → Permission Map ─────────────────────────

export function getRequiredPermission(
  pathname: string,
  method: string
): { module: Module; action: Action } | null {
  const segments = pathname.replace("/api/", "").split("/");
  const moduleSlug = segments[0] as Module;

  // Map HTTP methods to actions
  const methodActionMap: Record<string, Action> = {
    GET: "read",
    POST: "create",
    PUT: "update",
    PATCH: "update",
    DELETE: "delete",
  };

  // Special action routes
  const actionSegments = ["confirm", "deliver", "cancel", "receive", "start", "complete", "adjust"];
  const hasAction = segments.some((s) => actionSegments.includes(s));

  if (hasAction) {
    return { module: moduleSlug, action: "manage" };
  }

  return {
    module: moduleSlug,
    action: methodActionMap[method] || "read",
  };
}

// ─── Sidebar Navigation Permissions ─────────────────

export interface NavItem {
  title: string;
  href: string;
  icon: string;
  module: Module;
}

export const NAV_ITEMS: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: "LayoutDashboard", module: "dashboard" },
  { title: "Products", href: "/products", icon: "Package", module: "products" },
  { title: "Customers", href: "/customers", icon: "Users", module: "customers" },
  { title: "Vendors", href: "/vendors", icon: "Truck", module: "vendors" },
  { title: "Sales Orders", href: "/sales-orders", icon: "ShoppingCart", module: "sales-orders" },
  { title: "Purchase Orders", href: "/purchase-orders", icon: "ClipboardList", module: "purchase-orders" },
  { title: "Bill of Materials", href: "/bom", icon: "Layers", module: "boms" },
  { title: "Manufacturing", href: "/manufacturing", icon: "Factory", module: "manufacturing" },
  { title: "Work Orders", href: "/work-orders", icon: "Wrench", module: "work-orders" },
  { title: "Inventory", href: "/inventory", icon: "Warehouse", module: "inventory" },
  { title: "Audit Logs", href: "/audit-logs", icon: "ScrollText", module: "audit-logs" },
  { title: "AI Assistant", href: "#ai", icon: "Bot", module: "ai" },
];

export function getNavItemsForRole(role: UserRole): NavItem[] {
  return NAV_ITEMS.filter((item) => hasPermission(role, item.module, "read"));
}
