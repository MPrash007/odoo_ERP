"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { inventoryAdjustmentSchema } from "@/lib/validations";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type AdjustFormValues = z.infer<typeof inventoryAdjustmentSchema>;

export function StockAdjustModal({
  isOpen,
  onClose,
  product,
}: {
  isOpen: boolean;
  onClose: () => void;
  product: { id: string; name: string; sku: string; onHandQty: number } | null;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const form = useForm<AdjustFormValues>({
    resolver: zodResolver(inventoryAdjustmentSchema) as any,
    defaultValues: {
      productId: product?.id || "",
      newQuantity: product?.onHandQty || 0,
      reason: "",
    },
  });

  // Reset form when product changes
  useEffect(() => {
    if (product) {
      form.reset({
        productId: product.id,
        newQuantity: product.onHandQty,
        reason: "",
      });
      setError("");
    }
  }, [product, form]);

  async function onSubmit(data: AdjustFormValues) {
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/inventory/adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.error || "Failed to adjust stock");
      }

      router.refresh();
      onClose();
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

  if (!product) return null;

  const difference = form.watch("newQuantity") - product.onHandQty;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adjust Stock</DialogTitle>
          <DialogDescription>
            Manual adjustment for {product.name} ({product.sku}).
            Current on-hand quantity is {product.onHandQty}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          {error && (
            <div className="p-3 text-sm text-[#E53935] bg-[#E53935]/10 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="newQuantity">New Actual Quantity <span className="text-[#E53935]">*</span></Label>
            <Input
              id="newQuantity"
              type="number"
              {...form.register("newQuantity", { valueAsNumber: true })}
            />
            {form.formState.errors.newQuantity && (
              <p className="text-xs text-[#E53935]">{form.formState.errors.newQuantity.message}</p>
            )}
            <p className="text-xs text-[#595959]">
              Difference: {difference > 0 ? `+${difference}` : difference} units. This will create an adjustment ledger entry.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Adjustment <span className="text-[#E53935]">*</span></Label>
            <Input
              id="reason"
              {...form.register("reason")}
              placeholder="e.g. Physical inventory count, damaged goods"
            />
            {form.formState.errors.reason && (
              <p className="text-xs text-[#E53935]">{form.formState.errors.reason.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
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
              Confirm Adjustment
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
