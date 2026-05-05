import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const paymentId = searchParams.get("payment_id");

  if (paymentId) {
    const { error } = await supabase
      .from("fixture_payments")
      .update({
        amount_paid: 11,
        status: "paid",
      })
      .eq("id", Number(paymentId));

    if (error) {
      console.error("PAYMENT SUCCESS UPDATE ERROR:", error);
    }
  }

  return NextResponse.redirect("http://localhost:3000");
}