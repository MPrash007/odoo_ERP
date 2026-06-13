"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { productSchema } from "@/lib/validations";
import { Loader2 } from "lucide-react";

type ProductFormValues = z.infer<typeof productSchema>;

export function ProductForm({
  vendors,
  initialData,
}: {
  vendors: Array<{ id: string; name: string }>;
  initialData?: ProductFormValues & { id: string };
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: initialData || {
      sku: "",
      name: "",
      productType: "FINISHED_GOOD",
      procurementType: "MANUFACTURING",
      procurementStrategy: "MTS",
      costPrice: 0,
      salesPrice: 0,
      vendorId: "",
    },
  });

  const productType = form.watch("productType");

  async function onSubmit(data: ProductFormValues) {
    setIsLoading(true);
    setError("");

    try {
      const url = initialData ? `/api/products/${initialData.id}` : "/api/products";
      const method = initialData ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.error || "Failed to save product");
      }

      router.push("/products");
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="p-3 text-sm text-[#E53935] bg-[#E53935]/10 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="sku">SKU / Reference <span className="text-[#E53935]">*</span></Label>
          <Input id="sku" {...form.register("sku")} placeholder="e.g. FG-TBL-01" />
          {form.formState.errors.sku && (
            <p className="text-xs text-[#E53935]">{form.formState.errors.sku.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Product Name <span className="text-[#E53935]">*</span></Label>
          <Input id="name" {...form.register("name")} placeholder="e.g. Wooden Dining Table" />
          {form.formState.errors.name && (
            <p className="text-xs text-[#E53935]">{form.formState.errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="productType">Product Type</Label>
          <select
            id="productType"
            {...form.register("productType")}
            className="flex h-10 w-full rounded-md border border-[#E0E0E0] bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#820AD1] focus-visible:border-transparent transition-all"
          >
            <option value="FINISHED_GOOD">Finished Good</option>
            <option value="RAW_MATERIAL">Raw Material</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="procurementType">Procurement Type</Label>
          <select
            id="procurementType"
            {...form.register("procurementType")}
            className="flex h-10 w-full rounded-md border border-[#E0E0E0] bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#820AD1] focus-visible:border-transparent transition-all"
          >
            <option value="MANUFACTURING">Manufacturing (Make)</option>
            <option value="PURCHASE">Purchase (Buy)</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="procurementStrategy">Procurement Strategy</Label>
          <select
            id="procurementStrategy"
            {...form.register("procurementStrategy")}
            className="flex h-10 w-full rounded-md border border-[#E0E0E0] bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#820AD1] focus-visible:border-transparent transition-all"
          >
            <option value="MTS">Make/Buy to Stock (MTS)</option>
            <option value="MTO">Make/Buy to Order (MTO)</option>
          </select>
        </div>

        {productType === "RAW_MATERIAL" && (
          <div className="space-y-2">
            <Label htmlFor="vendorId">Preferred Vendor</Label>
            <select
              id="vendorId"
              {...form.register("vendorId")}
              className="flex h-10 w-full rounded-md border border-[#E0E0E0] bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#820AD1] focus-visible:border-transparent transition-all"
            >
              <option value="">Select a vendor...</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="costPrice">Cost Price</Label>
          <Input
            id="costPrice"
            type="number"
            step="0.01"
            {...form.register("costPrice", { valueAsNumber: true })}
          />
        </div>

        {productType === "FINISHED_GOOD" && (
          <div className="space-y-2">
            <Label htmlFor="salesPrice">Sales Price</Label>
            <Input
              id="salesPrice"
              type="number"
              step="0.01"
              {...form.register("salesPrice", { valueAsNumber: true })}
            />
          </div>
        )}
      </div>

      <div className="flex justify-end gap-4 pt-4 border-t border-[#F5F2F8]">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-[#820AD1] hover:bg-[#9013D8]"
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          {initialData ? "Save Changes" : "Create Product"}
        </Button>
      </div>
    </form>
  );
}
