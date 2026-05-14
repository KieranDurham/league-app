"use client";

import { useState } from "react";

export default function PaymentButton({
  payment,
  allFixtures,
  primary,
  textColor,
}: any) {
  const [open, setOpen] = useState(false);

  const playerPayments: any[] = [];

  allFixtures.forEach((fixture: any) => {
    fixture.fixture_payments?.forEach((p: any) => {
      if (
        p.player_name === payment.player_name &&
        p.status !== "paid"
      ) {
        playerPayments.push({
          id: p.id,
          round: fixture.round,
          amount: p.amount_due,
        });
      }
    });
  });

  const sortedPayments = playerPayments.sort(
    (a, b) => a.round - b.round
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          marginTop: "8px",
          background: primary,
          color: textColor,
          border: "none",
          padding: "8px 8px",
          borderRadius: "8px",
          fontWeight: "bold",
          cursor: "pointer",
          fontSize: "13px",
          width: "100%",
          maxWidth: "120px",
        }}
      >
        Pay Selected
      </button>

      {open && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "12px",
              padding: "20px",
              width: "100%",
              maxWidth: "420px",
            }}
          >
            <h3
              style={{
                marginTop: 0,
                marginBottom: "14px",
                color: "#000",
              }}
            >
              Select Rounds To Pay
            </h3>

            <form
              action="/api/create-checkout-session"
              method="POST"
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  marginBottom: "16px",
                }}
              >
                {sortedPayments.map((p) => (
                  <label
                    key={p.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      fontWeight: "bold",
                      color: "#000",
                    }}
                  >
                    <input
                      type="checkbox"
                      name="payment_ids"
                      value={p.id}
                    />

                    Round {p.round} - £{p.amount}
                  </label>
                ))}
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                }}
              >
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid #ccc",
                    background: "#f3f4f6",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: "8px",
                    border: "none",
                    background: primary,
                    color: textColor,
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  Continue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}