"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, Check, X, User as UserIcon } from "lucide-react";
import { User, UserRole } from "@prisma/client";
import Link from "next/link";
import { cn } from "@/lib/utils";

type PermissionValue = "YES" | "NO" | "LIMITED" | "AUTO";

const PRIVILEGE_MATRIX = {
  Sales: {
    fields: [
      { name: "Customer", create: "YES", view: "YES", edit: "YES", delete: "YES" },
      { name: "Customer Address", create: "YES", view: "YES", edit: "YES", delete: "YES" },
      { name: "Sales Person", create: "YES", view: "YES", edit: "YES", delete: "YES" },
      { name: "Product", create: "YES", view: "YES", edit: "YES", delete: "YES" },
      { name: "Ordered Quantity", create: "YES", view: "YES", edit: "YES", delete: "YES" },
      { name: "Delivered Quantity", create: "YES", view: "YES", edit: "YES", delete: "YES" },
      { name: "Sales Price", create: "YES", view: "YES", edit: "YES", delete: "YES" },
      { name: "Status", create: "YES", view: "YES", edit: "YES", delete: "NO" },
      { name: "Total", create: "YES", view: "YES", edit: "AUTO", delete: "NO" },
      { name: "Creation Date", create: "AUTO", view: "YES", edit: "NO", delete: "NO" },
    ],
  },
  Purchase: {
    fields: [
      { name: "Vendor", create: "YES", view: "YES", edit: "YES", delete: "YES" },
      { name: "Vendor Address", create: "YES", view: "YES", edit: "YES", delete: "YES" },
      { name: "Responsible Person", create: "YES", view: "YES", edit: "YES", delete: "YES" },
      { name: "Product", create: "YES", view: "YES", edit: "YES", delete: "YES" },
      { name: "Ordered Quantity", create: "YES", view: "YES", edit: "YES", delete: "YES" },
      { name: "Received Quantity", create: "YES", view: "YES", edit: "YES", delete: "YES" },
      { name: "Cost Price", create: "YES", view: "YES", edit: "YES", delete: "YES" },
      { name: "Total", create: "YES", view: "YES", edit: "AUTO", delete: "NO" },
      { name: "Creation Date", create: "AUTO", view: "YES", edit: "NO", delete: "NO" },
    ],
  },
  Manufacturing: {
    fields: [
      { name: "Product to Manufacture", create: "YES", view: "YES", edit: "YES", delete: "YES" },
      { name: "Product Quantity", create: "YES", view: "YES", edit: "YES", delete: "YES" },
      { name: "BoM", create: "YES", view: "YES", edit: "YES", delete: "YES" },
      { name: "Responsible Person", create: "YES", view: "YES", edit: "YES", delete: "YES" },
      { name: "Finished Quantity", create: "YES", view: "YES", edit: "YES", delete: "YES" },
      { name: "Creation Date", create: "AUTO", view: "YES", edit: "NO", delete: "NO" },
    ],
  },
  Product: {
    fields: [
      { name: "Product Name", create: "YES", view: "YES", edit: "YES", delete: "YES" },
      { name: "SKU", create: "YES", view: "YES", edit: "YES", delete: "YES" },
      { name: "Product Type", create: "YES", view: "YES", edit: "YES", delete: "YES" },
      { name: "Sales Price", create: "YES", view: "YES", edit: "YES", delete: "YES" },
      { name: "Cost Price", create: "YES", view: "YES", edit: "YES", delete: "YES" },
      { name: "On Hand Quantity", create: "NO", view: "YES", edit: "NO", delete: "NO" },
    ],
  },
};

const getPermission = (val: string, role: UserRole, moduleName: string) => {
  if (role === "ADMIN" || role === "OWNER") return val;
  
  if (role === "SALES" && moduleName !== "Sales" && moduleName !== "Product") return "NO";
  if (role === "SALES" && moduleName === "Product" && val === "YES") return "LIMITED";

  if (role === "PURCHASE" && moduleName !== "Purchase" && moduleName !== "Product") return "NO";
  if (role === "PURCHASE" && moduleName === "Product" && val === "YES") return "LIMITED";

  if (role === "MANUFACTURING" && moduleName !== "Manufacturing" && moduleName !== "Product") return "NO";
  if (role === "MANUFACTURING" && moduleName === "Product" && val === "YES") return "LIMITED";

  if (role === "INVENTORY" && moduleName !== "Product" && moduleName !== "Sales" && moduleName !== "Purchase") return "NO";
  if (role === "INVENTORY" && (moduleName === "Sales" || moduleName === "Purchase") && val === "YES") return "LIMITED";

  return val;
};

const renderIcon = (val: string) => {
  if (val === "YES") return <Check className="w-4 h-4 text-green-600 mx-auto" />;
  if (val === "NO") return <X className="w-4 h-4 text-red-500 mx-auto" />;
  if (val === "LIMITED") return <span className="text-xs text-orange-500 font-medium">Limited</span>;
  if (val === "AUTO") return <span className="text-xs text-blue-500 font-medium">Auto</span>;
  return null;
};

