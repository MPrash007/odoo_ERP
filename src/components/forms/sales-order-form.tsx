"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { salesOrderSchema } from "@/lib/validations";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

type SalesOrderFormValues = z.infer<typeof salesOrderSchema>;

export function SalesOrderForm({
  customers,
  products,
}: {
  customers: Array<{ id: string; name: string }>;
  products: Array<{ id: string; name: string; salesPrice: number | null }>;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const form = useForm<SalesOrderFormValues>({
    resolver: zodResolver(salesOrderSchema),
    defaultValues: {
      customerId: "",
      items: [{ productId: "", quantity: 1, unitPrice: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const watchItems = form.watch("items");

  const totalAmount = watchItems.reduce(
    (sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0),
    0
  );

  const handleProductChange = (index: number, productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (product && product.salesPrice) {
      form.setValue(`items.${index}.unitPrice`, Number(product.salesPrice));
    }
  };

  async function onSubmit(data: SalesOrderFormValues) {
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/sales-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.error || "Failed to create sales order");
      }

      router.push("/sales");
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

      <div className="space-y-2 max-w-md">
        <Label htmlFor="customerId">Customer <span className="text-[#E53935]">*</span></Label>
        <select
          id="customerId"
          {...form.register("customerId")}
          className="flex h-10 w-full rounded-md border border-[#E0E0E0] bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#820AD1] focus-visible:border-transparent transition-all"
        >
          <option value="">Select a customer...</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        {form.formState.errors.customerId && (
          <p className="text-xs text-[#E53935]">{form.formState.errors.customerId.message}</p>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#1A1A1A]">Order Lines</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ productId: "", quantity: 1, unitPrice: 0 })}
            className="text-[#820AD1] border-[#EBE3F2] hover:bg-[#F5F2F8]"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Line
          </Button>
        </div>

        <div className="border border-[#E0E0E0] rounded-xl overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#F5F2F8]">
              <tr>
                <th className="px-4 py-2 w-[45%]">Product</th>
                <th className="px-4 py-2 w-[20%]">Quantity</th>
                <th className="px-4 py-2 w-[20%]">Unit Price</th>
                <th className="px-4 py-2 text-right">Subtotal</th>
                <th className="px-4 py-2 w-12 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0E0E0]">
              {fields.map((field, index) => {
                const quantity = watchItems[index]?.quantity || 0;
                const unitPrice = watchItems[index]?.unitPrice || 0;
                const subtotal = quantity * unitPrice;

                return (
                  <tr key={field.id} className="bg-white">
                    <td className="px-4 py-3 align-top">
                      <select
                        {...form.register(`items.${index}.productId`)}
                        onChange={(e) => {
                          form.register(`items.${index}.productId`).onChange(e);
                          handleProductChange(index, e.target.value);
                        }}
                        className="flex h-9 w-full rounded-md border border-[#E0E0E0] bg-white px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#820AD1]"
                      >
                        <option value="">Select product...</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                      {form.formState.errors.items?.[index]?.productId && (
                        <p className="text-xs text-[#E53935] mt-1">
                          {form.formState.errors.items[index]?.productId?.message}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <Input
                        type="number"
                        min="1"
                        {...form.register(`items.${index}.quantity`, { valueAsNumber: true })}
                        className="h-9"
                      />
                      {form.formState.errors.items?.[index]?.quantity && (
                        <p className="text-xs text-[#E53935] mt-1">
                          {form.formState.errors.items[index]?.quantity?.message}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        {...form.register(`items.${index}.unitPrice`, { valueAsNumber: true })}
                        className="h-9"
                      />
                      {form.formState.errors.items?.[index]?.unitPrice && (
                        <p className="text-xs text-[#E53935] mt-1">
                          {form.formState.errors.items[index]?.unitPrice?.message}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top text-right pt-4 font-medium text-[#1A1A1A]">
                      {formatCurrency(subtotal)}
                    </td>
                    <td className="px-4 py-3 align-top text-center pt-3.5">
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                          className="h-8 w-8 text-[#8C8C8C] hover:text-[#E53935] hover:bg-[#E53935]/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-[#F5F2F8] border-t border-[#E0E0E0]">
              <tr>
                <td colSpan={3} className="px-4 py-3 text-right font-medium text-[#595959]">
                  Total Amount:
                </td>
                <td className="px-4 py-3 text-right font-bold text-[#820AD1] text-lg">
                  {formatCurrency(totalAmount)}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
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
          disabled={isLoading || fields.length === 0}
        >
          {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          Create Sales Order
        </Button>
      </div>
    </form>
  );
}
