import type { CSSProperties } from "react";
import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import PaymentButton from "./PaymentButton";

export const dynamic = "force-dynamic";

function adminRedirect(leagueType: string, divisionId: number, extra = "") {
  redirect(`/league?league=${leagueType}&division=${divisionId}&admin=true${extra}`);
}

function publicRedirect(leagueType: string, divisionId: number, extra = "") {
  redirect(`/league?league=${leagueType}&division=${divisionId}${extra}`);
}

async function updateTeamName(formData: FormData) {
  "use server";

  const teamId = Number(formData.get("team_id"));
  const divisionId = Number(formData.get("division_id"));
  const leagueType = String(formData.get("league_type") || "mens");
  const teamName = String(formData.get("team_name") || "").trim();

  if (!teamId || !teamName) {
    adminRedirect(leagueType, divisionId);
  }

  await supabase.from("teams").update({ name: teamName }).eq("id", teamId);

  revalidatePath("/");
  revalidatePath("/league");
  revalidatePath("/summary");

  adminRedirect(leagueType, divisionId);
}

async function addFixture(formData: FormData) {
  "use server";

  const divisionId = Number(formData.get("division_id"));
  const round = Number(formData.get("round"));
  const homeTeamId = Number(formData.get("home_team_id"));
  const awayTeamId = Number(formData.get("away_team_id"));
  const fixtureDay = String(formData.get("fixture_day") || "").trim();
  const fixtureTime = String(formData.get("fixture_time") || "").trim();
  const isPrivateGame = formData.get("is_private_game") === "on";
  const leagueType = String(formData.get("league_type") || "mens");

  if (!divisionId || !round || !homeTeamId || !awayTeamId || homeTeamId === awayTeamId) {
    adminRedirect(leagueType, divisionId);
  }

  await supabase.from("fixtures").insert({
    division_id: divisionId,
    league_type: leagueType,
    round,
    home_team_id: homeTeamId,
    away_team_id: awayTeamId,
    fixture_day: fixtureDay,
    fixture_time: fixtureTime,
    is_private_game: isPrivateGame,
    played: false,
    home_score: 0,
    away_score: 0,
    home_set1: null,
    away_set1: null,
    home_set2: null,
    away_set2: null,
    home_set3: null,
    away_set3: null,
  });

  revalidatePath("/");
  revalidatePath("/league");
  revalidatePath("/summary");

  adminRedirect(leagueType, divisionId, "#fixtures");
}

async function updateFixture(formData: FormData) {
  "use server";

  const fixtureId = Number(formData.get("fixture_id"));
  const divisionId = Number(formData.get("division_id"));
  const round = Number(formData.get("round"));
  const homeTeamId = Number(formData.get("home_team_id"));
  const awayTeamId = Number(formData.get("away_team_id"));
  const fixtureDay = String(formData.get("fixture_day") || "").trim();
  const fixtureTime = String(formData.get("fixture_time") || "").trim();
  const isPrivateGame = formData.get("is_private_game") === "on";
  const leagueType = String(formData.get("league_type") || "mens");

  if (!fixtureId || !divisionId || !round || !homeTeamId || !awayTeamId || homeTeamId === awayTeamId) {
    adminRedirect(leagueType, divisionId);
  }

  await supabase
    .from("fixtures")
    .update({
      league_type: leagueType,
      round,
      home_team_id: homeTeamId,
      away_team_id: awayTeamId,
      fixture_day: fixtureDay,
      fixture_time: fixtureTime,
      is_private_game: isPrivateGame,
    })
    .eq("id", fixtureId);

  revalidatePath("/");
  revalidatePath("/league");
  revalidatePath("/summary");

  adminRedirect(leagueType, divisionId, `#round-${round}`);
}

async function togglePrivateGame(formData: FormData) {
  "use server";

  const fixtureId = Number(formData.get("fixture_id"));
  const divisionId = Number(formData.get("division_id"));
  const currentValue = formData.get("current_value") === "true";
  const leagueType = String(formData.get("league_type") || "mens");

  await supabase
    .from("fixtures")
    .update({ is_private_game: !currentValue })
    .eq("id", fixtureId);

  revalidatePath("/");
  revalidatePath("/league");
  revalidatePath("/summary");

  adminRedirect(leagueType, divisionId);
}

