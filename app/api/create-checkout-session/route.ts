import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const paymentIds = formData
      .getAll("payment_ids")
      .map((id) => String(id).trim())
      .filter(Boolean);

    if (!paymentIds.length) {
      return new NextResponse("No payment IDs provided", { status: 400 });
    }

    const totalAmount = paymentIds.length * 11;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",

      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: {
              name:
                paymentIds.length > 1
                  ? `Match Fees - ${paymentIds.length} rounds`
                  : "Match Fee",
            },
            unit_amount: totalAmount * 100,
          },
          quantity: 1,
        },
      ],

      success_url: "https://league-app-plum.vercel.app/payment-success",
      cancel_url: "https://league-app-plum.vercel.app?cancelled=true",

      metadata: {
        payment_ids: paymentIds.join(","),
      },
    });

    return Response.redirect(session.url as string, 303);
  } catch (error) {
    console.error("STRIPE ERROR:", error);
    return new NextResponse("Error creating checkout", { status: 500 });
  }
}