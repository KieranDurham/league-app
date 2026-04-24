import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

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
    .order("id");

  const { data: teams } = await supabase
    .from("teams")
    .select("*")
    .eq("division_id", selectedDivisionId);

  const { data: fixtures } = await supabase
    .from("fixtures")
    .select("*")
    .eq("division_id", selectedDivisionId)
    .order("fixture_date");

  const currentDivision =
    divisions?.find((d: any) => d.id === selectedDivisionId) || {};

  const primary = currentDivision.primary_color || "#000";
  const secondary = currentDivision.secondary_color || "#fff";
  const textColor = currentDivision.text_color || "#fff";

  const table: any = {};

  teams?.forEach((t: any) => {
    table[t.id] = {
      ...t,
      played: 0,
      won: 0,
      lost: 0,
      points: 0,
      goal_difference: 0,
    };
  });

  fixtures?.forEach((f: any) => {
    if (!f.played) return;

    const home = table[f.home_team_id];
    const away = table[f.away_team_id];

    home.played++;
    away.played++;

    const homeGames = (f.home_set1 || 0) + (f.home_set2 || 0) + (f.home_set3 || 0);
    const awayGames = (f.away_set1 || 0) + (f.away_set2 || 0) + (f.away_set3 || 0);

    home.goal_difference += homeGames - awayGames;
    away.goal_difference += awayGames - homeGames;

    if (f.home_score > f.away_score) {
      home.won++;
      away.lost++;
      home.points += 3;
    } else {
      away.won++;
      home.lost++;
      away.points += 3;
    }
  });

  const league = Object.values(table).sort((a: any, b: any) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goal_difference !== a.goal_difference)
      return b.goal_difference - a.goal_difference;
    return b.won - a.won;
  });

  const getName = (id: number) =>
    teams?.find((t: any) => t.id === id)?.name;

  return (
    <main
      style={{
        padding: "14px",
        maxWidth: "1000px",
        margin: "0 auto",
        background: secondary,
        minHeight: "100vh",
      }}
    >
      {/* LOGO */}
      {currentDivision.logo_url && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "16px",
          }}
        >
          <img
            src={currentDivision.logo_url}
            style={{
              maxWidth: "180px",
              width: "100%",
              height: "auto",
            }}
          />
        </div>
      )}

      {/* TITLE */}
      <h1
        style={{
          background: primary,
          color: textColor,
          padding: "16px",
          borderRadius: "10px",
          textAlign: "center",
        }}
      >
        {currentDivision.name}
      </h1>

      {/* DIVISION BUTTONS */}
      <div style={{ display: "flex", gap: "8px", overflowX: "auto", margin: "12px 0" }}>
        {divisions?.map((d: any) => (
          <a
            key={d.id}
            href={`/?division=${d.id}`}
            style={{
              padding: "8px 12px",
              borderRadius: "20px",
              background: d.id === selectedDivisionId ? primary : "#eee",
              color: d.id === selectedDivisionId ? textColor : "#000",
              textDecoration: "none",
            }}
          >
            {d.name}
          </a>
        ))}
      </div>

      {/* TABLE */}
      <h2>League Table</h2>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead style={{ background: primary, color: textColor }}>
          <tr>
            <th style={{ padding: "10px", textAlign: "left" }}>Team</th>
            <th>P</th>
            <th>W</th>
            <th>L</th>
            <th>GD</th>
            <th>Pts</th>
          </tr>
        </thead>
        <tbody>
          {league.map((t: any) => (
            <tr key={t.id} style={{ borderBottom: "1px solid #ccc" }}>
              <td style={{ padding: "10px" }}>{t.name}</td>
              <td>{t.played}</td>
              <td>{t.won}</td>
              <td>{t.lost}</td>
              <td>{t.goal_difference > 0 ? "+" + t.goal_difference : t.goal_difference}</td>
              <td>{t.points}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* FIXTURES */}
      <h2 style={{ marginTop: "20px" }}>Fixtures</h2>

      {fixtures?.length === 0 && <p>No fixtures added.</p>}

      {fixtures?.map((f: any) => (
        <div
          key={f.id}
          style={{
            border: `1px solid ${primary}`,
            padding: "10px",
            borderRadius: "10px",
            marginBottom: "10px",
            background: "#fff",
          }}
        >
          <div style={{ marginBottom: "6px" }}>{f.fixture_date}</div>

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <strong>{getName(f.home_team_id)}</strong>

            <div>
              {f.played ? `${f.home_score} - ${f.away_score}` : "vs"}
            </div>

            <strong>{getName(f.away_team_id)}</strong>
          </div>

          <form action={submitScore} style={{ marginTop: "10px" }}>
            <input type="hidden" name="fixture_id" value={f.id} />

            {[1, 2, 3].map((s) => (
              <div key={s} style={{ display: "flex", gap: "5px", marginBottom: "4px" }}>
                <input name={`home_set${s}`} type="number" placeholder="H" required />
                <input name={`away_set${s}`} type="number" placeholder="A" required />
              </div>
            ))}

            <button
              type="submit"
              style={{
                width: "100%",
                background: primary,
                color: textColor,
                padding: "10px",
                borderRadius: "6px",
                border: "none",
                marginTop: "6px",
              }}
            >
              Save Result
            </button>
          </form>
        </div>
      ))}
    </main>
  );
}