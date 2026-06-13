import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export default async function BoMPage() {
  const boms = await prisma.bom.findMany({
    include: {
      product: true,
      items: {
        include: {
          component: true,
        },
      },
    },
  });

  return (
    <div className="erp-page">
      <PageHeader
        title="Bills of Materials"
        description="Manage recipes and required components for your manufactured goods."
        actions={
          <Link href="/bom/new" className={cn(buttonVariants(), "bg-[#820AD1] hover:bg-[#9013D8]")}>
            <Plus className="w-4 h-4 mr-2" />
            Create BoM
          </Link>
        }
      />
      <div className="mt-6 border border-[#E0E0E0] rounded-xl bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#F5F2F8]/50 text-[#595959] font-medium border-b border-[#E0E0E0]">
              <tr>
                <th className="px-4 py-3">BoM Name</th>
                <th className="px-4 py-3">Finished Good</th>
                <th className="px-4 py-3">Components</th>
                <th className="px-4 py-3 text-right">Total Components</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0E0E0]">
              {boms.map((bom) => (
                <tr key={bom.id} className="hover:bg-[#F5F2F8]/30 transition-colors">
                  <td className="px-4 py-4 font-medium text-[#1A1A1A]">
                    {bom.name}
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-medium text-[#1A1A1A]">{bom.product.name}</div>
                    <div className="text-xs text-[#8C8C8C]">{bom.product.sku}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-1">
                      {bom.items.map((item) => (
                        <Badge key={item.id} variant="secondary" className="bg-[#F5F2F8] text-[#595959] text-xs">
                          {item.quantity}x {item.component.name}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right font-medium text-[#1A1A1A]">
                    {bom.items.length}
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
