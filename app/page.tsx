export default function HomePage() {
  return (
    <main className="page">
      <style>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          background: #020617;
        }

        .page {
          min-height: 100vh;
          background:
            radial-gradient(circle at top left, rgba(34,197,94,0.22), transparent 30%),
            radial-gradient(circle at bottom right, rgba(192,132,252,0.14), transparent 28%),
            linear-gradient(180deg, #020617 0%, #030712 100%);
          color: #ffffff;
          padding: 18px;
          font-family: Arial, sans-serif;
        }

        .container {
          max-width: 980px;
          margin: 0 auto;
        }

        .hero {
          text-align: center;
          padding: 10px 0 18px;
        }

        .main-logo {
          width: 96px;
          height: 96px;
          object-fit: cover;
          border-radius: 22px;
          background: #ffffff;
          margin-bottom: 14px;
          box-shadow: 0 18px 50px rgba(0,0,0,0.42);
        }

        .title {
          font-size: clamp(34px, 6vw, 66px);
          font-weight: 900;
          line-height: 0.95;
          letter-spacing: -1.5px;
          margin: 0 0 10px;
        }

        .subtitle {
          color: #d1d5db;
          font-size: clamp(15px, 2vw, 22px);
          margin: 0 0 14px;
        }

        .green {
          color: #4ade80;
        }

        .hosted {
          margin-bottom: 14px;
        }

        .hosted-label {
          font-size: 10px;
          letter-spacing: 3px;
          color: #9ca3af;
          font-weight: 900;
          margin-bottom: 6px;
        }

        .padelup {
          width: 105px;
          object-fit: contain;
          margin-bottom: 4px;
        }

        .location {
          color: #cbd5e1;
          font-size: 12px;
        }

        .cards {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          margin-top: 10px;
        }

        .card {
          position: relative;
          overflow: hidden;
          border-radius: 24px;
          min-height: 235px;
          text-decoration: none;
          color: #ffffff;
          border: 1px solid rgba(74,222,128,0.35);
          box-shadow: 0 18px 50px rgba(0,0,0,0.42);
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
          object-position: left center;
        }

        .ladies-img {
          object-position: right center;
        }

        .overlay {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(180deg, rgba(2,6,23,0.10) 0%, rgba(2,6,23,0.94) 82%);
          z-index: 1;
        }

        .content {
          position: relative;
          z-index: 2;
          min-height: 235px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
        }

        .badge {
          width: fit-content;
          padding: 6px 10px;
          border-radius: 999px;
          background: rgba(74,222,128,0.14);
          border: 1px solid rgba(74,222,128,0.55);
          color: #86efac;
          font-size: 11px;
          font-weight: 900;
          margin-bottom: 10px;
        }

        .purple {
          background: rgba(192,132,252,0.14);
          border-color: rgba(192,132,252,0.55);
          color: #d8b4fe;
        }

        .card-title {
          font-size: clamp(25px, 4vw, 36px);
          line-height: 1;
          font-weight: 900;
          margin: 0 0 8px;
        }

        .card-text {
          color: #e5e7eb;
          font-size: 14px;
          line-height: 1.35;
          margin: 0 0 14px;
          max-width: 390px;
        }

        .button {
          width: fit-content;
          padding: 10px 16px;
          border-radius: 999px;
          background: #4ade80;
          color: #02140a;
          font-weight: 900;
          font-size: 13px;
        }

        .button-purple {
          background: #c084fc;
          color: #190524;
        }

        .features {
          margin-top: 16px;
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 9px;
        }

        .feature {
          padding: 8px 12px;
          border-radius: 999px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.10);
          color: #d1d5db;
          font-size: 13px;
          font-weight: 800;
        }

        @media (max-width: 640px) {
          .page {
            padding: 12px;
          }

          .hero {
            padding: 4px 0 12px;
          }

          .main-logo {
            width: 72px;
            height: 72px;
            border-radius: 16px;
            margin-bottom: 10px;
          }

          .title {
            font-size: 31px;
            letter-spacing: -1px;
            margin-bottom: 7px;
          }

          .subtitle {
            font-size: 14px;
            margin-bottom: 10px;
          }

          .hosted {
            margin-bottom: 10px;
          }

          .hosted-label {
            font-size: 8px;
            letter-spacing: 2.5px;
            margin-bottom: 4px;
          }

          .padelup {
            width: 78px;
          }

          .location {
            font-size: 10px;
          }

          .cards {
            grid-template-columns: 1fr;
            gap: 10px;
            margin-top: 6px;
          }

          .card {
            min-height: 175px;
            border-radius: 18px;
          }

          .content {
            min-height: 175px;
            padding: 16px;
          }

          .badge {
            font-size: 10px;
            padding: 5px 9px;
            margin-bottom: 8px;
          }

          .card-title {
            font-size: 24px;
            margin-bottom: 6px;
          }

          .card-text {
            font-size: 12px;
            line-height: 1.3;
            margin-bottom: 10px;
          }

          .button {
            padding: 8px 13px;
            font-size: 12px;
          }

          .features {
            margin-top: 11px;
            gap: 6px;
          }

          .feature {
            padding: 6px 9px;
            font-size: 11px;
          }

          .mens-img {
            object-position: 30% center;
          }

          .ladies-img {
            object-position: 72% center;
          }
        }
      `}</style>

      <div className="container">
        <section className="hero">
          <img
            src="/logo.png"
            alt="Cleveland Padel League"
            className="main-logo"
          />

          <h1 className="title">Cleveland Padel League</h1>

          <p className="subtitle">
            Competitive. Social. <span className="green">Community.</span>
          </p>

          <div className="hosted">
            <div className="hosted-label">HOSTED AT</div>
            <img src="/padelup.png" alt="Padel Up" className="padelup" />
            <div className="location">Stockton-on-Tees</div>
          </div>
        </section>

        <section className="cards">
          <a href="/league?league=mens" className="card">
            <img
              src="/league-cards.jpg"
              alt="Men / Mixed League"
              className="mens-img"
            />

            <div className="overlay" />

            <div className="content">
              <div className="badge">6 DIVISIONS</div>

              <h2 className="card-title">Men / Mixed League</h2>

              <p className="card-text">
                Competitive matches. Climb the table and battle for the title.
              </p>

              <div className="button">View League →</div>
            </div>
          </a>

          <a href="/league?league=ladies" className="card">
            <img
              src="/league-cards.jpg"
              alt="Ladies / Mixed League"
              className="ladies-img"
            />

            <div className="overlay" />

            <div className="content">
              <div className="badge purple">3 DIVISIONS</div>

              <h2 className="card-title">Ladies / Mixed League</h2>

              <p className="card-text">
                Fun, social and competitive. Join the growing community.
              </p>

              <div className="button button-purple">View League →</div>
            </div>
          </a>
        </section>

        <div className="features">
          <div className="feature">Fixtures</div>
          <div className="feature">Results & Tables</div>
          <div className="feature">Payments</div>
        </div>
      </div>
    </main>
  );
}