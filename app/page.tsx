export default function HomePage() {
  return (
    <main className="page">
      <style>{`
        html,
        body {
          width: 100%;
          max-width: 100%;
          overflow-x: hidden;
          margin: 0;
          padding: 0;
        }

        * {
          box-sizing: border-box;
        }

        body {
          background: #020617;
        }

        .page {
          width: 100%;
          max-width: 100%;
          overflow-x: hidden;
          min-height: 100vh;
          background:
            radial-gradient(circle at top left, rgba(34,197,94,0.22), transparent 30%),
            radial-gradient(circle at bottom right, rgba(168,85,247,0.16), transparent 28%),
            linear-gradient(180deg, #020617 0%, #030712 100%);
          color: #ffffff;
          padding: 14px;
          font-family: Arial, sans-serif;
        }

        .container {
          width: 100%;
          max-width: 980px;
          margin: 0 auto;
          overflow: hidden;
        }

        .hero {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 8px 0 4px;
        }

        .main-logo {
          width: 110px;
          max-width: 100%;
          height: auto;
          object-fit: contain;
          margin-bottom: 10px;
        }

        .title {
          max-width: 100%;
          font-size: clamp(30px, 9vw, 64px);
          font-weight: 900;
          line-height: 0.95;
          letter-spacing: -1.2px;
          margin: 0 0 10px;
          text-shadow: 0 2px 12px rgba(0,0,0,0.7);
          overflow-wrap: break-word;
        }

        .subtitle {
          color: #d1d5db;
          font-size: clamp(15px, 2vw, 22px);
          margin: 0 0 18px;
        }

        .green {
          color: #4ade80;
        }

        .stats {
          text-align: center;
          color: #d1d5db;
          font-size: 14px;
          font-weight: 700;
          margin-bottom: 24px;
          line-height: 1.5;
        }

        .stats span {
          color: #4ade80;
          margin: 0 8px;
        }

        .hosted {
          margin-bottom: 22px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .hosted-label {
          font-size: 9px;
          letter-spacing: 4px;
          color: #9ca3af;
          font-weight: 900;
          margin-bottom: 8px;
        }

        .padelup {
          width: 95px;
          max-width: 100%;
          height: auto;
          object-fit: contain;
          margin-bottom: 6px;
          opacity: 0.96;
        }

        .location {
          color: #cbd5e1;
          font-size: 12px;
        }

        .cards {
          width: 100%;
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }

        .card {
          min-width: 0;
          position: relative;
          overflow: hidden;
          border-radius: 26px;
          min-height: 260px;
          text-decoration: none;
          color: #ffffff;
          border: 1px solid rgba(74,222,128,0.42);
          box-shadow: 0 18px 60px rgba(0,0,0,0.52);
        }

        .card img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          z-index: 0;
        }

        .mens-img {
          object-position: center;
        }

        .ladies-img {
          object-position: center;
          filter: brightness(1.08);
        }

        .overlay {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(
              90deg,
              rgba(2,6,23,0.94) 0%,
              rgba(2,6,23,0.52) 50%,
              rgba(2,6,23,0.86) 100%
            ),
            linear-gradient(
              180deg,
              rgba(2,6,23,0.05) 0%,
              rgba(2,6,23,0.94) 100%
            );
          z-index: 1;
        }

        .content {
          position: relative;
          z-index: 2;
          min-height: 260px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          min-width: 0;
        }

        .badge {
          width: fit-content;
          max-width: 100%;
          padding: 8px 16px;
          border-radius: 999px;
          background: rgba(74,222,128,0.12);
          border: 1px solid rgba(74,222,128,0.45);
          color: #86efac;
          font-size: 11px;
          font-weight: 900;
          margin-bottom: 16px;
        }

        .purple {
          background: rgba(192,132,252,0.14);
          border-color: rgba(192,132,252,0.45);
          color: #d8b4fe;
        }

        .card-title {
          font-size: clamp(26px, 4vw, 42px);
          line-height: 0.98;
          font-weight: 900;
          margin: 0 0 12px;
          text-shadow: 0 4px 20px rgba(0,0,0,0.92);
          overflow-wrap: break-word;
        }

        .accent-green {
          color: #4ade80;
        }

        .accent-purple {
          color: #c084fc;
        }

        .card-text {
          color: #f3f4f6;
          font-size: 15px;
          line-height: 1.5;
          margin: 0 0 20px;
          max-width: 380px;
        }

        .button {
          width: fit-content;
          max-width: 100%;
          padding: 14px 24px;
          border-radius: 999px;
          background: #4ade80;
          color: #02140a;
          font-weight: 900;
          font-size: 15px;
        }

        .button-purple {
          background: #c084fc;
          color: #190524;
        }

        @media (max-width: 640px) {
          .page {
            padding: 12px;
          }

          .cards {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .card {
            min-height: 235px;
            border-radius: 22px;
          }

          .content {
            min-height: 235px;
            padding: 20px;
          }

          .title {
            font-size: 34px;
          }

          .stats {
            font-size: 13px;
          }

          .card-title {
            font-size: 28px;
          }

          .card-text {
            font-size: 13px;
          }

          .button {
            padding: 13px 22px;
            font-size: 14px;
          }
        }
      `}</style>

      <div className="container">
        <section className="hero">
          <img src="/logo.png" alt="Cleveland Padel League" className="main-logo" />

          <h1 className="title">Cleveland Padel League</h1>

          <p className="subtitle">
            Competitive. Social. <span className="green">Community.</span>
          </p>

          <div className="stats">
            9 Divisions <span>•</span> 100+ Players <span>•</span> Weekly Fixtures
          </div>

          <div className="hosted">
            <div className="hosted-label">HOSTED AT</div>

            <img src="/padelup.png" alt="Padel Up" className="padelup" />

            <div className="location">Stockton-on-Tees</div>
          </div>
        </section>

        <section className="cards">
          <a href="/league?league=mens&division=1" className="card">
            <img src="/mens-league.jpg" alt="Men / Mixed League" className="mens-img" />

            <div className="overlay" />

            <div className="content">
              <div className="badge">6 DIVISIONS</div>

              <h2 className="card-title">
                Men / Mixed <br />
                <span className="accent-green">League</span>
              </h2>

              <p className="card-text">
                Competitive matches.
                <br />
                Climb the table and battle for the title.
              </p>

              <div className="button">View League →</div>
            </div>
          </a>

          <a href="/league?league=ladies&division=31" className="card">
            <img src="/ladies-league.jpg" alt="Ladies / Mixed League" className="ladies-img" />

            <div className="overlay" />

            <div className="content">
              <div className="badge purple">2 DIVISIONS</div>

              <h2 className="card-title">
                Ladies / Mixed <br />
                <span className="accent-purple">League</span>
              </h2>

              <p className="card-text">
                Fun, social and competitive.
                <br />
                Join the growing community.
              </p>

              <div className="button button-purple">View League →</div>
            </div>
          </a>
        </section>
      </div>
    </main>
  );
}