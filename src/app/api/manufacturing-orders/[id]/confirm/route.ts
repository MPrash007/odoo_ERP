import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth";
import { ManufacturingService } from "@/services/manufacturing.service";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requirePermission("manufacturing", "manage");
    const { id } = await params;
    const result = await ManufacturingService.confirmOrder(id, user.id);
    return NextResponse.json({ success: true, message: "Manufacturing order confirmed", ...result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Confirmation failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
