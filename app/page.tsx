import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
    .order("fixture_date", { ascending: true });

  const currentDivision: any =
    divisions?.find((division: any) => division.id === selectedDivisionId) || {
      id: selectedDivisionId,
      name: `Division ${selectedDivisionId}`,
      logo_url: "",
      primary_color: "#000000",
      secondary_color: "#ffffff",
      text_color: "#ffffff",
    };

  const primaryColor = currentDivision.primary_color || "#000000";
  const secondaryColor = currentDivision.secondary_color || "#ffffff";
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
    <main
      style={{
        padding: "14px",
        fontFamily: "Arial",
        maxWidth: "1100px",
        margin: "0 auto",
        background: secondaryColor,
        color: "#000000",
        minHeight: "100vh",
      }}
    >
      {currentDivision.logo_url && (
        <div style={{ textAlign: "center", marginBottom: "18px" }}>
          <img
            src={currentDivision.logo_url}
            alt={`${currentDivision.name} sponsor logo`}
            style={{
              maxWidth: "220px",
              maxHeight: "110px",
              objectFit: "contain",
            }}
          />
        </div>
      )}

      <h1
        style={{
          fontSize: "28px",
          marginBottom: "12px",
          textAlign: "center",
          background: primaryColor,
          color: textColor,
          padding: "16px",
          borderRadius: "10px",
        }}
      >
        {currentDivision.name}
      </h1>

      <div
        style={{
          display: "flex",
          gap: "8px",
          overflowX: "auto",
          marginBottom: "22px",
          paddingBottom: "8px",
        }}
      >
        {divisions?.map((division: any) => {
          const active = division.id === selectedDivisionId;

          return (
            <a
              key={division.id}
              href={`/?division=${division.id}`}
              style={{
                padding: "10px 14px",
                borderRadius: "999px",
                textDecoration: "none",
                whiteSpace: "nowrap",
                fontWeight: "bold",
                background: active ? primaryColor : "#f1f1f1",
                color: active ? textColor : "#000000",
                border: active ? `1px solid ${primaryColor}` : "1px solid #ddd",
              }}
            >
              {division.name}
            </a>
          );
        })}
      </div>

      <h2 style={{ marginBottom: "10px" }}>League Table</h2>

      <div
        style={{
          overflowX: "auto",
          marginBottom: "30px",
          border: `2px solid ${primaryColor}`,
          borderRadius: "10px",
          background: "#ffffff",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: primaryColor, color: textColor }}>
              <th style={{ textAlign: "left", padding: "12px" }}>Team</th>
              <th style={{ padding: "12px" }}>P</th>
              <th style={{ padding: "12px" }}>W</th>
              <th style={{ padding: "12px" }}>L</th>
              <th style={{ padding: "12px" }}>GD</th>
              <th style={{ padding: "12px" }}>Pts</th>
            </tr>
          </thead>

          <tbody>
            {leagueTable.map((team: any) => (
              <tr key={team.id} style={{ borderBottom: `1px solid ${primaryColor}` }}>
                <td style={{ padding: "12px", fontWeight: "bold" }}>{team.name}</td>
                <td style={{ padding: "12px", textAlign: "center" }}>{team.played}</td>
                <td style={{ padding: "12px", textAlign: "center" }}>{team.won}</td>
                <td style={{ padding: "12px", textAlign: "center" }}>{team.lost}</td>
                <td style={{ padding: "12px", textAlign: "center", fontWeight: "bold" }}>
                  {team.goal_difference > 0 ? `+${team.goal_difference}` : team.goal_difference}
                </td>
                <td style={{ padding: "12px", textAlign: "center", fontWeight: "bold" }}>
                  {team.points}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 style={{ marginBottom: "10px" }}>Fixtures</h2>

      <div style={{ display: "grid", gap: "14px" }}>
        {fixtures?.length === 0 && (
          <p style={{ color: "#666" }}>No fixtures added for this division yet.</p>
        )}

        {fixtures?.map((fixture: any) => (
          <div
            key={fixture.id}
            style={{
              border: `2px solid ${primaryColor}`,
              borderRadius: "12px",
              padding: "14px",
              background: "#ffffff",
              color: "#000000",
              boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
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
                marginBottom: "10px",
                gap: "8px",
              }}
            >
              <div style={{ fontWeight: "bold", color: "#111" }}>
                {getTeamName(fixture.home_team_id)}
              </div>

              <div style={{ textAlign: "center" }}>
                {fixture.played ? (
                  <>
                    <div style={{ fontSize: "22px", fontWeight: "bold", color: primaryColor }}>
                      {fixture.home_score} - {fixture.away_score}
                    </div>
                    <div style={{ fontSize: "13px", color: "#444" }}>
                      {fixture.home_set1}-{fixture.away_set1} | {fixture.home_set2}-
                      {fixture.away_set2} | {fixture.home_set3}-{fixture.away_set3}
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
                {[1, 2, 3].map((set) => (
                  <div key={set}>
                    <div
                      style={{
                        fontSize: "12px",
                        fontWeight: "bold",
                        marginBottom: "4px",
                        color: "#222",
                      }}
                    >
                      Set {set}
                    </div>

                    <div style={{ display: "flex", gap: "5px" }}>
                      <input
                        type="number"
                        name={`home_set${set}`}
                        placeholder="H"
                        defaultValue={fixture[`home_set${set}`] ?? ""}
                        required
                        style={inputStyle}
                      />

                      <input
                        type="number"
                        name={`away_set${set}`}
                        placeholder="A"
                        defaultValue={fixture[`away_set${set}`] ?? ""}
                        required
                        style={inputStyle}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="submit"
                style={{
                  width: "100%",
                  padding: "12px",
                  background: primaryColor,
                  color: textColor,
                  fontWeight: "bold",
                  borderRadius: "8px",
                  border: "none",
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

const inputStyle = {
  width: "100%",
  padding: "8px",
  fontSize: "16px",
  border: "1px solid #999",
  borderRadius: "6px",
  color: "#000000",
  background: "#ffffff",
};