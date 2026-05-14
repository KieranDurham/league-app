import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabase } from "@/lib/supabase";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const paymentIdsRaw = String(formData.get("payment_ids") || "");
    const paymentIds = paymentIdsRaw
      .split(",")
      .map((id) => Number(id.trim()))
      .filter(Boolean);

    if (!paymentIds.length) {
      return new NextResponse("No payment IDs provided", { status: 400 });
    }

    const currentPaymentId = paymentIds[0];

    const { data: currentPayment } = await supabase
      .from("fixture_payments")
      .select("*, fixtures(*)")
      .eq("id", currentPaymentId)
      .single();

    let nextPaymentId = "";

    if (currentPayment) {
      const currentRound = Number(currentPayment.fixtures?.round || 0);
      const divisionId = Number(currentPayment.fixtures?.division_id || 0);

      const { data: nextPayments } = await supabase
        .from("fixture_payments")
        .select("*, fixtures(*)")
        .eq("player_name", currentPayment.player_name)
        .eq("team_id", currentPayment.team_id)
        .eq("status", "unpaid");

      const nextPayment = nextPayments
        ?.filter(
          (payment: any) =>
            Number(payment.id) !== Number(currentPaymentId) &&
            Number(payment.fixtures?.division_id) === divisionId &&
            Number(payment.fixtures?.round) > currentRound
        )
        .sort(
          (a: any, b: any) =>
            Number(a.fixtures?.round) - Number(b.fixtures?.round)
        )[0];

      if (nextPayment) {
        nextPaymentId = String(nextPayment.id);
      }
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",

      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: {
              name: "Match Fee - select 1 or 2 rounds",
            },
            unit_amount: 1100,
          },
          quantity: 1,
          adjustable_quantity: {
            enabled: true,
            minimum: 1,
            maximum: nextPaymentId ? 2 : 1,
          },
        },
      ],

      success_url: "https://league-app-plum.vercel.app/payment-success",
      cancel_url: "https://league-app-plum.vercel.app?cancelled=true",

      metadata: {
        current_payment_id: String(currentPaymentId),
        next_payment_id: nextPaymentId,
      },
    });

    return Response.redirect(session.url as string, 303);
  } catch (error) {
    console.error("STRIPE ERROR:", error);
    return new NextResponse("Error creating checkout", { status: 500 });
  }
}