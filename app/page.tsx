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
          padding: 4px 0 12px;
        }

        .main-logo {
          width: 76px;
          height: 76px;
          object-fit: cover;
          border-radius: 16px;
          background: #ffffff;
          margin-bottom: 10px;
          box-shadow: 0 18px 50px rgba(0,0,0,0.42);
        }

        .title {
          font-size: clamp(31px, 6vw, 62px);
          font-weight: 900;
          line-height: 0.98;
          letter-spacing: -1px;
          margin: 0 0 7px;
        }

        .subtitle {
          color: #d1d5db;
          font-size: clamp(14px, 2vw, 20px);
          margin: 0 0 10px;
        }

        .green {
          color: #4ade80;
        }

        .hosted {
          margin-bottom: 14px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .hosted-label {
          font-size: 8px;
          letter-spacing: 2.5px;
          color: #9ca3af;
          font-weight: 900;
          margin-bottom: 4px;
        }

        .padelup {
          width: 90px;
          object-fit: contain;
          margin-bottom: 4px;
        }

        .location {
          color: #cbd5e1;
          font-size: 10px;
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
          border-radius: 22px;
          min-height: 210px;
          text-decoration: none;
          color: #ffffff;
          border: 1px solid rgba(74,222,128,0.35);
          box-shadow: 0 18px 50px rgba(0,0,0,0.42);
          transition: transform 0.25s ease, border 0.25s ease, box-shadow 0.25s ease;
        }

        .card:hover {
          transform: translateY(-4px);
          border-color: rgba(74,222,128,0.85);
          box-shadow: 0 24px 70px rgba(34,197,94,0.22);
        }

        .card img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          z-index: 0;
        }

        .overlay {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(90deg, rgba(2,6,23,0.94) 0%, rgba(2,6,23,0.70) 45%, rgba(2,6,23,0.88) 100%),
            linear-gradient(180deg, rgba(2,6,23,0.05) 0%, rgba(2,6,23,0.96) 100%);
          backdrop-filter: blur(1px);
          z-index: 1;
        }

        .content {
          position: relative;
          z-index: 2;
          min-height: 210px;
          padding: 17px;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
        }

        .badge {
          width: fit-content;
          padding: 5px 9px;
          border-radius: 999px;
          background: rgba(74,222,128,0.14);
          border: 1px solid rgba(74,222,128,0.55);
          color: #86efac;
          font-size: 10px;
          font-weight: 900;
          margin-bottom: 8px;
        }

        .purple {
          background: rgba(192,132,252,0.14);
          border-color: rgba(192,132,252,0.55);
          color: #d8b4fe;
        }

        .card-title {
          font-size: clamp(24px, 4vw, 34px);
          line-height: 1;
          font-weight: 900;
          margin: 0 0 7px;
        }

        .card-text {
          color: #e5e7eb;
          font-size: 13px;
          line-height: 1.3;
          margin: 0 0 12px;
          max-width: 390px;
        }

        .button {
          width: fit-content;
          padding: 9px 14px;
          border-radius: 999px;
          background: #4ade80;
          color: #02140a;
          font-weight: 900;
          font-size: 12px;
          box-shadow: 0 8px 30px rgba(74,222,128,0.35);
        }

        .button-purple {
          background: #c084fc;
          color: #190524;
          box-shadow: 0 8px 30px rgba(192,132,252,0.35);
        }

        @media (max-width: 640px) {
          .cards {
            grid-template-columns: 1fr;
            gap: 10px;
          }

          .card {
            min-height: 185px;
            border-radius: 18px;
          }

          .content {
            min-height: 185px;
            padding: 15px;
          }

          .card-title {
            font-size: 25px;
          }

          .card-text {
            font-size: 12px;
            margin-bottom: 10px;
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
          <a href="/league?league=mens&division=1" className="card">
            <img src="/mens-league.jpg" alt="Men / Mixed League" />

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

          <a href="/league?league=ladies&division=1" className="card">
            <img src="/ladies-league.jpg" alt="Ladies / Mixed League" />

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
      </div>
    </main>
  );
}