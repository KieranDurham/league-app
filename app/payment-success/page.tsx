export default function PaymentSuccessPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f5f5f5",
        padding: "20px",
        fontFamily: "Arial",
      }}
    >
      <div
        style={{
          background: "#ffffff",
          padding: "40px 30px",
          borderRadius: "18px",
          maxWidth: "420px",
          width: "100%",
          textAlign: "center",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        }}
      >
        <div style={{ fontSize: "64px", marginBottom: "12px" }}>✅</div>

        <h1 style={{ fontSize: "32px", marginBottom: "12px" }}>
          Payment Successful
        </h1>

        <p style={{ fontSize: "18px", color: "#555555", marginBottom: "28px" }}>
          Your fixture payment has been recorded successfully.
        </p>

        <a
          href="/"
          style={{
            display: "inline-block",
            background: "#000000",
            color: "#ffffff",
            padding: "14px 24px",
            borderRadius: "999px",
            textDecoration: "none",
            fontWeight: "bold",
          }}
        >
          Return to League
        </a>
      </div>
    </main>
  );
}