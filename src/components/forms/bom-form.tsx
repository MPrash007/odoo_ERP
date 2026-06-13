"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { bomSchema } from "@/lib/validations";
import { Loader2, Plus, Trash2 } from "lucide-react";

type BomFormValues = z.infer<typeof bomSchema>;

export function BomForm({
  products,
  initialData,
}: {
  products: Array<{ id: string; name: string; sku: string; productType: string }>;
  initialData?: {
    id: string;
    name: string;
    productId: string;
    items: Array<{ componentId: string; quantity: number }>;
  };
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const form = useForm<BomFormValues>({
    resolver: zodResolver(bomSchema) as any,
    defaultValues: initialData || {
      productId: "",
      name: "",
      items: [{ componentId: "", quantity: 1 }],
      operations: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  // Filter for products that can be manufactured
  const finishedGoods = products.filter(p => p.productType === "FINISHED_GOOD" || p.productType === "SEMI_FINISHED");
  
  // Filter for components (raw materials or semi-finished)
  const components = products.filter(p => p.productType === "RAW_MATERIAL" || p.productType === "SEMI_FINISHED");

  async function onSubmit(data: BomFormValues) {
    setIsLoading(true);
    setError("");

    try {
      const isEditing = !!initialData;
      const url = isEditing ? `/api/boms/${initialData.id}` : "/api/boms";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.error || `Failed to ${isEditing ? "update" : "create"} Bill of Materials`);
      }

      router.push("/bom");
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
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      {error && (
        <div className="p-3 text-sm text-[#E53935] bg-[#E53935]/10 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="productId">Product (Finished Good) <span className="text-[#E53935]">*</span></Label>
          <select
            id="productId"
            {...form.register("productId")}
            className="flex h-10 w-full rounded-md border border-[#E0E0E0] bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#820AD1]"
          >
            <option value="">Select a product...</option>
            {finishedGoods.map((p) => (
              <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
            ))}
          </select>
          {form.formState.errors.productId && (
            <p className="text-xs text-[#E53935]">{form.formState.errors.productId.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">BoM Name <span className="text-[#E53935]">*</span></Label>
          <Input id="name" {...form.register("name")} placeholder="e.g. Standard Wooden Table BoM" />
          {form.formState.errors.name && (
            <p className="text-xs text-[#E53935]">{form.formState.errors.name.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#1A1A1A]">Components (Raw Materials)</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ componentId: "", quantity: 1 })}
            className="text-[#820AD1] border-[#EBE3F2] hover:bg-[#F5F2F8]"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Component
          </Button>
        </div>

        <div className="border border-[#E0E0E0] rounded-xl overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#F5F2F8]">
              <tr>
                <th className="px-4 py-2 w-[70%]">Component</th>
                <th className="px-4 py-2 w-[20%] text-right">Quantity</th>
                <th className="px-4 py-2 w-12 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0E0E0]">
              {fields.map((field, index) => (
                <tr key={field.id} className="bg-white">
                  <td className="px-4 py-3 align-top">
                    <select
                      {...form.register(`items.${index}.componentId`)}
                      className="flex h-9 w-full rounded-md border border-[#E0E0E0] bg-white px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#820AD1]"
                    >
                      <option value="">Select a component...</option>
                      {components.map((p) => (
                        <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                      ))}
                    </select>
                    {form.formState.errors.items?.[index]?.componentId && (
                      <p className="text-xs text-[#E53935] mt-1">{form.formState.errors.items[index]?.componentId?.message}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <Input
                      type="number"
                      min="1"
                      {...form.register(`items.${index}.quantity`, { valueAsNumber: true })}
                      className="h-9 text-right"
                    />
                    {form.formState.errors.items?.[index]?.quantity && (
                      <p className="text-xs text-[#E53935] mt-1">{form.formState.errors.items[index]?.quantity?.message}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 align-top text-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                      disabled={fields.length === 1}
                      className="h-9 w-9 text-[#8C8C8C] hover:text-[#E53935] hover:bg-[#E53935]/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-[#E0E0E0]">
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
          disabled={isLoading}
          className="bg-[#820AD1] hover:bg-[#9013D8]"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : null}
          {initialData ? "Save Changes" : "Create Bill of Materials"}
        </Button>
      </div>
    </form>
  );
}
