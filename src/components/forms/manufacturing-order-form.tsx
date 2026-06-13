"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { manufacturingOrderSchema } from "@/lib/validations";
import { Loader2 } from "lucide-react";

type ManufacturingOrderFormValues = z.infer<typeof manufacturingOrderSchema>;

export function ManufacturingOrderForm({
  products,
  boms,
  manufacturingUsers,
}: {
  products: Array<{ id: string; name: string }>;
  boms: Array<{ id: string; name: string; productId: string }>;
  manufacturingUsers: Array<{ id: string; name: string; role: string }>;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const form = useForm<ManufacturingOrderFormValues>({
    resolver: zodResolver(manufacturingOrderSchema) as any,
    defaultValues: {
      productId: "",
      bomId: "",
      quantity: 1,
      assignedTo: null,
    },
  });

  const selectedProductId = form.watch("productId");
  const filteredBoms = boms.filter((bom) => bom.productId === selectedProductId);

  async function onSubmit(data: ManufacturingOrderFormValues) {
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/manufacturing-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.error || "Failed to create manufacturing order");
      }

      router.push("/manufacturing");
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

      <div className="space-y-4 max-w-md">
        <div className="space-y-2">
          <Label htmlFor="productId">Product to Manufacture <span className="text-[#E53935]">*</span></Label>
          <select
            id="productId"
            {...form.register("productId")}
            onChange={(e) => {
              form.register("productId").onChange(e);
              // Reset BoM selection when product changes
              form.setValue("bomId", "");
            }}
            className="flex h-10 w-full rounded-md border border-[#E0E0E0] bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#820AD1] focus-visible:border-transparent transition-all"
          >
            <option value="">Select a product...</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          {form.formState.errors.productId && (
            <p className="text-xs text-[#E53935]">{form.formState.errors.productId.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="bomId">Bill of Materials <span className="text-[#E53935]">*</span></Label>
          <select
            id="bomId"
            {...form.register("bomId")}
            disabled={!selectedProductId}
            className="flex h-10 w-full rounded-md border border-[#E0E0E0] bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#820AD1] focus-visible:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">
              {!selectedProductId ? "Select a product first..." : "Select a BoM..."}
            </option>
            {filteredBoms.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
          {form.formState.errors.bomId && (
            <p className="text-xs text-[#E53935]">{form.formState.errors.bomId.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity to Manufacture <span className="text-[#E53935]">*</span></Label>
          <Input
            id="quantity"
            type="number"
            min="1"
            {...form.register("quantity", { valueAsNumber: true })}
            className="h-10 border-[#E0E0E0] focus-visible:ring-[#820AD1]"
          />
          {form.formState.errors.quantity && (
            <p className="text-xs text-[#E53935]">{form.formState.errors.quantity.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="assignedTo">Assign To (Optional)</Label>
          <select
            id="assignedTo"
            {...form.register("assignedTo")}
            className="flex h-10 w-full rounded-md border border-[#E0E0E0] bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#820AD1] focus-visible:border-transparent transition-all"
          >
            <option value="">Unassigned</option>
            {manufacturingUsers.map((u) => (
              <option key={u.id} value={u.id}>{u.name} ({u.role.toLowerCase()})</option>
            ))}
          </select>
          {form.formState.errors.assignedTo && (
            <p className="text-xs text-[#E53935]">{form.formState.errors.assignedTo.message}</p>
          )}
        </div>
      </div>

      <div className="flex justify-start gap-4 pt-4 border-t border-[#F5F2F8]">
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
          Create Manufacturing Order
        </Button>
      </div>
    </form>
  );
}
