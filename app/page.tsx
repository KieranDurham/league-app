export default function HomePage() {
  return (
    <>
      <style jsx>{`
        .page {
          min-height: 100vh;
          background:
            radial-gradient(circle at top left, rgba(34,197,94,0.18), transparent 22%),
            radial-gradient(circle at top right, rgba(59,130,246,0.15), transparent 28%),
            linear-gradient(180deg, #020617 0%, #071226 100%);
          color: white;
          padding: 28px 20px 60px;
          font-family: Arial, sans-serif;
          overflow-x: hidden;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .hero {
          text-align: center;
          margin-bottom: 50px;
          position: relative;
        }

        .logo {
          width: 130px;
          height: 130px;
          object-fit: contain;
          border-radius: 26px;
          background: rgba(255,255,255,0.08);
          padding: 14px;
          border: 1px solid rgba(255,255,255,0.1);
          margin-bottom: 20px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.35);
        }

        .title {
          font-size: clamp(42px, 7vw, 92px);
          font-weight: 900;
          line-height: 1;
          margin-bottom: 18px;
          letter-spacing: -2px;
        }

        .subtitle {
          font-size: clamp(18px, 2vw, 32px);
          color: rgba(255,255,255,0.88);
          margin-bottom: 20px;
        }

        .subtitle span {
          color: #4ade80;
        }

        .mini-links {
          display: flex;
          justify-content: center;
          gap: 18px;
          flex-wrap: wrap;
          font-size: 15px;
          color: rgba(255,255,255,0.72);
          margin-top: 12px;
        }

        .cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 26px;
          margin-top: 40px;
        }

        .card {
          position: relative;
          overflow: hidden;
          border-radius: 28px;
          min-height: 460px;
          padding: 28px;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          border: 1px solid rgba(74,222,128,0.32);
          transition: all 0.3s ease;
          text-decoration: none;
          color: white;
          box-shadow: 0 20px 40px rgba(0,0,0,0.35);
        }

        .card:hover {
          transform: translateY(-6px);
          border-color: rgba(74,222,128,0.8);
          box-shadow: 0 25px 60px rgba(34,197,94,0.18);
        }

        .mens-card {
          background:
            linear-gradient(to top, rgba(2,6,23,0.90), rgba(2,6,23,0.45)),
            url("/league-cards.jpg");

          background-size: cover;
          background-position: left center;
          background-repeat: no-repeat;
        }

        .ladies-card {
          background:
            linear-gradient(to top, rgba(2,6,23,0.90), rgba(2,6,23,0.45)),
            url("/league-cards.jpg");

          background-size: cover;
          background-position: right center;
          background-repeat: no-repeat;
        }

        .badge {
          position: absolute;
          top: 24px;
          left: 24px;
          background: rgba(2,6,23,0.82);
          border: 1px solid #4ade80;
          color: #86efac;
          padding: 8px 14px;
          border-radius: 999px;
          font-size: 13px;
          font-weight: bold;
          backdrop-filter: blur(8px);
        }

        .card h2 {
          font-size: clamp(34px, 4vw, 54px);
          margin-bottom: 14px;
          line-height: 1;
          font-weight: 900;
        }

        .card p {
          font-size: 20px;
          line-height: 1.5;
          color: rgba(255,255,255,0.88);
          max-width: 420px;
          margin-bottom: 26px;
        }

        .button {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: rgba(2,6,23,0.84);
          border: 1px solid #4ade80;
          color: #86efac;
          padding: 14px 24px;
          border-radius: 999px;
          font-weight: bold;
          font-size: 16px;
          width: fit-content;
          transition: all 0.2s ease;
        }

        .button:hover {
          background: #4ade80;
          color: #02110a;
        }

        .stats {
          margin-top: 34px;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 18px;
        }

        .stat {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 22px;
          padding: 24px;
          text-align: center;
          backdrop-filter: blur(12px);
        }

        .stat-number {
          font-size: 34px;
          font-weight: 900;
          color: #4ade80;
          margin-bottom: 8px;
        }

        .stat-label {
          color: rgba(255,255,255,0.72);
          font-size: 15px;
        }

        .footer {
          margin-top: 60px;
          text-align: center;
          color: rgba(255,255,255,0.55);
          font-size: 14px;
        }

        @media (max-width: 768px) {
          .page {
            padding: 20px 14px 40px;
          }

          .cards {
            grid-template-columns: 1fr;
          }

          .card {
            min-height: 380px;
            padding: 22px;
          }

          .card h2 {
            font-size: 38px;
          }

          .card p {
            font-size: 17px;
          }

          .mini-links {
            gap: 12px;
            font-size: 14px;
          }

          .logo {
            width: 100px;
            height: 100px;
          }
        }
      `}</style>

      <main className="page">
        <div className="container">

          <section className="hero">
            <img
              src="/logo.png"
              alt="Cleveland Padel League"
              className="logo"
            />

            <h1 className="title">
              Cleveland Padel League
            </h1>

            <p className="subtitle">
              Competitive. Social. <span>Community.</span>
            </p>

            <div className="mini-links">
              <span>📅 Fixtures</span>
              <span>|</span>
              <span>🏆 Results & Tables</span>
              <span>|</span>
              <span>💳 Payments</span>
            </div>
          </section>

          <section className="cards">

            <a
              href="/league?league=mens"
              className="card mens-card"
            >
              <div className="badge">
                6 DIVISIONS
              </div>

              <h2>
                Men / Mixed League
              </h2>

              <p>
                Competitive matches. Great people.
                Climb the table and be the champion.
              </p>

              <div className="button">
                View League →
              </div>
            </a>

            <a
              href="/league?league=ladies"
              className="card ladies-card"
            >
              <div className="badge">
                3 DIVISIONS
              </div>

              <h2>
                Ladies / Mixed League
              </h2>

              <p>
                Fun, social and competitive.
                Join, play and enjoy the game.
              </p>

              <div className="button">
                View League →
              </div>
            </a>

          </section>

          <section className="stats">

            <div className="stat">
              <div className="stat-number">
                170+
              </div>

              <div className="stat-label">
                Players
              </div>
            </div>

            <div className="stat">
              <div className="stat-number">
                Weekly
              </div>

              <div className="stat-label">
                Fixtures
              </div>
            </div>

            <div className="stat">
              <div className="stat-number">
                Live
              </div>

              <div className="stat-label">
                Tables
              </div>
            </div>

            <div className="stat">
              <div className="stat-number">
                Secure
              </div>

              <div className="stat-label">
                Payments
              </div>
            </div>

          </section>

          <footer className="footer">
            Cleveland Padel League © 2026
          </footer>

        </div>
      </main>
    </>
  );
}