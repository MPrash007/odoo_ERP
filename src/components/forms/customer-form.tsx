"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { customerSchema } from "@/lib/validations";
import { Loader2 } from "lucide-react";

type CustomerFormValues = z.infer<typeof customerSchema>;

export function CustomerForm({
  initialData,
}: {
  initialData?: CustomerFormValues & { id: string };
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema) as any,
    defaultValues: initialData || {
      name: "",
      email: "",
      phone: "",
      address: "",
    },
  });

  async function onSubmit(data: CustomerFormValues) {
    setIsLoading(true);
    setError("");

    try {
      const url = initialData ? `/api/customers/${initialData.id}` : "/api/customers";
      const method = initialData ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.error || "Failed to save customer");
      }

      router.push("/customers");
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
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="name">Full Name or Company Name <span className="text-[#E53935]">*</span></Label>
          <Input id="name" {...form.register("name")} placeholder="e.g. Acme Corp" />
          {form.formState.errors.name && (
            <p className="text-xs text-[#E53935]">{form.formState.errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input id="email" type="email" {...form.register("email")} placeholder="contact@example.com" />
          {form.formState.errors.email && (
            <p className="text-xs text-[#E53935]">{form.formState.errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input id="phone" type="tel" {...form.register("phone")} placeholder="+1 234 567 890" />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="address">Billing/Shipping Address</Label>
          <Textarea 
            id="address" 
            {...form.register("address")} 
            placeholder="Full address details..."
            className="resize-none h-24"
          />
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
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          {initialData ? "Save Changes" : "Create Customer"}
        </Button>
      </div>
    </form>
  );
}