export function UserDetailClient({ initialData }: { initialData: User }) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"Sales" | "Purchase" | "Manufacturing" | "Product">("Sales");
  
  const [position, setPosition] = useState(initialData.position || "");
  const [role, setRole] = useState<UserRole>(initialData.role);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setIsSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/users/${initialData.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ position, role }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update user");
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="erp-page max-w-5xl mx-auto">
      <PageHeader
        title="User Management Form View"
        description="View user details and configure access roles."
        actions={
          <div className="flex gap-2">
            <Link href="/users" className={cn(buttonVariants({ variant: "outline" }))}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
            <Button onClick={handleSave} disabled={isSaving} className="bg-[#820AD1] hover:bg-[#9013D8]">
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </div>
        }
      />

      {error && (
        <div className="mb-6 p-3 text-sm text-[#E53935] bg-[#E53935]/10 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-6 mt-6">
        <Card className="border-[#E0E0E0] shadow-sm relative overflow-hidden">
          <div className="absolute top-4 right-4 text-xs font-semibold text-red-500 uppercase tracking-widest bg-red-50 px-2 py-1 rounded">Read-Only</div>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4 border-b border-[#F5F2F8] pb-4">
                <div className="w-16 h-16 rounded-xl bg-[#EBE3F2] flex items-center justify-center text-[#820AD1]">
                  {initialData.profileImage ? (
                    <img src={initialData.profileImage} alt={initialData.name} className="w-full h-full rounded-xl object-cover" />
                  ) : (
                    <UserIcon className="w-8 h-8" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#1A1A1A]">{initialData.name}</h3>
                  <p className="text-[#595959]">{initialData.email}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-y-4 gap-x-8 pt-2">
                <div>
                  <p className="text-xs text-[#8C8C8C] mb-1 font-medium">Mobile Number</p>
                  <p className="text-sm font-medium text-[#1A1A1A]">{initialData.phone || "+918000000000"}</p>
                </div>
                <div>
                  <p className="text-xs text-[#8C8C8C] mb-1 font-medium">Address</p>
                  <p className="text-sm font-medium text-[#1A1A1A]">{initialData.address || "N/A"}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E0E0E0] shadow-sm relative border-l-4 border-l-[#820AD1]">
           <div className="absolute top-4 right-4 text-xs font-semibold text-[#820AD1] uppercase tracking-widest bg-[#EBE3F2] px-2 py-1 rounded">Editable</div>
          <CardContent className="p-6 flex flex-col justify-center h-full space-y-4">
            <div>
              <label className="text-xs text-[#8C8C8C] mb-1.5 block font-medium">Position</label>
              <Input 
                value={position} 
                onChange={(e) => setPosition(e.target.value)}
                placeholder="e.g. Sales Manager"
                className="h-9 focus-visible:ring-[#820AD1]"
              />
            </div>
            <div>
              <label className="text-xs text-[#8C8C8C] mb-1.5 block font-medium">System Role (Privileges)</label>
              <select 
                value={role} 
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="flex h-9 w-full rounded-md border border-[#E0E0E0] bg-white px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#820AD1]"
              >
                <option value="ADMIN">ADMIN</option>
                <option value="OWNER">OWNER</option>
                <option value="SALES">SALES</option>
                <option value="PURCHASE">PURCHASE</option>
                <option value="MANUFACTURING">MANUFACTURING</option>
                <option value="INVENTORY">INVENTORY</option>
              </select>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 border border-[#E0E0E0] rounded-xl overflow-hidden bg-white shadow-sm">
        <div className="flex border-b border-[#E0E0E0] bg-[#F5F2F8]/30">
          {(["Sales", "Purchase", "Manufacturing", "Product"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-6 py-3 text-sm font-medium transition-colors border-b-2",
                activeTab === tab
                  ? "border-[#820AD1] text-[#820AD1] bg-white"
                  : "border-transparent text-[#595959] hover:text-[#1A1A1A] hover:bg-[#F5F2F8]"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#F5F2F8]/50 text-[#595959] font-medium border-b border-[#E0E0E0]">
              <tr>
                <th className="px-6 py-3 border-r border-[#E0E0E0]">Field</th>
                <th className="px-4 py-3 text-center border-r border-[#E0E0E0] w-24">Create</th>
                <th className="px-4 py-3 text-center border-r border-[#E0E0E0] w-24">View</th>
                <th className="px-4 py-3 text-center border-r border-[#E0E0E0] w-24">Edit</th>
                <th className="px-4 py-3 text-center w-24">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0E0E0]">
              {PRIVILEGE_MATRIX[activeTab].fields.map((field, idx) => (
                <tr key={idx} className="hover:bg-[#F5F2F8]/20">
                  <td className="px-6 py-3 font-medium text-[#1A1A1A] border-r border-[#E0E0E0]">
                    {field.name}
                  </td>
                  <td className="px-4 py-3 text-center border-r border-[#E0E0E0]">
                    {renderIcon(getPermission(field.create, role, activeTab))}
                  </td>
                  <td className="px-4 py-3 text-center border-r border-[#E0E0E0]">
                    {renderIcon(getPermission(field.view, role, activeTab))}
                  </td>
                  <td className="px-4 py-3 text-center border-r border-[#E0E0E0]">
                    {renderIcon(getPermission(field.edit, role, activeTab))}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {renderIcon(getPermission(field.delete, role, activeTab))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
