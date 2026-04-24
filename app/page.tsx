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

  const { data: divisions } = await supabase.from("divisions").select("*").order("id");

  const { data: teams } = await supabase
    .from("teams")
    .select("*")
    .eq("division_id", selectedDivisionId);

  const { data: fixtures } = await supabase
    .from("fixtures")
    .select("*")
    .eq("division_id", selectedDivisionId)
    .order("round", { ascending: true })
    .order("fixture_date", { ascending: true });

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

    if (!home || !away) return;

    home.played++;
    away.played++;

    const homeGames =
      (f.home_set1 || 0) + (f.home_set2 || 0) + (f.home_set3 || 0);

    const awayGames =
      (f.away_set1 || 0) + (f.away_set2 || 0) + (f.away_set3 || 0);

    home.goal_difference += homeGames - awayGames;
    away.goal_difference += awayGames - homeGames;

    if (f.home_score > f.away_score) {
      home.won++;
      away.lost++;
      home.points += 3;
    } else if (f.away_score > f.home_score) {
      away.won++;
      home.lost++;
      away.points += 3;
    }
  });

  const league = Object.values(table).sort((a: any, b: any) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goal_difference !== a.goal_difference) {
      return b.goal_difference - a.goal_difference;
    }
    return b.won - a.won;
  });

  const groupedFixtures = (fixtures || []).reduce((acc: any, fixture: any) => {
    const round = fixture.round || 1;
    if (!acc[round]) acc[round] = [];
    acc[round].push(fixture);
    return acc;
  }, {});

  const getName = (id: number) =>
    teams?.find((t: any) => t.id === id)?.name || "Unknown";

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
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
          <img
            src={currentDivision.logo_url}
            alt="logo"
            style={{ maxWidth: "160px", width: "100%" }}
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
        }}
      >
        {currentDivision.name}
      </h1>

      <div style={{ display: "flex", gap: "8px", overflowX: "auto", margin: "12px 0" }}>
        {divisions?.map((d: any) => (
          <a
            key={d.id}
            href={`/?division=${d.id}`}
            style={{
              padding: "8px 12px",
              borderRadius: "20px",
              background: d.id === selectedDivisionId ? primary : "#eeeeee",
              color: d.id === selectedDivisionId ? textColor : "#000000",
              textDecoration: "none",
              whiteSpace: "nowrap",
              fontWeight: "bold",
            }}
          >
            {d.name}
          </a>
        ))}
      </div>

      <h2 style={{ color: "#000000" }}>League Table</h2>

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
            {league.map((t: any) => (
              <tr key={t.id} style={{ borderBottom: `1px solid ${primary}` }}>
                <td style={{ padding: "10px", fontWeight: "bold", color: "#000000" }}>
                  {t.name}
                </td>
                <td style={{ textAlign: "center", color: "#000000" }}>{t.played}</td>
                <td style={{ textAlign: "center", color: "#000000" }}>{t.won}</td>
                <td style={{ textAlign: "center", color: "#000000" }}>{t.lost}</td>
                <td style={{ textAlign: "center", color: "#000000", fontWeight: "bold" }}>
                  {t.goal_difference > 0 ? `+${t.goal_difference}` : t.goal_difference}
                </td>
                <td style={{ textAlign: "center", color: "#000000", fontWeight: "bold" }}>
                  {t.points}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 style={{ marginTop: "20px", color: "#000000" }}>Fixtures</h2>

      {fixtures?.length === 0 && (
        <p style={{ color: "#222222", fontWeight: "500" }}>No fixtures added.</p>
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

          {roundFixtures.map((f: any) => (
            <div
              key={f.id}
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
                  marginBottom: "8px",
                  color: "#222222",
                  fontWeight: "500",
                }}
              >
                {f.fixture_date || "TBC"}
              </div>

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
                  {getName(f.home_team_id)}
                </strong>

                <div
                  style={{
                    color: "#000000",
                    fontWeight: "bold",
                    textAlign: "center",
                    minWidth: "55px",
                  }}
                >
                  {f.played ? `${f.home_score} - ${f.away_score}` : "vs"}
                </div>

                <strong
                  style={{
                    color: "#111111",
                    fontSize: "15px",
                    textAlign: "right",
                  }}
                >
                  {getName(f.away_team_id)}
                </strong>
              </div>

              {f.played && (
                <div
                  style={{
                    textAlign: "center",
                    fontSize: "13px",
                    color: "#333333",
                    marginBottom: "10px",
                    fontWeight: "500",
                  }}
                >
                  {f.home_set1}-{f.away_set1} | {f.home_set2}-{f.away_set2} |{" "}
                  {f.home_set3}-{f.away_set3}
                </div>
              )}

              {!f.played && (
                <form action={submitScore} style={{ marginTop: "10px" }}>
                  <input type="hidden" name="fixture_id" value={f.id} />
                  <input type="hidden" name="division_id" value={selectedDivisionId} />

                  {[1, 2, 3].map((s) => (
                    <div key={s} style={{ marginBottom: "8px" }}>
                      <div
                        style={{
                          fontSize: "13px",
                          fontWeight: "bold",
                          color: "#222222",
                          marginBottom: "4px",
                        }}
                      >
                        Set {s}
                      </div>

                      <div style={{ display: "flex", gap: "8px" }}>
                        <input
                          name={`home_set${s}`}
                          type="number"
                          placeholder="Home"
                          required
                          style={inputStyle}
                        />

                        <input
                          name={`away_set${s}`}
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

              {f.played && (
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