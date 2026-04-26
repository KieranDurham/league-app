import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

async function submitScore(formData: FormData) {
  "use server";

  const fixtureId = Number(formData.get("fixture_id"));
  const divisionId = Number(formData.get("division_id"));

  const h1 = Number(formData.get("home_set1"));
  const a1 = Number(formData.get("away_set1"));
  const h2 = Number(formData.get("home_set2"));
  const a2 = Number(formData.get("away_set2"));
  const h3 = Number(formData.get("home_set3"));
  const a3 = Number(formData.get("away_set3"));

  let homeSets = 0;
  let awaySets = 0;

  if (h1 > a1) homeSets++;
  else if (a1 > h1) awaySets++;

  if (h2 > a2) homeSets++;
  else if (a2 > h2) awaySets++;

  if (h3 > a3) homeSets++;
  else if (a3 > h3) awaySets++;

  await supabase
    .from("fixtures")
    .update({
      home_set1: h1,
      away_set1: a1,
      home_set2: h2,
      away_set2: a2,
      home_set3: h3,
      away_set3: a3,
      home_score: homeSets,
      away_score: awaySets,
      played: true,
    })
    .eq("id", fixtureId);

  revalidatePath("/");
  redirect(`/?division=${divisionId}`);
}

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<{ division?: string }>;
}) {
  const params = await searchParams;
  const selectedDivisionId = Number(params?.division || 1);

  const { data: divisions } = await supabase
    .from("divisions")
    .select("*")
    .order("id", { ascending: true });

  const { data: teams } = await supabase
    .from("teams")
    .select("*")
    .eq("division_id", selectedDivisionId);

  const { data: fixtures } = await supabase
    .from("fixtures")
    .select("*")
    .eq("division_id", selectedDivisionId)
    .order("round", { ascending: true });

  const currentDivision =
    divisions?.find((d: any) => d.id === selectedDivisionId) || {};

  const primary = currentDivision.primary_color || "#000000";
  const secondary = currentDivision.secondary_color || "#ffffff";
  const textColor = currentDivision.text_color || "#ffffff";

  const table: any = {};

  teams?.forEach((team: any) => {
    table[team.id] = {
      id: team.id,
      name: team.name,
      played: 0,
      won: 0,
      lost: 0,
      points: 0,
      goal_difference: 0,
    };
  });

  fixtures?.forEach((fixture: any) => {
    if (!fixture.played) return;

    const home = table[fixture.home_team_id];
    const away = table[fixture.away_team_id];

    if (!home || !away) return;

    home.played += 1;
    away.played += 1;

    const homeGames =
      (fixture.home_set1 || 0) +
      (fixture.home_set2 || 0) +
      (fixture.home_set3 || 0);

    const awayGames =
      (fixture.away_set1 || 0) +
      (fixture.away_set2 || 0) +
      (fixture.away_set3 || 0);

    home.goal_difference += homeGames - awayGames;
    away.goal_difference += awayGames - homeGames;

    if (fixture.home_score > fixture.away_score) {
      home.won += 1;
      away.lost += 1;
      home.points += 3;
    } else if (fixture.away_score > fixture.home_score) {
      away.won += 1;
      home.lost += 1;
      away.points += 3;
    }
  });

  const leagueTable = Object.values(table).sort((a: any, b: any) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goal_difference !== a.goal_difference) {
      return b.goal_difference - a.goal_difference;
    }
    if (b.won !== a.won) return b.won - a.won;
    return a.name.localeCompare(b.name);
  });

  const groupedFixtures = (fixtures || []).reduce((acc: any, fixture: any) => {
    const round = fixture.round || 1;
    if (!acc[round]) acc[round] = [];
    acc[round].push(fixture);
    return acc;
  }, {});

  const getTeamName = (id: number) => {
    return teams?.find((team: any) => team.id === id)?.name || "Unknown";
  };

  const inputStyle = {
    width: "100%",
    padding: "10px",
    border: "1px solid #999",
    borderRadius: "6px",
    fontSize: "16px",
    color: "#000000",
    background: "#ffffff",
  };

  return (
    <main
      style={{
        padding: "14px",
        maxWidth: "900px",
        margin: "0 auto",
        background: secondary,
        minHeight: "100vh",
        color: "#000000",
        fontFamily: "Arial",
      }}
    >
      {currentDivision.logo_url && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: "16px",
            width: "100%",
          }}
        >
          <img
            src={currentDivision.logo_url}
            alt={`${currentDivision.name} logo`}
            style={{
              maxWidth: "170px",
              width: "100%",
              height: "auto",
              display: "block",
              objectFit: "contain",
            }}
          />
        </div>
      )}

      <h1
        style={{
          background: primary,
          color: textColor,
          padding: "14px",
          borderRadius: "10px",
          textAlign: "center",
          marginBottom: "12px",
        }}
      >
        {currentDivision.name}
      </h1>

      <div
        style={{
          display: "flex",
          gap: "8px",
          overflowX: "auto",
          marginBottom: "20px",
          paddingBottom: "6px",
        }}
      >
        {divisions?.map((division: any) => (
          <a
            key={division.id}
            href={`/?division=${division.id}`}
            style={{
              padding: "10px 14px",
              borderRadius: "999px",
              background:
                division.id === selectedDivisionId ? primary : "#eeeeee",
              color:
                division.id === selectedDivisionId ? textColor : "#000000",
              textDecoration: "none",
              whiteSpace: "nowrap",
              fontWeight: "bold",
              border: "1px solid #dddddd",
            }}
          >
            {division.name}
          </a>
        ))}
      </div>

      <h2 style={{ color: "#000000", marginBottom: "10px" }}>League Table</h2>

      <div
        style={{
          overflowX: "auto",
          border: `2px solid ${primary}`,
          borderRadius: "10px",
          background: "#ffffff",
          marginBottom: "26px",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            color: "#000000",
          }}
        >
          <thead style={{ background: primary, color: textColor }}>
            <tr>
              <th style={{ padding: "10px", textAlign: "left" }}>Team</th>
              <th style={{ padding: "10px" }}>P</th>
              <th style={{ padding: "10px" }}>W</th>
              <th style={{ padding: "10px" }}>L</th>
              <th style={{ padding: "10px" }}>GD</th>
              <th style={{ padding: "10px" }}>Pts</th>
            </tr>
          </thead>

          <tbody>
            {leagueTable.map((team: any) => (
              <tr
                key={team.id}
                style={{ borderBottom: `1px solid ${primary}` }}
              >
                <td
                  style={{
                    padding: "10px",
                    fontWeight: "bold",
                    color: "#000000",
                  }}
                >
                  {team.name}
                </td>
                <td style={{ textAlign: "center", color: "#000000" }}>
                  {team.played}
                </td>
                <td style={{ textAlign: "center", color: "#000000" }}>
                  {team.won}
                </td>
                <td style={{ textAlign: "center", color: "#000000" }}>
                  {team.lost}
                </td>
                <td
                  style={{
                    textAlign: "center",
                    color: "#000000",
                    fontWeight: "bold",
                  }}
                >
                  {team.goal_difference > 0
                    ? `+${team.goal_difference}`
                    : team.goal_difference}
                </td>
                <td
                  style={{
                    textAlign: "center",
                    color: "#000000",
                    fontWeight: "bold",
                  }}
                >
                  {team.points}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 style={{ marginTop: "20px", color: "#000000" }}>Fixtures</h2>

      {fixtures?.length === 0 && (
        <p style={{ color: "#222222", fontWeight: "500" }}>
          No fixtures added.
        </p>
      )}

      {Object.entries(groupedFixtures).map(([round, roundFixtures]: any) => (
        <div key={round}>
          <h3
            style={{
              background: primary,
              color: textColor,
              padding: "8px 12px",
              borderRadius: "8px",
              marginTop: "14px",
            }}
          >
            Round {round}
          </h3>

          {roundFixtures.map((fixture: any) => (
            <div
              key={fixture.id}
              style={{
                border: `2px solid ${primary}`,
                padding: "12px",
                borderRadius: "10px",
                marginBottom: "12px",
                background: "#ffffff",
                color: "#000000",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto 1fr",
                  gap: "8px",
                  alignItems: "center",
                  marginBottom: "10px",
                }}
              >
                <strong style={{ color: "#111111", fontSize: "15px" }}>
                  {getTeamName(fixture.home_team_id)}
                </strong>

                <div
                  style={{
                    color: "#000000",
                    fontWeight: "bold",
                    textAlign: "center",
                    minWidth: "55px",
                    fontSize: "17px",
                  }}
                >
                  {fixture.played
                    ? `${fixture.home_score} - ${fixture.away_score}`
                    : "vs"}
                </div>

                <strong
                  style={{
                    color: "#111111",
                    fontSize: "15px",
                    textAlign: "right",
                  }}
                >
                  {getTeamName(fixture.away_team_id)}
                </strong>
              </div>

              {fixture.played && (
                <div
                  style={{
                    textAlign: "center",
                    fontSize: "13px",
                    color: "#333333",
                    marginBottom: "10px",
                    fontWeight: "500",
                  }}
                >
                  {fixture.home_set1}-{fixture.away_set1} |{" "}
                  {fixture.home_set2}-{fixture.away_set2} |{" "}
                  {fixture.home_set3}-{fixture.away_set3}
                </div>
              )}

              {!fixture.played && (
                <form action={submitScore} style={{ marginTop: "10px" }}>
                  <input type="hidden" name="fixture_id" value={fixture.id} />
                  <input
                    type="hidden"
                    name="division_id"
                    value={selectedDivisionId}
                  />

                  {[1, 2, 3].map((set) => (
                    <div key={set} style={{ marginBottom: "8px" }}>
                      <div
                        style={{
                          fontSize: "13px",
                          fontWeight: "bold",
                          color: "#222222",
                          marginBottom: "4px",
                        }}
                      >
                        Set {set}
                      </div>

                      <div style={{ display: "flex", gap: "8px" }}>
                        <input
                          name={`home_set${set}`}
                          type="number"
                          placeholder="Home"
                          required
                          style={inputStyle}
                        />

                        <input
                          name={`away_set${set}`}
                          type="number"
                          placeholder="Away"
                          required
                          style={inputStyle}
                        />
                      </div>
                    </div>
                  ))}

                  <button
                    type="submit"
                    style={{
                      width: "100%",
                      background: primary,
                      color: textColor,
                      padding: "12px",
                      borderRadius: "8px",
                      border: "none",
                      marginTop: "6px",
                      fontWeight: "bold",
                      fontSize: "16px",
                    }}
                  >
                    Save Result
                  </button>
                </form>
              )}

              {fixture.played && (
                <div
                  style={{
                    textAlign: "center",
                    color: primary,
                    fontWeight: "bold",
                    marginTop: "8px",
                  }}
                >
                  Result submitted
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
    </main>
  );
}