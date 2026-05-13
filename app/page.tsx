export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<{ admin?: string }>;
}) {
  const params = await searchParams;
  const isAdmin = params?.admin === "true";

  const adminQuery = isAdmin ? "&admin=true" : "";

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top left, rgba(34,197,94,0.20), transparent 32%), radial-gradient(circle at bottom right, rgba(34,197,94,0.18), transparent 30%), linear-gradient(135deg, #020617 0%, #0f172a 45%, #020617 100%)",
        color: "#ffffff",
        fontFamily: "Arial, sans-serif",
        padding: "28px",
      }}
    >
      <div style={{ maxWidth: "1180px", margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "34px",
            marginBottom: "36px",
          }}
        >
          <img
            src="/logo.png"
            alt="Cleveland Padel League"
            style={{
              width: "145px",
              background: "rgba(255,255,255,0.92)",
              padding: "12px",
              borderRadius: "18px",
            }}
          />

          <div
            style={{
              height: "86px",
              width: "1px",
              background: "rgba(255,255,255,0.45)",
            }}
          />

          <img
            src="/padel-up-logo.png"
            alt="Padel Up"
            style={{
              width: "160px",
              objectFit: "contain",
            }}
          />
        </div>

        {isAdmin && (
          <div
            style={{
              maxWidth: "280px",
              margin: "0 auto 24px",
              border: "1px solid rgba(34,197,94,0.7)",
              color: "#86efac",
              padding: "10px 16px",
              borderRadius: "999px",
              textAlign: "center",
              fontWeight: "bold",
              background: "rgba(34,197,94,0.08)",
            }}
          >
            🔒 Admin View Active
          </div>
        )}

        <section style={{ textAlign: "center", marginBottom: "46px" }}>
          <h1
            style={{
              fontSize: "clamp(42px, 7vw, 76px)",
              lineHeight: "1",
              margin: "0 0 18px",
              fontWeight: "900",
              letterSpacing: "-2px",
            }}
          >
            Cleveland Padel League
          </h1>

          <p
            style={{
              fontSize: "clamp(20px, 3vw, 30px)",
              color: "#e5e7eb",
              margin: "0 0 26px",
            }}
          >
            Competitive. Social.{" "}
            <span style={{ color: "#4ade80" }}>Community.</span>
          </p>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              flexWrap: "wrap",
              gap: "18px",
              color: "#d1d5db",
              fontSize: "18px",
            }}
          >
            <span>📅 Fixtures</span>
            <span style={{ color: "#4ade80" }}>|</span>
            <span>🏆 Results & Tables</span>
            <span style={{ color: "#4ade80" }}>|</span>
            <span>💳 Payments</span>
          </div>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "24px",
            marginBottom: "34px",
          }}
        >
          <a
            href={`/league?league=mens&division=1${adminQuery}`}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div
              style={{
                minHeight: "360px",
                borderRadius: "28px",
                padding: "28px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                border: "1px solid rgba(34,197,94,0.65)",
                background:
                  "linear-gradient(to top, rgba(2,6,23,0.96), rgba(2,6,23,0.45)), radial-gradient(circle at top right, rgba(34,197,94,0.32), transparent 35%), linear-gradient(135deg, #111827, #1e293b)",
                boxShadow: "0 0 40px rgba(34,197,94,0.14)",
              }}
            >
              <div
                style={{
                  width: "fit-content",
                  border: "1px solid #4ade80",
                  color: "#86efac",
                  padding: "6px 12px",
                  borderRadius: "999px",
                  fontWeight: "bold",
                  fontSize: "13px",
                  marginBottom: "18px",
                  background: "rgba(34,197,94,0.10)",
                }}
              >
                6 DIVISIONS
              </div>

              <h2
                style={{
                  fontSize: "34px",
                  margin: "0 0 14px",
                  fontWeight: "850",
                }}
              >
                Men / Mixed League
              </h2>

              <p
                style={{
                  color: "#d1d5db",
                  fontSize: "18px",
                  lineHeight: "1.5",
                  maxWidth: "420px",
                  marginBottom: "24px",
                }}
              >
                Competitive matches. Great people. Climb the table and be the
                champion.
              </p>

              <div
                style={{
                  width: "fit-content",
                  border: "1px solid #4ade80",
                  color: "#4ade80",
                  padding: "12px 28px",
                  borderRadius: "999px",
                  fontWeight: "bold",
                  fontSize: "16px",
                }}
              >
                View League →
              </div>
            </div>
          </a>

          <a
            href={`/league?league=ladies&division=1${adminQuery}`}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div
              style={{
                minHeight: "360px",
                borderRadius: "28px",
                padding: "28px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                border: "1px solid rgba(34,197,94,0.65)",
                background:
                  "linear-gradient(to top, rgba(2,6,23,0.96), rgba(2,6,23,0.45)), radial-gradient(circle at top right, rgba(34,197,94,0.32), transparent 35%), linear-gradient(135deg, #1e1b4b, #111827)",
                boxShadow: "0 0 40px rgba(34,197,94,0.14)",
              }}
            >
              <div
                style={{
                  width: "fit-content",
                  border: "1px solid #4ade80",
                  color: "#86efac",
                  padding: "6px 12px",
                  borderRadius: "999px",
                  fontWeight: "bold",
                  fontSize: "13px",
                  marginBottom: "18px",
                  background: "rgba(34,197,94,0.10)",
                }}
              >
                3 DIVISIONS
              </div>

              <h2
                style={{
                  fontSize: "34px",
                  margin: "0 0 14px",
                  fontWeight: "850",
                }}
              >
                Ladies / Mixed League
              </h2>

              <p
                style={{
                  color: "#d1d5db",
                  fontSize: "18px",
                  lineHeight: "1.5",
                  maxWidth: "420px",
                  marginBottom: "24px",
                }}
              >
                Fun, social and competitive. Join, play and enjoy the game.
              </p>

              <div
                style={{
                  width: "fit-content",
                  border: "1px solid #4ade80",
                  color: "#4ade80",
                  padding: "12px 28px",
                  borderRadius: "999px",
                  fontWeight: "bold",
                  fontSize: "16px",
                }}
              >
                View League →
              </div>
            </div>
          </a>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "0",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "24px",
            overflow: "hidden",
            background: "rgba(15,23,42,0.72)",
            backdropFilter: "blur(14px)",
            marginBottom: "34px",
          }}
        >
          {[
            ["👥", "170+", "Players"],
            ["📅", "Weekly", "Fixtures"],
            ["🏆", "Live", "Tables"],
            ["💳", "Secure", "Payments"],
          ].map(([icon, title, label]) => (
            <div
              key={title}
              style={{
                padding: "28px",
                textAlign: "center",
                borderRight: "1px solid rgba(255,255,255,0.10)",
              }}
            >
              <div style={{ fontSize: "34px", marginBottom: "8px" }}>
                {icon}
              </div>
              <div
                style={{
                  fontSize: "26px",
                  fontWeight: "850",
                  marginBottom: "4px",
                }}
              >
                {title}
              </div>
              <div style={{ color: "#cbd5e1", fontSize: "16px" }}>
                {label}
              </div>
            </div>
          ))}
        </section>

        <footer
          style={{
            textAlign: "center",
            padding: "30px 0 10px",
            color: "#cbd5e1",
          }}
        >
          <div
            style={{
              letterSpacing: "4px",
              fontSize: "13px",
              marginBottom: "12px",
            }}
          >
            POWERED BY
          </div>

          <img
            src="/padel-up-logo.png"
            alt="Padel Up"
            style={{
              width: "150px",
              marginBottom: "14px",
            }}
          />

          <div style={{ color: "#86efac", fontWeight: "bold" }}>
            📍 Padel Up, Middlesbrough
          </div>
        </footer>
      </div>
    </main>
  );
}