async function submitScore(formData: FormData) {
  "use server";

  const fixtureId = Number(formData.get("fixture_id"));
  const divisionId = Number(formData.get("division_id"));
  const leagueType = String(formData.get("league_type") || "mens");

  const h1 = Number(formData.get("home_set1"));
  const a1 = Number(formData.get("away_set1"));
  const h2 = Number(formData.get("home_set2"));
  const a2 = Number(formData.get("away_set2"));

  const rawH3 = formData.get("home_set3");
  const rawA3 = formData.get("away_set3");

  const h3 = rawH3 === null || rawH3 === "" ? null : Number(rawH3);
  const a3 = rawA3 === null || rawA3 === "" ? null : Number(rawA3);

  let homeSets = 0;
  let awaySets = 0;

  if (h1 > a1) homeSets++;
  else if (a1 > h1) awaySets++;

  if (h2 > a2) homeSets++;
  else if (a2 > h2) awaySets++;

  const needsThirdSet = homeSets === 1 && awaySets === 1;

  if (needsThirdSet && h3 !== null && a3 !== null) {
    if (h3 > a3) homeSets++;
    else if (a3 > h3) awaySets++;
  }

  await supabase
    .from("fixtures")
    .update({
      home_set1: h1,
      away_set1: a1,
      home_set2: h2,
      away_set2: a2,
      home_set3: needsThirdSet ? h3 : null,
      away_set3: needsThirdSet ? a3 : null,
      home_score: homeSets,
      away_score: awaySets,
      played: true,
    })
    .eq("id", fixtureId);

  revalidatePath("/");
  revalidatePath("/league");
  revalidatePath("/summary");

  publicRedirect(leagueType, divisionId);
}

async function resetScore(formData: FormData) {
  "use server";

  const fixtureId = Number(formData.get("fixture_id"));
  const divisionId = Number(formData.get("division_id"));
  const leagueType = String(formData.get("league_type") || "mens");

  await supabase
    .from("fixtures")
    .update({
      home_set1: null,
      away_set1: null,
      home_set2: null,
      away_set2: null,
      home_set3: null,
      away_set3: null,
      home_score: 0,
      away_score: 0,
      played: false,
    })
    .eq("id", fixtureId);

  revalidatePath("/");
  revalidatePath("/league");
  revalidatePath("/summary");

  adminRedirect(leagueType, divisionId);
}

