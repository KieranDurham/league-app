import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

async function submitScore(formData: FormData) {
  "use server";

  const fixtureId = Number(formData.get("fixture_id"));

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

  const { error } = await supabase
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

  if (error) {
    console.error("Score save error:", error);
    throw new Error(error.message);
  }

  revalidatePath("/");
}

export default async function Home() {
  const { data: teams, error: teamsError } = await supabase.from("teams").select("*");

  const { data: fixtures, error: fixturesError } = await supabase
    .from("fixtures")
    .select("*")
    .order("fixture_date", { ascending: true });

  if (teamsError) return <p>Error loading teams: {teamsError.message}</p>;
  if (fixturesError) return <p>Error loading fixtures: {fixturesError.message}</p>;

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

    const homeTotal =
      (fixture.home_set1 || 0) +
      (fixture.home_set2 || 0) +
      (fixture.home_set3 || 0);

    const awayTotal =
      (fixture.away_set1 || 0) +
      (fixture.away_set2 || 0) +
      (fixture.away_set3 || 0);

    home.goal_difference += homeTotal - awayTotal;
    away.goal_difference += awayTotal - homeTotal;

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

  const getTeamName = (id: number) => {
    return teams?.find((team: any) => team.id === id)?.name || "Unknown team";
  };

  return (
    <main style={{ padding: "14px", fontFamily: "Arial", maxWidth: "1100px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "28px", marginBottom: "10px" }}>Division 1</h1>

      <h2>League Table</h2>

      <div style={{ overflowX: "auto", marginBottom: "35px" }}>
        <table style={{ borderCollapse: "collapse", width: "100%", minWidth: "500px" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid black" }}>
              <th style={{ textAlign: "left", padding: "8px" }}>Team</th>
              <th style={{ padding: "8px" }}>P</th>
              <th style={{ padding: "8px" }}>W</th>
              <th style={{ padding: "8px" }}>L</th>
              <th style={{ padding: "8px" }}>GD</th>
              <th style={{ padding: "8px" }}>Pts</th>
            </tr>
          </thead>

          <tbody>
            {leagueTable.map((team: any) => (
              <tr key={team.id} style={{ borderBottom: "1px solid #ddd" }}>
                <td style={{ padding: "8px", fontWeight: "bold" }}>{team.name}</td>
                <td style={{ padding: "8px", textAlign: "center" }}>{team.played}</td>
                <td style={{ padding: "8px", textAlign: "center" }}>{team.won}</td>
                <td style={{ padding: "8px", textAlign: "center" }}>{team.lost}</td>
                <td style={{ padding: "8px", textAlign: "center" }}>
                  {team.goal_difference > 0 ? `+${team.goal_difference}` : team.goal_difference}
                </td>
                <td style={{ padding: "8px", textAlign: "center", fontWeight: "bold" }}>
                  {team.points}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Fixtures</h2>

      <div style={{ display: "grid", gap: "14px" }}>
        {fixtures?.map((fixture: any) => (
          <div
            key={fixture.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: "12px",
              padding: "14px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
              background: "white",
            }}
          >
            <div style={{ fontSize: "13px", color: "#666", marginBottom: "8px" }}>
              {fixture.fixture_date || "TBC"}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto 1fr",
                alignItems: "center",
                gap: "10px",
                marginBottom: "12px",
              }}
            >
              <div style={{ fontWeight: "bold", textAlign: "left" }}>
                {getTeamName(fixture.home_team_id)}
              </div>

              <div style={{ textAlign: "center", minWidth: "70px" }}>
                {fixture.played ? (
                  <>
                    <div style={{ fontWeight: "bold", fontSize: "20px" }}>
                      {fixture.home_score} - {fixture.away_score}
                    </div>
                    <div style={{ fontSize: "12px", color: "#666", marginTop: "3px" }}>
                      {fixture.home_set1}-{fixture.away_set1} | {fixture.home_set2}-
                      {fixture.away_set2} | {fixture.home_set3}-{fixture.away_set3}
                    </div>
                  </>
                ) : (
                  <strong>vs</strong>
                )}
              </div>

              <div style={{ fontWeight: "bold", textAlign: "right" }}>
                {getTeamName(fixture.away_team_id)}
              </div>
            </div>

            <form action={submitScore}>
              <input type="hidden" name="fixture_id" value={fixture.id} />

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "8px",
                  marginBottom: "10px",
                }}
              >
                <div>
                  <div style={{ fontSize: "12px", marginBottom: "4px", fontWeight: "bold" }}>
                    Set 1
                  </div>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <input
                      type="number"
                      name="home_set1"
                      placeholder="H"
                      defaultValue={fixture.home_set1 ?? ""}
                      required
                      style={{ width: "100%", padding: "9px", fontSize: "16px" }}
                    />
                    <input
                      type="number"
                      name="away_set1"
                      placeholder="A"
                      defaultValue={fixture.away_set1 ?? ""}
                      required
                      style={{ width: "100%", padding: "9px", fontSize: "16px" }}
                    />
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: "12px", marginBottom: "4px", fontWeight: "bold" }}>
                    Set 2
                  </div>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <input
                      type="number"
                      name="home_set2"
                      placeholder="H"
                      defaultValue={fixture.home_set2 ?? ""}
                      required
                      style={{ width: "100%", padding: "9px", fontSize: "16px" }}
                    />
                    <input
                      type="number"
                      name="away_set2"
                      placeholder="A"
                      defaultValue={fixture.away_set2 ?? ""}
                      required
                      style={{ width: "100%", padding: "9px", fontSize: "16px" }}
                    />
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: "12px", marginBottom: "4px", fontWeight: "bold" }}>
                    Set 3
                  </div>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <input
                      type="number"
                      name="home_set3"
                      placeholder="H"
                      defaultValue={fixture.home_set3 ?? ""}
                      required
                      style={{ width: "100%", padding: "9px", fontSize: "16px" }}
                    />
                    <input
                      type="number"
                      name="away_set3"
                      placeholder="A"
                      defaultValue={fixture.away_set3 ?? ""}
                      required
                      style={{ width: "100%", padding: "9px", fontSize: "16px" }}
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                style={{
                  width: "100%",
                  padding: "11px",
                  fontSize: "16px",
                  fontWeight: "bold",
                  borderRadius: "8px",
                  border: "none",
                  background: "black",
                  color: "white",
                }}
              >
                Save Result
              </button>
            </form>
          </div>
        ))}
      </div>
    </main>
  );
}