if (event.type === "checkout.session.completed") {
  const session = event.data.object as Stripe.Checkout.Session;

  const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
    expand: ["line_items"],
  });

  const quantity =
    fullSession.line_items?.data?.[0]?.quantity || 1;

  const currentPaymentId = Number(session.metadata?.current_payment_id);
  const nextPaymentId = Number(session.metadata?.next_payment_id);

  const paymentIdsToUpdate = [currentPaymentId];

  if (quantity >= 2 && nextPaymentId) {
    paymentIdsToUpdate.push(nextPaymentId);
  }

  await supabase
    .from("fixture_payments")
    .update({
      amount_paid: 11,
      status: "paid",
    })
    .in("id", paymentIdsToUpdate);
}