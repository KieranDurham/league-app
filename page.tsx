import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function SummaryPage() {
  const { data: divisions } = await supabase
    .from("divisions")
    .select("*")
    .order("id", { ascending: true });

  const { data: teams } = await supabase.from("teams").select("*");

  const { data: fixtures } = await supabase
    .from("fixtures")
    .select("*")
    .eq("played", true)
    .order("division_id", { ascending: true })
    .order("round", { ascending: true });

  const getTeamName = (id: number) => {
    return teams?.find((team: any) => team.id === id)?.name || "Unknown";
  };

  return (
    <main
      style={{
        padding: "14px",
        maxWidth: "1000px",
        margin: "0 auto",
        fontFamily: "Arial",
        background: "#ffffff",
        minHeight: "100vh",
        color: "#000000",
      }}
    >
      <h1 style={{ textAlign: "center", marginBottom: "24px" }}>
        League Results Summary
      </h1>

      {divisions?.map((division: any) => {
        const divisionFixtures =
          fixtures?.filter((fixture: any) => fixture.division_id === division.id) || [];

        const groupedFixtures = divisionFixtures.reduce((acc: any, fixture: any) => {
          const round = fixture.round || 1;
          if (!acc[round]) acc[round] = [];
          acc[round].push(fixture);
          return acc;
        }, {});

        const primary = division.primary_color || "#000000";
        const secondary = division.secondary_color || "#ffffff";
        const textColor = division.text_color || "#ffffff";

        return (
          <section
            key={division.id}
            style={{
              marginBottom: "34px",
              padding: "14px",
              borderRadius: "14px",
              background: secondary,
              border: `2px solid ${primary}`,
            }}
          >
            {division.logo_url && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginBottom: "14px",
                }}
              >
                <img
                  src={division.logo_url}
                  alt={`${division.name} sponsor logo`}
                  style={{
                    maxWidth: "160px",
                    width: "100%",
                    height: "auto",
                  }}
                />
              </div>
            )}

            <h2
              style={{
                background: primary,
                color: textColor,
                padding: "12px",
                borderRadius: "10px",
                textAlign: "center",
                marginBottom: "16px",
              }}
            >
              {division.name}
            </h2>

            {divisionFixtures.length === 0 && (
              <p style={{ textAlign: "center", fontWeight: "bold" }}>
                No results submitted yet.
              </p>
            )}

            {Object.entries(groupedFixtures).map(([round, roundFixtures]: any) => (
              <div key={round} style={{ marginBottom: "18px" }}>
                <h3
                  style={{
                    background: primary,
                    color: textColor,
                    padding: "8px 12px",
                    borderRadius: "8px",
                  }}
                >
                  Round {round}
                </h3>

                <div style={{ display: "grid", gap: "10px" }}>
                  {roundFixtures.map((fixture: any) => {
                    const homeWon = fixture.home_score > fixture.away_score;
                    const awayWon = fixture.away_score > fixture.home_score;

                    return (
                      <div
                        key={fixture.id}
                        style={{
                          background: "#ffffff",
                          border: `1px solid ${primary}`,
                          borderRadius: "10px",
                          padding: "12px",
                        }}
                      >
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr auto 1fr",
                            gap: "8px",
                            alignItems: "center",
                          }}
                        >
                          <div
                            style={{
                              fontWeight: homeWon ? "900" : "700",
                              color: homeWon ? "#0a7a2f" : "#111111",
                            }}
                          >
                            {getTeamName(fixture.home_team_id)}
                          </div>

                          <div
                            style={{
                              fontWeight: "900",
                              fontSize: "18px",
                              textAlign: "center",
                              color: "#000000",
                            }}
                          >
                            {fixture.home_score} - {fixture.away_score}
                          </div>

                          <div
                            style={{
                              fontWeight: awayWon ? "900" : "700",
                              color: awayWon ? "#0a7a2f" : "#111111",
                              textAlign: "right",
                            }}
                          >
                            {getTeamName(fixture.away_team_id)}
                          </div>
                        </div>

                        <div
                          style={{
                            textAlign: "center",
                            marginTop: "6px",
                            fontSize: "13px",
                            color: "#333333",
                            fontWeight: "600",
                          }}
                        >
                          {fixture.home_set1}-{fixture.away_set1} |{" "}
                          {fixture.home_set2}-{fixture.away_set2} |{" "}
                          {fixture.home_set3}-{fixture.away_set3}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </section>
        );
      })}
    </main>
  );
}