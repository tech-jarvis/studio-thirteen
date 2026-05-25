import { NextResponse } from "next/server";
import { getPaymentAccountDetails } from "@/lib/payment-details";

export async function GET() {
  return NextResponse.json(getPaymentAccountDetails());
}
