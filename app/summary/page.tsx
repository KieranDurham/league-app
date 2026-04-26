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
    <main
      style={{
        padding: "18px",
        background: "#e9e9e9",
        minHeight: "100vh",
        fontFamily: "Arial",
      }}
    >
      {/* Top bar */}
      <div
        style={{
          maxWidth: "1050px",
          margin: "0 auto 14px auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <a
          href="/"
          style={{
            background: "#111111",
            color: "#ffffff",
            padding: "10px 14px",
            borderRadius: "999px",
            textDecoration: "none",
            fontWeight: "bold",
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
              }}
            >
              R{round}
            </a>
          ))}
        </div>
      </div>

      {/* Main card */}
      <section
        style={{
          maxWidth: "1050px",
          margin: "0 auto",
          background: "#ffffff",
          borderRadius: "26px",
          padding: "22px",
          border: "4px solid #000",
        }}
      >
        {/* Header */}
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
          <p style={{ margin: 0, opacity: 0.8 }}>
            League Fixtures Summary
          </p>
        </div>

        {/* GRID */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "18px",
          }}
        >
          {divisions?.map((division: any) => {
            const divisionFixtures = (fixtures || []).filter(
              (f: any) => f.division_id === division.id
            );

            return (
              <div
                key={division.id}
                style={{
                  borderRadius: "18px",
                  overflow: "hidden",
                  border: `3px solid ${
                    division.primary_color || "#000"
                  }`,
                  background: "#fff",
                }}
              >
                {/* HEADER */}
                <div
                  style={{
                    background: division.primary_color || "#000",
                    color: division.text_color || "#fff",
                    padding: "16px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  {division.logo_url && (
                    <img
                      src={division.logo_url}
                      alt="logo"
                      style={{
                        width: "70px",
                        height: "70px",
                        borderRadius: "50%",
                        objectFit: "contain",
                        background: "#ffffff",
                        padding: "6px",
                        boxShadow: "0 3px 10px rgba(0,0,0,0.3)",
                      }}
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

                {/* FIXTURES */}
                <div style={{ padding: "12px" }}>
                  {divisionFixtures.length === 0 && (
                    <p
                      style={{
                        textAlign: "center",
                        fontWeight: "bold",
                        color: "#666",
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
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr auto 1fr",
                          alignItems: "center",
                          gap: "8px",
                          fontWeight: "bold",
                        }}
                      >
                        <div>{getTeamName(fixture.home_team_id)}</div>

                        <div
                          style={{
                            background: "#eee",
                            padding: "6px 10px",
                            borderRadius: "999px",
                          }}
                        >
                          {fixture.played
                            ? `${fixture.home_score} - ${fixture.away_score}`
                            : "vs"}
                        </div>

                        <div style={{ textAlign: "right" }}>
                          {getTeamName(fixture.away_team_id)}
                        </div>
                      </div>

                      {fixture.played && (
                        <div
                          style={{
                            textAlign: "center",
                            fontSize: "12px",
                            marginTop: "5px",
                            color: "#555",
                          }}
                        >
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