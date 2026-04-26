import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function SummaryPage({
  searchParams,
}: {
  searchParams?: Promise<{ round?: string }>;
}) {
  const params = await searchParams;
  const selectedRound = Number(params?.round || 1);

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
    <main className="summary-page">
      <style>{`
        .summary-page {
          padding: 18px;
          background: #e9e9e9;
          min-height: 100vh;
          font-family: Arial, sans-serif;
          color: #000;
        }

        .top-bar {
          max-width: 1050px;
          margin: 0 auto 14px auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
        }

        .main-card {
          max-width: 1050px;
          margin: 0 auto;
          background: #ffffff;
          border-radius: 26px;
          padding: 22px;
          border: 4px solid #000;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
        }

        .division-card {
          border-radius: 18px;
          overflow: hidden;
          background: #fff;
        }

        .division-header {
          padding: 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .division-logo {
          width: 70px;
          height: 70px;
          object-fit: contain;
        }

        .fixture-row {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          gap: 8px;
          font-weight: bold;
          color: #000;
        }

        .team-name {
          color: #000;
          font-size: 15px;
          line-height: 1.25;
        }

        .score-pill {
          background: #eeeeee;
          padding: 6px 10px;
          border-radius: 999px;
          color: #000;
          font-weight: bold;
          min-width: 46px;
          text-align: center;
        }

        .sets {
          text-align: center;
          font-size: 12px;
          margin-top: 5px;
          color: #333;
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
            padding: 12px;
            border-radius: 20px;
          }

          .summary-grid {
            grid-template-columns: 1fr;
            gap: 14px;
          }

          .division-logo {
            width: 82px;
            height: 82px;
          }

          .division-header h2 {
            font-size: 26px !important;
          }

          .team-name {
            font-size: 16px;
          }

          .score-pill {
            font-size: 16px;
          }

          .sets {
            font-size: 13px;
            color: #222;
          }
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
                color:
                  Number(round) === selectedRound ? "#ffffff" : "#000000",
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
      </div>

      <section className="main-card">
        <div
          style={{
            background: "#000",
            color: "#fff",
            borderRadius: "18px",
            padding: "20px",
            textAlign: "center",
            marginBottom: "20px",
          }}
        >
          <h1 style={{ margin: 0, fontSize: "34px" }}>
            WEEK {selectedRound} RESULTS
          </h1>
          <p style={{ margin: 0, opacity: 0.8 }}>League Fixtures Summary</p>
        </div>

        <div className="summary-grid">
          {divisions?.map((division: any) => {
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

                  <h2
                    style={{
                      margin: 0,
                      fontSize: "22px",
                      fontWeight: "bold",
                      textTransform: "uppercase",
                    }}
                  >
                    {division.name}
                  </h2>
                </div>

                <div style={{ padding: "12px" }}>
                  {divisionFixtures.length === 0 && (
                    <p
                      style={{
                        textAlign: "center",
                        fontWeight: "bold",
                        color: "#333",
                        padding: "20px 0",
                      }}
                    >
                      No fixtures for this round
                    </p>
                  )}

                  {divisionFixtures.map((fixture: any) => (
                    <div
                      key={fixture.id}
                      style={{
                        borderBottom: "1px solid #ddd",
                        padding: "10px 0",
                      }}
                    >
                      <div className="fixture-row">
                        <div className="team-name">
                          {getTeamName(fixture.home_team_id)}
                        </div>

                        <div className="score-pill">
                          {fixture.played
                            ? `${fixture.home_score} - ${fixture.away_score}`
                            : "vs"}
                        </div>

                        <div className="team-name" style={{ textAlign: "right" }}>
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