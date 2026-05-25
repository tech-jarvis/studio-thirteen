import { NextRequest, NextResponse } from "next/server";
import { attachOrderPaymentProof, getOrderById } from "@/lib/store";
import { uploadPaymentProofLocal } from "@/lib/storage/local";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const order = await getOrderById(id);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    if (order.paymentMethod !== "online") {
      return NextResponse.json({ error: "This order does not require online payment" }, { status: 400 });
    }
    if (order.paymentScreenshot) {
      return NextResponse.json({ error: "Payment proof already submitted" }, { status: 400 });
    }

    const formData = await request.formData();
    const file = formData.get("screenshot");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "Screenshot is required" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Max file size is 5MB" }, { status: 400 });
    }

    const { url } = await uploadPaymentProofLocal(file);
    const updated = await attachOrderPaymentProof(id, url);

    return NextResponse.json(updated);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
