import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function SummaryPage({
  searchParams,
}: {
  searchParams?: Promise<{ round?: string; view?: string }>;
}) {
  const params = await searchParams;
  const selectedRound = Number(params?.round || 1);
  const isScreenshot = params?.view === "screenshot";

  const { data: divisions } = await supabase
    .from("divisions")
    .select("*")
    .order("id", { ascending: true });

  const { data: teams } = await supabase.from("teams").select("*");

  const { data: fixtures } = await supabase
    .from("fixtures")
    .select("*")
    .eq("round", selectedRound)
    .order("division_id", { ascending: true });

  const { data: allFixtures } = await supabase
    .from("fixtures")
    .select("round")
    .order("round", { ascending: true });

  const availableRounds = Array.from(
    new Set((allFixtures || []).map((f: any) => f.round || 1))
  ).sort((a: any, b: any) => a - b);

  const getTeamName = (id: number) => {
    return teams?.find((t: any) => t.id === id)?.name || "Unknown";
  };

  return (
    <main className={isScreenshot ? "summary-page screenshot" : "summary-page"}>
      <style>{`
        .summary-page {
          padding: 14px;
          background: #e9e9e9;
          min-height: 100vh;
          font-family: Arial, sans-serif;
          color: #000;
        }

        .top-bar {
          max-width: 1080px;
          margin: 0 auto 12px auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
        }

        .main-card {
          max-width: 1080px;
          margin: 0 auto;
          background: #ffffff;
          border-radius: 22px;
          padding: 14px;
          border: 4px solid #000;
        }

        .summary-title {
          background: #000;
          color: #fff;
          border-radius: 16px;
          padding: 14px;
          text-align: center;
          margin-bottom: 14px;
        }

        .summary-title h1 {
          margin: 0;
          font-size: 30px;
        }

        .summary-title p {
          margin: 0;
          opacity: 0.8;
          font-size: 13px;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        .division-card {
          border-radius: 18px;
          overflow: hidden;
          background: #fff;
        }

        .division-header {
          height: 132px;
          padding: 10px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .division-logo {
          width: 58px;
          height: 58px;
          object-fit: contain;
        }

        .division-header h2 {
          margin: 0;
          font-size: 22px;
          font-weight: 900;
          text-transform: uppercase;
          text-align: center;
        }

        .fixture-body {
          padding: 10px 12px;
        }

        .fixture-item {
          border-bottom: 1px solid #ddd;
          padding: 8px 0;
        }

        .fixture-row {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 54px minmax(0, 1fr);
          align-items: center;
          gap: 8px;
          font-weight: 900;
          color: #000;
        }

        .team-name {
          color: #000;
          font-size: 14px;
          line-height: 1.15;
          word-break: normal;
          overflow-wrap: normal;
        }

        .team-name.right {
          text-align: right;
        }

        .score-pill {
          background: #eeeeee;
          padding: 7px 8px;
          border-radius: 999px;
          color: #000;
          font-weight: 900;
          text-align: center;
          font-size: 15px;
          white-space: nowrap;
        }

        .sets {
          text-align: center;
          font-size: 11px;
          margin-top: 5px;
          color: #333;
          white-space: nowrap;
        }

        .empty-message {
          text-align: center;
          font-weight: bold;
          color: #333;
          padding: 16px 0;
        }

        @media (max-width: 900px) {
          .summary-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 600px) {
          .summary-page {
            padding: 10px;
          }

          .top-bar {
            flex-direction: column;
            align-items: stretch;
          }

          .main-card {
            padding: 10px;
            border-radius: 20px;
          }

          .summary-grid {
            grid-template-columns: 1fr;
            gap: 14px;
          }

          .division-header {
            height: 140px;
          }

          .division-logo {
            width: 70px;
            height: 70px;
          }

          .division-header h2 {
            font-size: 26px;
          }

          .team-name {
            font-size: 15px;
          }
        }

        .screenshot {
          padding: 0;
          background: #ffffff;
        }

        .screenshot .top-bar {
          display: none;
        }

        .screenshot .main-card {
          max-width: 1040px;
          padding: 8px;
          border-radius: 0;
          border: 3px solid #000;
        }

        .screenshot .summary-title {
          display: none;
        }

        .screenshot .summary-grid {
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        .screenshot .division-card {
          border-radius: 16px;
        }

        .screenshot .division-header {
          height: 132px;
          padding: 8px;
        }

        .screenshot .division-logo {
          width: 54px;
          height: 54px;
        }

        .screenshot .division-header h2 {
          font-size: 22px;
        }

        .screenshot .fixture-body {
          padding: 8px 12px;
        }

        .screenshot .fixture-item {
          padding: 7px 0;
        }

        .screenshot .fixture-row {
          grid-template-columns: minmax(0, 1fr) 52px minmax(0, 1fr);
          gap: 7px;
        }

        .screenshot .team-name {
          font-size: 14px;
          line-height: 1.15;
        }

        .screenshot .score-pill {
          font-size: 15px;
          padding: 7px 7px;
        }

        .screenshot .sets {
          font-size: 11px;
          margin-top: 4px;
        }
      `}</style>

      <div className="top-bar">
        <a
          href="/"
          style={{
            background: "#111111",
            color: "#ffffff",
            padding: "10px 14px",
            borderRadius: "999px",
            textDecoration: "none",
            fontWeight: "bold",
            textAlign: "center",
          }}
        >
          ← Back
        </a>

        <div style={{ display: "flex", gap: "8px", overflowX: "auto" }}>
          {availableRounds.map((round: any) => (
            <a
              key={round}
              href={`/summary?round=${round}`}
              style={{
                padding: "8px 12px",
                borderRadius: "999px",
                background:
                  Number(round) === selectedRound ? "#111111" : "#ffffff",
                color: Number(round) === selectedRound ? "#ffffff" : "#000000",
                textDecoration: "none",
                fontWeight: "bold",
                border: "1px solid #ccc",
                whiteSpace: "nowrap",
              }}
            >
              R{round}
            </a>
          ))}
        </div>

        <a
          href={`/summary?round=${selectedRound}&view=screenshot`}
          style={{
            padding: "8px 12px",
            borderRadius: "999px",
            background: "#111111",
            color: "#ffffff",
            textDecoration: "none",
            fontWeight: "bold",
            whiteSpace: "nowrap",
          }}
        >
          Screenshot
        </a>
      </div>

      <section className="main-card">
        <div className="summary-title">
          <h1>WEEK {selectedRound} RESULTS</h1>
          <p>League Fixtures Summary</p>
        </div>

        <div className="summary-grid">
          {(divisions || []).map((division: any) => {
            const divisionFixtures = (fixtures || []).filter(
              (f: any) => f.division_id === division.id
            );

            return (
              <div
                key={division.id}
                className="division-card"
                style={{
                  border: `3px solid ${division.primary_color || "#000"}`,
                }}
              >
                <div
                  className="division-header"
                  style={{
                    background: division.primary_color || "#000",
                    color: division.text_color || "#fff",
                  }}
                >
                  {division.logo_url && (
                    <img
                      src={division.logo_url}
                      alt={`${division.name} logo`}
                      className="division-logo"
                    />
                  )}

                  <h2>{division.name}</h2>
                </div>

                <div className="fixture-body">
                  {divisionFixtures.length === 0 && (
                    <p className="empty-message">No fixtures for this round</p>
                  )}

                  {divisionFixtures.map((fixture: any) => (
                    <div key={fixture.id} className="fixture-item">
                      <div className="fixture-row">
                        <div className="team-name">
                          {getTeamName(fixture.home_team_id)}
                        </div>

                        <div className="score-pill">
                          {fixture.played
                            ? `${fixture.home_score} - ${fixture.away_score}`
                            : "vs"}
                        </div>

                        <div className="team-name right">
                          {getTeamName(fixture.away_team_id)}
                        </div>
                      </div>

                      {fixture.played && (
                        <div className="sets">
                          Sets: {fixture.home_set1}-{fixture.away_set1} |{" "}
                          {fixture.home_set2}-{fixture.away_set2} |{" "}
                          {fixture.home_set3}-{fixture.away_set3}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}