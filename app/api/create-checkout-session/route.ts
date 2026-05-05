import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const paymentId = formData.get("payment_id");
    const amount = Number(formData.get("amount"));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",

      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: {
              name: "Match Fee",
            },
            unit_amount: amount * 100,
          },
          quantity: 1,
        },
      ],

      success_url: `http://localhost:3000/api/payment-success?payment_id=${paymentId}`,
      cancel_url: "http://localhost:3000?cancelled=true",

      metadata: {
        payment_id: String(paymentId),
      },
    });

    return Response.redirect(session.url as string, 303);
  } catch (error) {
    console.error("STRIPE ERROR:", error);
    return new NextResponse("Error creating checkout", { status: 500 });
  }
}