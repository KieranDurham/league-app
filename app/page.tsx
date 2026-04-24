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

  if (h1 > a1) homeSets++; else if (a1 > h1) awaySets++;
  if (h2 > a2) homeSets++; else if (a2 > h2) awaySets++;
  if (h3 > a3) homeSets++; else if (a3 > h3) awaySets++;

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
}

export default async function Home() {
  const { data: teams } = await supabase.from("teams").select("*");

  const { data: fixtures } = await supabase
    .from("fixtures")
    .select("*")
    .order("fixture_date", { ascending: true });

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

    home.played++;
    away.played++;

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
      home.won++;
      away.lost++;
      home.points += 3;
    } else if (fixture.away_score > fixture.home_score) {
      away.won++;
      home.lost++;
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
    return teams?.find((team: any) => team.id === id)?.name || "Unknown";
  };

  return (
    <main style={{ padding: "14px", fontFamily: "Arial", maxWidth: "1100px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "28px", marginBottom: "10px" }}>Division 1</h1>

      {/* TABLE */}
      <h2>League Table</h2>

      <div style={{ overflowX: "auto", marginBottom: "30px" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid black" }}>
              <th style={{ textAlign: "left", padding: "8px" }}>Team</th>
              <th>P</th><th>W</th><th>L</th><th>GD</th><th>Pts</th>
            </tr>
          </thead>
          <tbody>
            {leagueTable.map((team: any) => (
              <tr key={team.id} style={{ borderBottom: "1px solid #ddd" }}>
                <td style={{ padding: "8px", fontWeight: "bold", color: "#111" }}>
                  {team.name}
                </td>
                <td>{team.played}</td>
                <td>{team.won}</td>
                <td>{team.lost}</td>
                <td style={{ fontWeight: "bold", color: "#333" }}>
                  {team.goal_difference > 0 ? `+${team.goal_difference}` : team.goal_difference}
                </td>
                <td style={{ fontWeight: "bold" }}>{team.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* FIXTURES */}
      <h2>Fixtures</h2>

      <div style={{ display: "grid", gap: "14px" }}>
        {fixtures?.map((fixture: any) => (
          <div
            key={fixture.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: "12px",
              padding: "14px",
              background: "white",
              boxShadow: "0 2px 6px rgba(0,0,0,0.08)"
            }}
          >
            <div style={{ fontSize: "13px", color: "#666", marginBottom: "8px" }}>
              {fixture.fixture_date}
            </div>

            {/* TEAMS */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr auto 1fr",
              alignItems: "center",
              marginBottom: "10px"
            }}>
              <div style={{ fontWeight: "bold", color: "#111" }}>
                {getTeamName(fixture.home_team_id)}
              </div>

              <div style={{ textAlign: "center" }}>
                {fixture.played ? (
                  <>
                    <div style={{ fontSize: "22px", fontWeight: "bold", color: "#000" }}>
                      {fixture.home_score} - {fixture.away_score}
                    </div>
                    <div style={{ fontSize: "13px", color: "#444" }}>
                      {fixture.home_set1}-{fixture.away_set1} | {fixture.home_set2}-{fixture.away_set2} | {fixture.home_set3}-{fixture.away_set3}
                    </div>
                  </>
                ) : (
                  <strong style={{ color: "#666" }}>vs</strong>
                )}
              </div>

              <div style={{ fontWeight: "bold", textAlign: "right", color: "#111" }}>
                {getTeamName(fixture.away_team_id)}
              </div>
            </div>

            {/* INPUTS */}
            <form action={submitScore}>
              <input type="hidden" name="fixture_id" value={fixture.id} />

              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "8px",
                marginBottom: "10px"
              }}>
                {[1,2,3].map((set) => (
                  <div key={set}>
                    <div style={{ fontSize: "12px", fontWeight: "bold", marginBottom: "4px", color: "#222" }}>
                      Set {set}
                    </div>
                    <div style={{ display: "flex", gap: "5px" }}>
                      <input name={`home_set${set}`} defaultValue={fixture[`home_set${set}`] ?? ""} style={inputStyle}/>
                      <input name={`away_set${set}`} defaultValue={fixture[`away_set${set}`] ?? ""} style={inputStyle}/>
                    </div>
                  </div>
                ))}
              </div>

              <button style={buttonStyle}>Save Result</button>
            </form>
          </div>
        ))}
      </div>
    </main>
  );
}

const inputStyle = {
  width: "100%",
  padding: "8px",
  fontSize: "16px",
  border: "1px solid #ccc",
  borderRadius: "6px",
  color: "#000"
};

const buttonStyle = {
  width: "100%",
  padding: "12px",
  background: "#000",
  color: "#fff",
  fontWeight: "bold",
  borderRadius: "8px",
  border: "none"
};