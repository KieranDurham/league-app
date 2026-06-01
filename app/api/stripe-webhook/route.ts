import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabase } from "@/lib/supabase";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return new NextResponse("Missing Stripe signature", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (err) {
    console.error("Webhook signature error:", err);
    return new NextResponse("Webhook Error", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const paymentIds =
      session.metadata?.payment_ids
        ?.split(",")
        .map((id) => Number(id.trim()))
        .filter(Boolean) || [];

    if (paymentIds.length > 0) {
      const { error } = await supabase
        .from("fixture_payments")
        .update({
          amount_paid: 11,
          status: "paid",
        })
        .in("id", paymentIds);

      if (error) {
        console.error("Supabase payment update error:", error);
        return new NextResponse("Payment update failed", { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}