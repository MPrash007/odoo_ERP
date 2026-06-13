import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth";
import { ProcurementService } from "@/services/procurement.service";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requirePermission("sales-orders", "manage");
    const { id } = await params;

    const results = await ProcurementService.processSalesOrderConfirmation(id, user.id);

    return NextResponse.json({
      success: true,
      message: "Sales order confirmed. Procurement triggered.",
      procurement: results,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Confirmation failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
