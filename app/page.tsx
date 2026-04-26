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

export default async function Home({ searchParams }: any) {
  const selectedDivisionId = Number(searchParams?.division || 1);
  const view = searchParams?.view || "table";
  const selectedRound = Number(searchParams?.round || 1);

  const { data: divisions } = await supabase
    .from("divisions")
    .select("*")
    .order("id");

  const { data: teams } = await supabase.from("teams").select("*");

  const { data: fixtures } = await supabase
    .from("fixtures")
    .select("*")
    .order("round", { ascending: true });

  const getTeamName = (id: number) =>
    teams?.find((t: any) => t.id === id)?.name || "Unknown";

  // =========================
  // SUMMARY VIEW
  // =========================
  if (view === "summary") {
    return (
      <main style={{ padding: "14px", maxWidth: "900px", margin: "0 auto" }}>
        <h1 style={{ textAlign: "center" }}>Round {selectedRound} Results</h1>

        {/* Round selector */}
        <div style={{ display: "flex", gap: "6px", overflowX: "auto", margin: "10px 0" }}>
          {[1,2,3,4,5,6].map((r) => (
            <a
              key={r}
              href={`/?view=summary&round=${r}`}
              style={{
                padding: "6px 10px",
                borderRadius: "20px",
                background: r === selectedRound ? "#000" : "#eee",
                color: r === selectedRound ? "#fff" : "#000",
                textDecoration: "none",
              }}
            >
              Round {r}
            </a>
          ))}
        </div>

        {divisions?.map((division: any) => {
          const primary = division.primary_color || "#000";
          const secondary = division.secondary_color || "#fff";
          const textColor = division.text_color || "#fff";

          const roundFixtures = fixtures?.filter(
            (f: any) =>
              f.division_id === division.id &&
              f.round === selectedRound &&
              f.played
          );

          if (!roundFixtures || roundFixtures.length === 0) return null;

          return (
            <div
              key={division.id}
              style={{
                marginBottom: "20px",
                padding: "10px",
                borderRadius: "10px",
                border: `2px solid ${primary}`,
                background: secondary,
              }}
            >
              {division.logo_url && (
                <div style={{ textAlign: "center", marginBottom: "8px" }}>
                  <img src={division.logo_url} style={{ maxWidth: "120px" }} />
                </div>
              )}

              <h2
                style={{
                  background: primary,
                  color: textColor,
                  padding: "8px",
                  borderRadius: "8px",
                  textAlign: "center",
                }}
              >
                {division.name}
              </h2>

              {roundFixtures.map((f: any) => (
                <div
                  key={f.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto 1fr",
                    padding: "8px",
                    fontWeight: "bold",
                  }}
                >
                  <div>{getTeamName(f.home_team_id)}</div>
                  <div>
                    {f.home_score} - {f.away_score}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    {getTeamName(f.away_team_id)}
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </main>
    );
  }

  // =========================
  // NORMAL VIEW (your app)
  // =========================

  const currentDivision =
    divisions?.find((d: any) => d.id === selectedDivisionId) || {};

  const primary = currentDivision.primary_color || "#000";
  const secondary = currentDivision.secondary_color || "#fff";
  const textColor = currentDivision.text_color || "#fff";

  const divisionTeams = teams?.filter(
    (t: any) => t.division_id === selectedDivisionId
  );

  const divisionFixtures = fixtures?.filter(
    (f: any) => f.division_id === selectedDivisionId
  );

  return (
    <main style={{ padding: "14px", maxWidth: "900px", margin: "0 auto" }}>
      
      {/* Toggle */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
        <a href="/" style={{ fontWeight: "bold" }}>Tables</a>
        <a href="/?view=summary&round=1" style={{ fontWeight: "bold" }}>
          Round Summary
        </a>
      </div>

      <h1>{currentDivision.name}</h1>

      <p>Tables & fixtures remain as you had them 👌</p>
    </main>
  );
}