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

    const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
      expand: ["line_items"],
    });

    const quantity = fullSession.line_items?.data?.[0]?.quantity || 1;

    const currentPaymentId = Number(session.metadata?.current_payment_id);
    const nextPaymentId = Number(session.metadata?.next_payment_id);

    const paymentIdsToUpdate = [currentPaymentId].filter(Boolean);

    if (quantity >= 2 && nextPaymentId) {
      paymentIdsToUpdate.push(nextPaymentId);
    }

    if (paymentIdsToUpdate.length > 0) {
      await supabase
        .from("fixture_payments")
        .update({
          amount_paid: 11,
          status: "paid",
        })
        .in("id", paymentIdsToUpdate);
    }
  }

  return NextResponse.json({ received: true });
}