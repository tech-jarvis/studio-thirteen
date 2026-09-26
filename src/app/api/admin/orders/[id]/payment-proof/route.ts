import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getOrderById } from "@/lib/store";
import { paymentProofUrl } from "@/lib/storage/uploads";

export const runtime = "nodejs";

/** Admin-only: redirect to a short-lived URL for an order's payment screenshot. */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  try {
    const order = await getOrderById(id);
    if (!order?.paymentScreenshot) {
      return NextResponse.json({ error: "No payment proof" }, { status: 404 });
    }
    const url = await paymentProofUrl(order.paymentScreenshot);
    const response = NextResponse.redirect(new URL(url, request.url));
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  } catch {
    return NextResponse.json({ error: "Failed to load payment proof" }, { status: 500 });
  }
}