async function generateFixtures(formData: FormData) {
  "use server";

  const divisionId = Number(formData.get("division_id"));
  const leagueType = String(formData.get("league_type") || "mens");

  const { data: teams } = await supabase
    .from("teams")
    .select("id, name")
    .eq("league_type", leagueType)
    .eq("division_id", divisionId)
    .order("name", { ascending: true });

  if (!teams || teams.length < 2) {
    adminRedirect(leagueType, divisionId);
  }

  const { data: existingFixtures } = await supabase
    .from("fixtures")
    .select("id")
    .eq("league_type", leagueType)
    .eq("division_id", divisionId)
    .limit(1);

  if (existingFixtures && existingFixtures.length > 0) {
    adminRedirect(leagueType, divisionId, "#fixtures");
  }

  let workingTeams: any[] = [...teams];

  if (workingTeams.length % 2 !== 0) {
    workingTeams.push({ id: -1, name: "BYE" });
  }

  const rounds = workingTeams.length - 1;
  const matchesPerRound = workingTeams.length / 2;
  const fixtureRows: any[] = [];

  for (let round = 1; round <= rounds; round++) {
    for (let match = 0; match < matchesPerRound; match++) {
      const home = workingTeams[match];
      const away = workingTeams[workingTeams.length - 1 - match];

      if (home.id !== -1 && away.id !== -1) {
        fixtureRows.push({
          division_id: divisionId,
          league_type: leagueType,
          round,
          home_team_id: home.id,
          away_team_id: away.id,
          fixture_day: "",
          fixture_time: "",
          is_private_game: false,
          played: false,
          home_score: 0,
          away_score: 0,
          home_set1: null,
          away_set1: null,
          home_set2: null,
          away_set2: null,
          home_set3: null,
          away_set3: null,
        });
      }
    }

    const fixedTeam = workingTeams[0];
    const rotatingTeams = workingTeams.slice(1);
    rotatingTeams.unshift(rotatingTeams.pop());
    workingTeams = [fixedTeam, ...rotatingTeams];
  }

  await supabase.from("fixtures").insert(fixtureRows);

  revalidatePath("/");
  revalidatePath("/league");
  revalidatePath("/summary");

  adminRedirect(leagueType, divisionId, "#fixtures");
}

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<{
    division?: string;
    admin?: string;
    league?: string;
  }>;
}) {
  const params = await searchParams;

  const selectedLeague = params?.league || "mens";
  const isAdmin = params?.admin === "true";

  const { data: divisions } = await supabase
    .from("divisions")
    .select("*")
    .eq("league_type", selectedLeague)
    .order("id", { ascending: true });

  const defaultDivisionId = divisions?.[0]?.id || 1;
  const selectedDivisionId = Number(params?.division || defaultDivisionId);

  const { data: teams } = await supabase
    .from("teams")
    .select("*")
    .eq("league_type", selectedLeague)
    .eq("division_id", selectedDivisionId)
    .order("name", { ascending: true });

  const { data: fixtures } = await supabase
    .from("fixtures")
    .select("*")
    .eq("league_type", selectedLeague)
    .eq("division_id", selectedDivisionId)
    .order("round", { ascending: true });

  const fixtureIds = fixtures?.map((fixture: any) => fixture.id) || [];
  const missingPaymentsToCreate: any[] = [];

  fixtures?.forEach((fixture: any) => {
    const homeTeam = teams?.find(
      (team: any) => Number(team.id) === Number(fixture.home_team_id)
    );
    const awayTeam = teams?.find(
      (team: any) => Number(team.id) === Number(fixture.away_team_id)
    );

    [homeTeam, awayTeam].forEach((team: any) => {
      if (!team?.name) return;

      const players = String(team.name)
        .split("&")
        .map((name: string) => name.trim())
        .filter(Boolean);

      players.forEach((playerName: string) => {
        missingPaymentsToCreate.push({
          fixture_id: fixture.id,
          team_id: team.id,
          player_name: playerName,
          amount_due: 11,
          amount_paid: 0,
          status: "unpaid",
        });
      });
    });
  });

  if (missingPaymentsToCreate.length > 0) {
    await supabase.from("fixture_payments").upsert(missingPaymentsToCreate, {
      onConflict: "fixture_id,team_id,player_name",
      ignoreDuplicates: true,
    });
  }

  const { data: payments } =
    fixtureIds.length > 0
      ? await supabase
          .from("fixture_payments")
          .select("*")
          .in("fixture_id", fixtureIds)
          .order("id", { ascending: true })
      : { data: [] };

  const fixturesWithPayments =
    fixtures?.map((fixture: any) => ({
      ...fixture,
      fixture_payments:
        payments?.filter(
          (payment: any) => Number(payment.fixture_id) === Number(fixture.id)
        ) || [],
    })) || [];

  const currentDivision =
    divisions?.find((d: any) => Number(d.id) === selectedDivisionId) || {};

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
      drawn: 0,
      lost: 0,
      points: 0,
      goal_difference: 0,
    };
  });

  fixturesWithPayments.forEach((fixture: any) => {
    if (!fixture.played) return;

    const home = table[fixture.home_team_id];
    const away = table[fixture.away_team_id];

    if (!home || !away) return;

    home.played += 1;
    away.played += 1;

    let homeGames = (fixture.home_set1 || 0) + (fixture.home_set2 || 0);
    let awayGames = (fixture.away_set1 || 0) + (fixture.away_set2 || 0);

    const homeFirstTwoSets =
      (fixture.home_set1 > fixture.away_set1 ? 1 : 0) +
      (fixture.home_set2 > fixture.away_set2 ? 1 : 0);

    const awayFirstTwoSets =
      (fixture.away_set1 > fixture.home_set1 ? 1 : 0) +
      (fixture.away_set2 > fixture.home_set2 ? 1 : 0);

    const thirdSetWasNeeded = homeFirstTwoSets === 1 && awayFirstTwoSets === 1;

    if (thirdSetWasNeeded) {
      homeGames += fixture.home_set3 || 0;
      awayGames += fixture.away_set3 || 0;
    }

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
    } else {
      home.drawn += 1;
      away.drawn += 1;
      home.points += 1;
      away.points += 1;
    }
  });

  const leagueTable = Object.values(table).sort((a: any, b: any) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goal_difference !== a.goal_difference) return b.goal_difference - a.goal_difference;
    if (b.won !== a.won) return b.won - a.won;
    return a.name.localeCompare(b.name);
  });

  const groupedFixtures = fixturesWithPayments.reduce((acc: any, fixture: any) => {
    const round = fixture.round || 1;
    if (!acc[round]) acc[round] = [];
    acc[round].push(fixture);
    return acc;
  }, {});

  const roundNumbers = Object.keys(groupedFixtures)
    .map((round) => Number(round))
    .sort((a, b) => a - b);

  const getTeamName = (id: number) =>
    teams?.find((team: any) => Number(team.id) === Number(id))?.name || "Unknown";

  const getInitials = (name: string) =>
    String(name)
      .split(" ")
      .map((part: string) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  const teamLinkStyle: CSSProperties = {
    color: "inherit",
    textDecoration: "none",
    fontWeight: "bold",
    overflowWrap: "break-word",
    wordBreak: "break-word",
  };

  const inputStyle: CSSProperties = {
    width: "100%",
    padding: "10px",
    border: "1px solid #999",
    borderRadius: "6px",
    fontSize: "16px",
    color: "#000000",
    background: "#ffffff",
    boxSizing: "border-box",
  };

  const selectStyle = inputStyle;
  const adminQuery = isAdmin ? "&admin=true" : "";

  return (
    <main
      id="top"
      style={{
        padding: "14px",
        width: "100%",
        maxWidth: "900px",
        margin: "0 auto",
        background: secondary,
        minHeight: "100vh",
        color: "#000000",
        fontFamily: "Arial",
        overflowX: "hidden",
        boxSizing: "border-box",
      }}
    >
      <div style={{ marginBottom: "14px" }}>
        <a href={`/?${isAdmin ? "admin=true" : ""}`} style={buttonGreyStyle}>
          ← League Home
        </a>
      </div>

      <div style={{ display: "flex", gap: "8px", marginBottom: "14px" }}>
        <a
          href={`/league?league=mens${adminQuery}`}
          style={{
            padding: "9px 13px",
            borderRadius: "999px",
            background: selectedLeague === "mens" ? "#111827" : "#eeeeee",
            color: selectedLeague === "mens" ? "#ffffff" : "#000000",
            textDecoration: "none",
            fontWeight: "bold",
            whiteSpace: "nowrap",
          }}
        >
          Mens / Mixed
        </a>

        <a
          href={`/league?league=ladies${adminQuery}`}
          style={{
            padding: "9px 13px",
            borderRadius: "999px",
            background: selectedLeague === "ladies" ? "#111827" : "#eeeeee",
            color: selectedLeague === "ladies" ? "#ffffff" : "#000000",
            textDecoration: "none",
            fontWeight: "bold",
            whiteSpace: "nowrap",
          }}
        >
          Ladies / Mixed
        </a>
      </div>

      {currentDivision.logo_url && (
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
          <img
            src={currentDivision.logo_url}
            alt={`${currentDivision.name} logo`}
            style={{ maxWidth: "170px", width: "100%", height: "auto" }}
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
          fontSize: "26px",
          textTransform: "capitalize",
        }}
      >
        {currentDivision.name || `${selectedLeague} League`}
      </h1>

      {isAdmin && (
        <div
          style={{
            background: "#fff7ed",
            color: "#9a3412",
            border: "1px solid #fdba74",
            padding: "10px",
            borderRadius: "10px",
            marginBottom: "12px",
            textAlign: "center",
            fontWeight: "bold",
          }}
        >
          Admin View Active
        </div>
      )}

      <div style={{ display: "flex", gap: "8px", overflowX: "auto", marginBottom: "14px", paddingBottom: "6px" }}>
        {divisions?.map((division: any) => (
          <a
            key={division.id}
            href={`/league?league=${selectedLeague}&division=${division.id}${adminQuery}`}
            style={{
              padding: "10px 14px",
              borderRadius: "999px",
              background: division.id === selectedDivisionId ? primary : "#eeeeee",
              color: division.id === selectedDivisionId ? textColor : "#000000",
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

      <div style={{ marginBottom: "20px", textAlign: "center" }}>
        <a
          href={`/summary?league=${selectedLeague}${adminQuery}`}
          style={{
            display: "inline-block",
            background: primary,
            color: textColor,
            padding: "12px 18px",
            borderRadius: "999px",
            textDecoration: "none",
            fontWeight: "bold",
          }}
        >
          📊 View League Summary
        </a>
      </div>

      <h2>League Table</h2>

      <div style={{ overflowX: "auto", border: `2px solid ${primary}`, borderRadius: "10px", background: "#ffffff", marginBottom: "26px" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", color: "#000000", fontSize: "14px" }}>
          <thead style={{ background: primary, color: textColor }}>
            <tr>
              <th style={{ padding: "8px", textAlign: "left" }}>Team</th>
              <th>P</th>
              <th>W</th>
              <th>D</th>
              <th>L</th>
              <th>GD</th>
              <th>Pts</th>
            </tr>
          </thead>
          <tbody>
            {leagueTable.map((team: any) => (
              <tr key={team.id} style={{ borderBottom: `1px solid ${primary}` }}>
                <td style={{ padding: "10px", fontWeight: "bold" }}>
                  {isAdmin ? (
                    <form action={updateTeamName} style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                      <input type="hidden" name="team_id" value={team.id} />
                      <input type="hidden" name="division_id" value={selectedDivisionId} />
                      <input type="hidden" name="league_type" value={selectedLeague} />
                      <input name="team_name" defaultValue={team.name} style={{ ...inputStyle, padding: "7px", fontSize: "13px", minWidth: "150px" }} />
                      <button type="submit" style={{ background: primary, color: textColor, border: "none", borderRadius: "7px", padding: "8px 10px", fontWeight: "bold", cursor: "pointer", whiteSpace: "nowrap" }}>
                        Save
                      </button>
                    </form>
                  ) : (
                    <a href={`/team/${team.id}`} style={teamLinkStyle}>
                      {team.name}
                    </a>
                  )}
                </td>
                <td style={{ textAlign: "center" }}>{team.played}</td>
                <td style={{ textAlign: "center" }}>{team.won}</td>
                <td style={{ textAlign: "center" }}>{team.drawn}</td>
                <td style={{ textAlign: "center" }}>{team.lost}</td>
                <td style={{ textAlign: "center", fontWeight: "bold" }}>
                  {team.goal_difference > 0 ? `+${team.goal_difference}` : team.goal_difference}
                </td>
                <td style={{ textAlign: "center", fontWeight: "bold" }}>{team.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isAdmin && (
        <div style={cardStyle(primary)}>
          <h3 style={{ marginTop: 0 }}>Fixture Generator</h3>
          <p style={{ marginTop: 0 }}>Generate fixtures so every team in this division plays each other once.</p>
          <p style={{ marginTop: 0, fontSize: "13px", color: "#555555" }}>
            This will not generate more fixtures if this division already has fixtures.
          </p>
          <form action={generateFixtures}>
            <input type="hidden" name="division_id" value={selectedDivisionId} />
            <input type="hidden" name="league_type" value={selectedLeague} />
            <button type="submit" style={buttonPrimaryStyle(primary, textColor)}>
              Generate Fixtures
            </button>
          </form>
        </div>
      )}

      {isAdmin && (
        <div style={cardStyle(primary)}>
          <h3 style={{ marginTop: 0 }}>Edit Teams</h3>
          {teams?.map((team: any) => (
            <form key={team.id} action={updateTeamName} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "8px", marginBottom: "8px" }}>
              <input type="hidden" name="team_id" value={team.id} />
              <input type="hidden" name="division_id" value={selectedDivisionId} />
              <input type="hidden" name="league_type" value={selectedLeague} />
              <input name="team_name" defaultValue={team.name} style={inputStyle} />
              <button type="submit" style={{ background: primary, color: textColor, border: "none", borderRadius: "8px", padding: "10px 14px", fontWeight: "bold", cursor: "pointer" }}>
                Save
              </button>
            </form>
          ))}
        </div>
      )}

      <h2 id="fixtures">Fixtures</h2>

      {roundNumbers.length > 0 && (
        <div style={{ marginBottom: "20px", padding: "12px", borderRadius: "12px", background: "#ffffff", border: "1px solid #dddddd" }}>
          <div style={{ fontWeight: "bold", marginBottom: "8px" }}>Jump to round</div>
          <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px" }}>
            {roundNumbers.map((round) => (
              <a
                key={round}
                href={`#round-${round}`}
                style={{
                  minWidth: "44px",
                  textAlign: "center",
                  padding: "9px 12px",
                  borderRadius: "999px",
                  background: primary,
                  color: textColor,
                  textDecoration: "none",
                  fontWeight: "bold",
                }}
              >
                {round}
              </a>
            ))}
          </div>
        </div>
      )}

      {isAdmin && (
        <div style={cardStyle(primary)}>
          <h3 style={{ marginTop: 0 }}>Add Fixture</h3>
          <form action={addFixture}>
            <input type="hidden" name="division_id" value={selectedDivisionId} />
            <input type="hidden" name="league_type" value={selectedLeague} />
            <input name="round" type="number" required placeholder="Round" style={{ ...inputStyle, marginBottom: "10px" }} />
            <input name="fixture_day" type="text" placeholder="Day" style={{ ...inputStyle, marginBottom: "10px" }} />
            <input name="fixture_time" type="text" placeholder="Time" style={{ ...inputStyle, marginBottom: "10px" }} />

            <select name="home_team_id" required style={{ ...selectStyle, marginBottom: "10px" }}>
              <option value="">Select home team</option>
              {teams?.map((team: any) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>

            <select name="away_team_id" required style={{ ...selectStyle, marginBottom: "10px" }}>
              <option value="">Select away team</option>
              {teams?.map((team: any) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>

            <label style={{ display: "flex", gap: "8px", marginBottom: "12px", fontWeight: "bold" }}>
              <input name="is_private_game" type="checkbox" />
              Private game - no payment required
            </label>

            <button type="submit" style={buttonPrimaryStyle(primary, textColor)}>
              Create Fixture
            </button>
          </form>
        </div>
      )}

      {Object.entries(groupedFixtures).map(([round, roundFixtures]: any) => (
        <div key={round} id={`round-${round}`}>
          <h3 style={{ background: primary, color: textColor, padding: "8px 12px", borderRadius: "8px" }}>
            Round {round}
          </h3>

          {roundFixtures.map((fixture: any) => {
            const showThirdSet = fixture.played && fixture.home_set3 !== null && fixture.away_set3 !== null;
            const homeTeamName = getTeamName(fixture.home_team_id);
            const awayTeamName = getTeamName(fixture.away_team_id);

            const homePlayerNames = homeTeamName.split("&").map((name: string) => name.trim());
            const awayPlayerNames = awayTeamName.split("&").map((name: string) => name.trim());

            const homePayments =
              fixture.fixture_payments?.filter((payment: any) =>
                homePlayerNames.includes(String(payment.player_name).trim())
              ) || [];

            const awayPayments =
              fixture.fixture_payments?.filter((payment: any) =>
                awayPlayerNames.includes(String(payment.player_name).trim())
              ) || [];

            return (
              <div key={fixture.id} style={cardStyle(primary)}>
                {(fixture.fixture_day || fixture.fixture_time) && (
                  <div style={{ textAlign: "center", background: "#f3f4f6", padding: "8px", borderRadius: "8px", marginBottom: "10px", fontWeight: "bold" }}>
                    {fixture.fixture_day}
                    {fixture.fixture_day && fixture.fixture_time ? " · " : ""}
                    {fixture.fixture_time}
                  </div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: "8px", alignItems: "center", marginBottom: "10px" }}>
                  <strong>
                    <a href={`/team/${fixture.home_team_id}`} style={teamLinkStyle}>
                      {homeTeamName}
                    </a>
                  </strong>

                  <div style={{ fontWeight: "bold", textAlign: "center" }}>
                    {fixture.played ? `${fixture.home_score} - ${fixture.away_score}` : "vs"}
                  </div>

                  <strong style={{ textAlign: "right" }}>
                    <a href={`/team/${fixture.away_team_id}`} style={teamLinkStyle}>
                      {awayTeamName}
                    </a>
                  </strong>
                </div>

                <div style={{ border: "1px solid #e5e7eb", borderRadius: "14px", padding: "10px", marginBottom: "14px", background: "#ffffff", overflow: "hidden" }}>
                  {fixture.fixture_payments?.length > 0 ? (
                    <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 1px minmax(0, 1fr)", gap: "10px", alignItems: "stretch", width: "100%", overflow: "hidden" }}>
                      <PaymentColumn
                        payments={homePayments}
                        fixture={fixture}
                        allFixtures={fixturesWithPayments}
                        side="A"
                        align="left"
                        primary={primary}
                        textColor={textColor}
                        getInitials={getInitials}
                      />

                      <div style={{ background: "#d1d5db", width: "1px", minHeight: "180px" }} />

                      <PaymentColumn
                        payments={awayPayments}
                        fixture={fixture}
                        allFixtures={fixturesWithPayments}
                        side="B"
                        align="right"
                        primary={primary}
                        textColor={textColor}
                        getInitials={getInitials}
                      />
                    </div>
                  ) : (
                    <p style={{ margin: 0, color: "#555555", fontSize: "13px" }}>
                      No payment records found for this fixture.
                    </p>
                  )}
                </div>

                {fixture.played && (
                  <div style={{ textAlign: "center", fontSize: "13px", marginBottom: "10px", fontWeight: "500" }}>
                    {fixture.home_set1}-{fixture.away_set1} | {fixture.home_set2}-{fixture.away_set2}
                    {showThirdSet && <> | {fixture.home_set3}-{fixture.away_set3}</>}
                  </div>
                )}

                {!fixture.played && (
                  <form action={submitScore} style={{ marginTop: "10px" }}>
                    <input type="hidden" name="fixture_id" value={fixture.id} />
                    <input type="hidden" name="division_id" value={selectedDivisionId} />
                    <input type="hidden" name="league_type" value={selectedLeague} />

                    {[1, 2].map((set) => (
                      <div key={set} style={{ marginBottom: "8px" }}>
                        <strong>Set {set}</strong>
                        <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                          <input name={`home_set${set}`} type="number" placeholder="Home" required style={inputStyle} />
                          <input name={`away_set${set}`} type="number" placeholder="Away" required style={inputStyle} />
                        </div>
                      </div>
                    ))}

                    <div style={{ marginBottom: "8px" }}>
                      <strong>Set 3 Decider Only</strong>
                      <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                        <input name="home_set3" type="number" placeholder="Home" style={inputStyle} />
                        <input name="away_set3" type="number" placeholder="Away" style={inputStyle} />
                      </div>
                    </div>

                    <button type="submit" style={buttonPrimaryStyle(primary, textColor)}>
                      Save Result
                    </button>
                  </form>
                )}

                {fixture.played && (
                  <div style={{ textAlign: "center", color: primary, fontWeight: "bold", marginTop: "8px" }}>
                    Result submitted
                  </div>
                )}

                {isAdmin && (
                  <form action={togglePrivateGame} style={{ marginTop: "10px" }}>
                    <input type="hidden" name="fixture_id" value={fixture.id} />
                    <input type="hidden" name="division_id" value={selectedDivisionId} />
                    <input type="hidden" name="league_type" value={selectedLeague} />
                    <input type="hidden" name="current_value" value={String(fixture.is_private_game)} />

                    <button
                      type="submit"
                      style={buttonPrimaryStyle(fixture.is_private_game ? "#166534" : "#374151", "#ffffff")}
                    >
                      {fixture.is_private_game ? "Private Game On" : "Mark as Private Game"}
                    </button>
                  </form>
                )}

                {isAdmin && fixture.played && (
                  <form action={resetScore} style={{ marginTop: "10px" }}>
                    <input type="hidden" name="fixture_id" value={fixture.id} />
                    <input type="hidden" name="division_id" value={selectedDivisionId} />
                    <input type="hidden" name="league_type" value={selectedLeague} />

                    <button type="submit" style={buttonPrimaryStyle("#b91c1c", "#ffffff")}>
                      Reset Result
                    </button>
                  </form>
                )}
              </div>
            );
          })}

          <div style={{ textAlign: "center", margin: "14px 0 22px" }}>
            <a href="#top" style={buttonGreyStyle}>
              ↑ Back to top
            </a>
          </div>
        </div>
      ))}
    </main>
  );
}

function PaymentColumn({
  payments,
  fixture,
  allFixtures,
  side,
  align,
  primary,
  textColor,
  getInitials,
}: any) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        gap: "8px",
        textAlign: "center",
        width: "100%",
        minWidth: 0,
        overflow: "hidden",
        flexWrap: "wrap",
      }}
    >
      {payments.map((payment: any) => {
        const amountDue = Number(payment.amount_due || 0);
        const amountPaid = Number(payment.amount_paid || 0);
        const remaining = amountDue - amountPaid;
        const isPaid = remaining <= 0;

        return (
          <div key={payment.id} style={{ minWidth: "74px", maxWidth: "105px", flex: "1 1 74px" }}>
            <div
              style={{
                width: "46px",
                height: "46px",
                borderRadius: "50%",
                background: "#12202f",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 8px",
                fontSize: "16px",
                fontWeight: "500",
              }}
            >
              {getInitials(payment.player_name)}
            </div>

            <div
              style={{
                fontSize: "12px",
                fontWeight: "600",
                color: "#12202f",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {payment.player_name}
            </div>

            {!fixture.is_private_game && (
              <div
                style={{
                  display: "inline-block",
                  background: "#caff3d",
                  padding: "3px 8px",
                  borderRadius: "999px",
                  marginTop: "6px",
                  fontWeight: "bold",
                  fontSize: "12px",
                  color: "#12202f",
                }}
              >
                £{amountDue}
              </div>
            )}

            {fixture.is_private_game ? (
              <div style={{ marginTop: "10px", fontSize: "12px", fontWeight: "bold", color: "#166534" }}>
                No payment required
              </div>
            ) : (
              <>
                <div style={{ marginTop: "10px", fontSize: "12px", fontWeight: "bold", color: isPaid ? "#12202f" : "#cc0000" }}>
                  {isPaid ? "Paid" : "Not paid"}
                </div>

                {isPaid ? (
                  <div style={{ fontSize: "22px", marginTop: "6px" }}>🪙</div>
                ) : (
                  <PaymentButton
                    payment={payment}
                    allFixtures={allFixtures}
                    primary={primary}
                    textColor={textColor}
                  />
                )}
              </>
            )}
          </div>
        );
      })}

      <div style={{ width: "100%", textAlign: align, fontSize: "22px", fontWeight: "bold", color: "#6b7280", marginTop: "10px" }}>
        {side}
      </div>
    </div>
  );
}

const buttonGreyStyle: CSSProperties = {
  display: "inline-block",
  background: "#eeeeee",
  color: "#000000",
  padding: "9px 14px",
  borderRadius: "999px",
  textDecoration: "none",
  fontWeight: "bold",
  border: "1px solid #dddddd",
};

function buttonPrimaryStyle(background: string, color: string): CSSProperties {
  return {
    width: "100%",
    background,
    color,
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    fontWeight: "bold",
    fontSize: "16px",
    cursor: "pointer",
  };
}

function cardStyle(primary: string): CSSProperties {
  return {
    border: `2px solid ${primary}`,
    padding: "12px",
    borderRadius: "10px",
    marginBottom: "12px",
    background: "#ffffff",
    color: "#000000",
    width: "100%",
    maxWidth: "100%",
    minWidth: 0,
    overflow: "hidden",
    boxSizing: "border-box",
  };
}