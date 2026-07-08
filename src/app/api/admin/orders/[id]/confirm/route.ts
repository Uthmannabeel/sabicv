import { NextRequest, NextResponse } from "next/server";
import { confirmTransfer } from "@/lib/orders/fulfil";
import { isAuthorizedAdmin } from "@/lib/admin/auth";

export const maxDuration = 300;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isAuthorizedAdmin(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;
  try {
    const order = await confirmTransfer(id);
    return NextResponse.json({ success: true, data: { status: order.status } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Confirmation failed.";
    return NextResponse.json({ success: false, error: message }, { status: 409 });
  }
}
