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
          padding: 12px;
          font-family: Arial, sans-serif;
        }

        .container {
          max-width: 980px;
          margin: 0 auto;
        }

        .hero {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 10px 0 4px;
        }

        .main-logo {
          width: 110px;
          height: 110px;
          object-fit: contain;
          border-radius: 28px;
          background: transparent;
          margin-bottom: 18px;

          box-shadow:
            0 0 50px rgba(74,222,128,0.35),
            0 0 100px rgba(74,222,128,0.18);
        }

        .title {
          font-size: clamp(31px, 6vw, 62px);
          font-weight: 900;
          line-height: 0.92;
          letter-spacing: -1px;
          margin: 0 0 8px;

          text-shadow:
            0 2px 12px rgba(0,0,0,0.65);
        }

        .subtitle {
          color: #d1d5db;
          font-size: clamp(14px, 2vw, 20px);
          margin: 0 0 14px;
        }

        .green {
          color: #4ade80;
        }

        .stats {
          text-align: center;
          color: #9ca3af;
          font-size: 13px;
          font-weight: 700;
          margin-bottom: 18px;
        }

        .hosted {
          margin-bottom: 14px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .hosted-label {
          font-size: 8px;
          letter-spacing: 3px;
          color: #9ca3af;
          font-weight: 900;
          margin-bottom: 6px;
        }

        .padelup {
          width: 95px;
          object-fit: contain;
          margin-bottom: 6px;
          opacity: 0.95;
        }

        .location {
          color: #cbd5e1;
          font-size: 11px;
        }

        .cards {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
          margin-top: 10px;
        }

        .card {
          position: relative;
          overflow: hidden;
          border-radius: 24px;
          min-height: 220px;
          text-decoration: none;
          color: #ffffff;

          border: 1px solid rgba(74,222,128,0.35);

          box-shadow:
            0 18px 50px rgba(0,0,0,0.42);

          transition:
            transform 0.25s ease,
            border 0.25s ease,
            box-shadow 0.25s ease;

          backdrop-filter: blur(12px);
        }

        .card:hover {
          transform: translateY(-4px);

          border-color: rgba(74,222,128,0.85);

          box-shadow:
            0 24px 70px rgba(34,197,94,0.22);
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
          object-position: 18% center;
        }

        .ladies-img {
          object-position: 82% center;
        }

        .overlay {
          position: absolute;
          inset: 0;

          background:
            linear-gradient(
              90deg,
              rgba(2,6,23,0.96) 0%,
              rgba(2,6,23,0.68) 48%,
              rgba(2,6,23,0.90) 100%
            ),

            linear-gradient(
              180deg,
              rgba(2,6,23,0.18) 0%,
              rgba(2,6,23,0.96) 100%
            );

          backdrop-filter: blur(2px);

          z-index: 1;
        }

        .content {
          position: relative;
          z-index: 2;
          min-height: 220px;
          padding: 18px;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
        }

        .badge {
          width: fit-content;
          padding: 6px 12px;
          border-radius: 999px;

          background: rgba(74,222,128,0.14);

          border: 1px solid rgba(74,222,128,0.55);

          color: #86efac;

          font-size: 10px;
          font-weight: 900;

          margin-bottom: 12px;

          backdrop-filter: blur(8px);
        }

        .purple {
          background: rgba(192,132,252,0.14);
          border-color: rgba(192,132,252,0.55);
          color: #d8b4fe;
        }

        .card-title {
          font-size: clamp(24px, 4vw, 34px);
          line-height: 0.95;
          font-weight: 900;
          margin: 0 0 8px;

          text-shadow:
            0 2px 8px rgba(0,0,0,0.9),
            0 0 20px rgba(0,0,0,0.6);
        }

        .card-text {
          color: #f3f4f6;
          font-size: 13px;
          line-height: 1.35;
          margin: 0 0 14px;
          max-width: 390px;

          text-shadow:
            0 2px 6px rgba(0,0,0,0.85);
        }

        .button {
          width: fit-content;

          padding: 10px 18px;

          border-radius: 999px;

          background: #4ade80;

          color: #02140a;

          font-weight: 900;
          font-size: 13px;

          box-shadow:
            0 8px 30px rgba(74,222,128,0.35);

          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;
        }

        .button:hover {
          box-shadow:
            0 10px 40px rgba(74,222,128,0.55);
        }

        .button:active {
          transform: scale(0.96);
        }

        .button-purple {
          background: #c084fc;
          color: #190524;

          box-shadow:
            0 8px 30px rgba(192,132,252,0.35);
        }

        .button-purple:hover {
          box-shadow:
            0 10px 40px rgba(192,132,252,0.55);
        }

        @media (max-width: 640px) {
          .page {
            padding: 12px;
          }

          .main-logo {
            width: 95px;
            height: 95px;
          }

          .cards {
            grid-template-columns: 1fr;
            gap: 14px;
          }

          .card {
            min-height: 210px;
            border-radius: 22px;
          }

          .content {
            min-height: 210px;
            padding: 18px;
          }

          .card-title {
            font-size: 24px;
          }

          .card-text {
            font-size: 12px;
            margin-bottom: 14px;
          }

          .button {
            padding: 10px 18px;
            font-size: 12px;
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

          <div className="stats">
            9 Divisions • 100+ Players • Weekly Fixtures
          </div>

          <div className="hosted">
            <div className="hosted-label">HOSTED AT</div>

            <img
              src="/padelup.png"
              alt="Padel Up"
              className="padelup"
            />

            <div className="location">Stockton-on-Tees</div>
          </div>
        </section>

        <section className="cards">
          <a href="/league?league=mens&division=1" className="card">
            <img
              src="/league-cards.jpg"
              alt="Men / Mixed League"
              className="mens-img"
            />

            <div className="overlay" />

            <div className="content">
              <div className="badge">6 DIVISIONS</div>

              <h2 className="card-title">
                Men / Mixed League
              </h2>

              <p className="card-text">
                Competitive matches. Climb the table and battle for the title.
              </p>

              <div className="button">
                View League →
              </div>
            </div>
          </a>

          <a href="/league?league=ladies&division=7" className="card">
            <img
              src="/league-cards.jpg"
              alt="Ladies / Mixed League"
              className="ladies-img"
            />

            <div className="overlay" />

            <div className="content">
              <div className="badge purple">
                3 DIVISIONS
              </div>

              <h2 className="card-title">
                Ladies / Mixed League
              </h2>

              <p className="card-text">
                Fun, social and competitive. Join the growing community.
              </p>

              <div className="button button-purple">
                View League →
              </div>
            </div>
          </a>
        </section>
      </div>
    </main>
  );
}