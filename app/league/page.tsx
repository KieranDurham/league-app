import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

async function addFixture(formData: FormData) {
  "use server";

  const divisionId = Number(formData.get("division_id"));
  const round = Number(formData.get("round"));
  const homeTeamId = Number(formData.get("home_team_id"));
  const awayTeamId = Number(formData.get("away_team_id"));
  const fixtureDay = String(formData.get("fixture_day") || "").trim();
  const fixtureTime = String(formData.get("fixture_time") || "").trim();
  const isPrivateGame = formData.get("is_private_game") === "on";

  if (!divisionId || !round || !homeTeamId || !awayTeamId) {
    redirect(`/?division=${divisionId}&admin=true`);
  }

  if (homeTeamId === awayTeamId) {
    redirect(`/?division=${divisionId}&admin=true`);
  }

  await supabase.from("fixtures").insert({
    division_id: divisionId,
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
  revalidatePath("/summary");

  redirect(`/?division=${divisionId}&admin=true#fixtures`);
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

  if (!fixtureId || !divisionId || !round || !homeTeamId || !awayTeamId) {
    redirect(`/?division=${divisionId}&admin=true`);
  }

  if (homeTeamId === awayTeamId) {
    redirect(`/?division=${divisionId}&admin=true`);
  }

  await supabase
    .from("fixtures")
    .update({
      round,
      home_team_id: homeTeamId,
      away_team_id: awayTeamId,
      fixture_day: fixtureDay,
      fixture_time: fixtureTime,
      is_private_game: isPrivateGame,
    })
    .eq("id", fixtureId);

  revalidatePath("/");
  revalidatePath("/summary");

  redirect(`/?division=${divisionId}&admin=true#round-${round}`);
}

async function togglePrivateGame(formData: FormData) {
  "use server";

  const fixtureId = Number(formData.get("fixture_id"));
  const divisionId = Number(formData.get("division_id"));
  const currentValue = formData.get("current_value") === "true";

  await supabase
    .from("fixtures")
    .update({
      is_private_game: !currentValue,
    })
    .eq("id", fixtureId);

  revalidatePath("/");
  revalidatePath("/summary");

  redirect(`/?division=${divisionId}&admin=true`);
}

async function submitScore(formData: FormData) {
  "use server";

  const fixtureId = Number(formData.get("fixture_id"));
  const divisionId = Number(formData.get("division_id"));

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
  revalidatePath("/summary");
  revalidatePath(`/team/${fixtureId}`);

  redirect(`/?division=${divisionId}&admin=true`);
}

async function resetScore(formData: FormData) {
  "use server";

  const fixtureId = Number(formData.get("fixture_id"));
  const divisionId = Number(formData.get("division_id"));

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
  revalidatePath("/summary");

  redirect(`/?division=${divisionId}&admin=true`);
}

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<{
    division?: string;
    admin?: string;
  }>;
}) {
  const params = await searchParams;

  const selectedDivisionId = Number(params?.division || 1);
  const isAdmin = params?.admin === "true";

  const { data: divisions } = await supabase
    .from("divisions")
    .select("*")
    .order("id", { ascending: true });

  const { data: teams } = await supabase
    .from("teams")
    .select("*")
    .eq("division_id", selectedDivisionId)
    .order("name", { ascending: true });

  const { data: fixtures } = await supabase
    .from("fixtures")
    .select("*")
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

    const thirdSetWasNeeded =
      homeFirstTwoSets === 1 && awayFirstTwoSets === 1;

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

    if (b.goal_difference !== a.goal_difference) {
      return b.goal_difference - a.goal_difference;
    }

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

  const getTeamName = (id: number) => {
    return (
      teams?.find((team: any) => Number(team.id) === Number(id))?.name ||
      "Unknown"
    );
  };

  const getInitials = (name: string) => {
    return String(name)
      .split(" ")
      .map((part: string) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const teamLinkStyle = {
    color: "inherit",
    textDecoration: "none",
    fontWeight: "bold",
  };

  const inputStyle = {
    width: "100%",
    padding: "10px",
    border: "1px solid #999",
    borderRadius: "6px",
    fontSize: "16px",
    color: "#000000",
    background: "#ffffff",
    boxSizing: "border-box" as const,
  };

  const selectStyle = {
    width: "100%",
    padding: "10px",
    border: "1px solid #999",
    borderRadius: "6px",
    fontSize: "16px",
    color: "#000000",
    background: "#ffffff",
    boxSizing: "border-box" as const,
  };

  return (
    <main
      id="top"
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

      <div
        style={{
          display: "flex",
          gap: "8px",
          overflowX: "auto",
          marginBottom: "14px",
          paddingBottom: "6px",
        }}
      >
        {divisions?.map((division: any) => (
          <a
            key={division.id}
            href={`/?division=${division.id}${isAdmin ? "&admin=true" : ""}`}
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

      {roundNumbers.length > 0 && (
        <div
          style={{
            marginBottom: "20px",
            padding: "12px",
            borderRadius: "12px",
            background: "#ffffff",
            border: "1px solid #dddddd",
          }}
        >
          <div
            style={{
              fontWeight: "bold",
              marginBottom: "8px",
              color: "#111111",
            }}
          >
            Jump to round
          </div>

          <div
            style={{
              display: "flex",
              gap: "8px",
              overflowX: "auto",
              paddingBottom: "4px",
            }}
          >
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
                  border: `1px solid ${primary}`,
                }}
              >
                {round}
              </a>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginBottom: "20px", textAlign: "center" }}>
        <a
          href="/summary"
          style={{
            display: "inline-block",
            background: primary,
            color: textColor,
            padding: "12px 18px",
            borderRadius: "999px",
            textDecoration: "none",
            fontWeight: "bold",
            border: `2px solid ${primary}`,
            fontSize: "15px",
          }}
        >
          📊 View League Summary
        </a>
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
      >        <table
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
              <th style={{ padding: "10px" }}>D</th>
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
                  <a href={`/team/${team.id}`} style={teamLinkStyle}>
                    {team.name}
                  </a>
                </td>

                <td style={{ textAlign: "center", color: "#000000" }}>
                  {team.played}
                </td>

                <td style={{ textAlign: "center", color: "#000000" }}>
                  {team.won}
                </td>

                <td style={{ textAlign: "center", color: "#000000" }}>
                  {team.drawn}
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

      <h2 id="fixtures" style={{ marginTop: "20px", color: "#000000" }}>
        Fixtures
      </h2>

      {isAdmin && (
        <div
          style={{
            background: "#ffffff",
            border: `2px solid ${primary}`,
            borderRadius: "12px",
            padding: "14px",
            marginBottom: "20px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          }}
        >
          <h3
            style={{
              marginTop: 0,
              marginBottom: "12px",
              color: "#000000",
            }}
          >
            Add Fixture
          </h3>

          <form action={addFixture}>
            <input
              type="hidden"
              name="division_id"
              value={selectedDivisionId}
            />

            <div style={{ marginBottom: "10px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: "bold",
                  marginBottom: "4px",
                  color: "#222222",
                }}
              >
                Round
              </label>

              <input
                name="round"
                type="number"
                required
                placeholder="Example: 7"
                style={inputStyle}
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
                marginBottom: "10px",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: "bold",
                    marginBottom: "4px",
                    color: "#222222",
                  }}
                >
                  Day
                </label>

                <input
                  name="fixture_day"
                  type="text"
                  placeholder="Example: Monday"
                  style={inputStyle}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: "bold",
                    marginBottom: "4px",
                    color: "#222222",
                  }}
                >
                  Time
                </label>

                <input
                  name="fixture_time"
                  type="text"
                  placeholder="Example: 19:00"
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ marginBottom: "10px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: "bold",
                  marginBottom: "4px",
                  color: "#222222",
                }}
              >
                Home Team
              </label>

              <select name="home_team_id" required style={selectStyle}>
                <option value="">Select home team</option>
                {teams?.map((team: any) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: "10px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: "bold",
                  marginBottom: "4px",
                  color: "#222222",
                }}
              >
                Away Team
              </label>

              <select name="away_team_id" required style={selectStyle}>
                <option value="">Select away team</option>
                {teams?.map((team: any) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>

            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "12px",
                fontWeight: "bold",
                color: "#222222",
              }}
            >
              <input name="is_private_game" type="checkbox" />
              Private game - no payment required
            </label>

            <button
              type="submit"
              style={{
                width: "100%",
                background: primary,
                color: textColor,
                padding: "12px",
                borderRadius: "8px",
                border: "none",
                fontWeight: "bold",
                fontSize: "16px",
                cursor: "pointer",
              }}
            >
              Create Fixture
            </button>
          </form>
        </div>
      )}

      {fixturesWithPayments.length === 0 && (
        <p style={{ color: "#222222", fontWeight: "500" }}>
          No fixtures added.
        </p>
      )}

      {Object.entries(groupedFixtures).map(([round, roundFixtures]: any) => (
        <div key={round} id={`round-${round}`}>
          <h3
            style={{
              background: primary,
              color: textColor,
              padding: "8px 12px",
              borderRadius: "8px",
              marginTop: "14px",
              scrollMarginTop: "20px",
            }}
          >
            Round {round}
          </h3>

          {roundFixtures.map((fixture: any) => {
            const showThirdSet =
              fixture.played &&
              fixture.home_set3 !== null &&
              fixture.away_set3 !== null;

            const homePayments =
              fixture.fixture_payments?.filter(
                (payment: any) =>
                  Number(payment.team_id) === Number(fixture.home_team_id)
              ) || [];

            const awayPayments =
              fixture.fixture_payments?.filter(
                (payment: any) =>
                  Number(payment.team_id) === Number(fixture.away_team_id)
              ) || [];

            return (
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
                {(fixture.fixture_day || fixture.fixture_time) && (
                  <div
                    style={{
                      textAlign: "center",
                      background: "#f3f4f6",
                      color: "#111827",
                      padding: "8px",
                      borderRadius: "8px",
                      marginBottom: "10px",
                      fontWeight: "bold",
                      fontSize: "14px",
                    }}
                  >
                    {fixture.fixture_day}
                    {fixture.fixture_day && fixture.fixture_time ? " · " : ""}
                    {fixture.fixture_time}
                  </div>
                )}

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
                    <a
                      href={`/team/${fixture.home_team_id}`}
                      style={teamLinkStyle}
                    >
                      {getTeamName(fixture.home_team_id)}
                    </a>
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
                    <a
                      href={`/team/${fixture.away_team_id}`}
                      style={teamLinkStyle}
                    >
                      {getTeamName(fixture.away_team_id)}
                    </a>
                  </strong>
                </div>

                {isAdmin && (
                  <div
                    style={{
                      border: "1px solid #d1d5db",
                      borderRadius: "10px",
                      padding: "12px",
                      marginBottom: "12px",
                      background: "#f9fafb",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: "bold",
                        marginBottom: "10px",
                        color: "#111827",
                      }}
                    >
                      Edit Fixture
                    </div>

                    <form action={updateFixture}>
                      <input
                        type="hidden"
                        name="fixture_id"
                        value={fixture.id}
                      />

                      <input
                        type="hidden"
                        name="division_id"
                        value={selectedDivisionId}
                      />

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "10px",
                          marginBottom: "10px",
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontSize: "13px",
                              fontWeight: "bold",
                              marginBottom: "4px",
                            }}
                          >
                            Round
                          </div>

                          <input
                            name="round"
                            type="number"
                            defaultValue={fixture.round}
                            required
                            style={inputStyle}
                          />
                        </div>

                        <div>
                          <div
                            style={{
                              fontSize: "13px",
                              fontWeight: "bold",
                              marginBottom: "4px",
                            }}
                          >
                            Time
                          </div>

                          <input
                            name="fixture_time"
                            type="text"
                            defaultValue={fixture.fixture_time || ""}
                            style={inputStyle}
                          />
                        </div>
                      </div>

                      <div style={{ marginBottom: "10px" }}>
                        <div
                          style={{
                            fontSize: "13px",
                            fontWeight: "bold",
                            marginBottom: "4px",
                          }}
                        >
                          Day
                        </div>

                        <input
                          name="fixture_day"
                          type="text"
                          defaultValue={fixture.fixture_day || ""}
                          style={inputStyle}
                        />
                      </div>

                      <div style={{ marginBottom: "10px" }}>
                        <div
                          style={{
                            fontSize: "13px",
                            fontWeight: "bold",
                            marginBottom: "4px",
                          }}
                        >
                          Home Team
                        </div>

                        <select
                          name="home_team_id"
                          defaultValue={fixture.home_team_id}
                          required
                          style={selectStyle}
                        >
                          {teams?.map((team: any) => (
                            <option key={team.id} value={team.id}>
                              {team.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div style={{ marginBottom: "10px" }}>
                        <div
                          style={{
                            fontSize: "13px",
                            fontWeight: "bold",
                            marginBottom: "4px",
                          }}
                        >
                          Away Team
                        </div>

                        <select
                          name="away_team_id"
                          defaultValue={fixture.away_team_id}
                          required
                          style={selectStyle}
                        >
                          {teams?.map((team: any) => (
                            <option key={team.id} value={team.id}>
                              {team.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          marginBottom: "12px",
                          fontWeight: "bold",
                          color: "#222222",
                        }}
                      >
                        <input
                          name="is_private_game"
                          type="checkbox"
                          defaultChecked={fixture.is_private_game}
                        />
                        Private game - no payment required
                      </label>

                      <button
                        type="submit"
                        style={{
                          width: "100%",
                          background: "#2563eb",
                          color: "#ffffff",
                          border: "none",
                          padding: "10px",
                          borderRadius: "8px",
                          fontWeight: "bold",
                          cursor: "pointer",
                          fontSize: "15px",
                        }}
                      >
                        Save Fixture Changes
                      </button>
                    </form>
                  </div>
                )}

                {isAdmin && (
                  <form
                    action={togglePrivateGame}
                    style={{ marginBottom: "10px" }}
                  >
                    <input type="hidden" name="fixture_id" value={fixture.id} />

                    <input
                      type="hidden"
                      name="division_id"
                      value={selectedDivisionId}
                    />

                    <input
                      type="hidden"
                      name="current_value"
                      value={fixture.is_private_game ? "true" : "false"}
                    />

                    <button
                      type="submit"
                      style={{
                        width: "100%",
                        background: fixture.is_private_game
                          ? "#b91c1c"
                          : primary,
                        color: "#ffffff",
                        border: "none",
                        padding: "10px",
                        borderRadius: "8px",
                        fontWeight: "bold",
                        fontSize: "15px",
                        cursor: "pointer",
                      }}
                    >
                      {fixture.is_private_game
                        ? "Remove Private Game"
                        : "Mark as Private Game"}
                    </button>
                  </form>
                )}

                {fixture.is_private_game && (
                  <div
                    style={{
                      background: "#dcfce7",
                      color: "#166534",
                      border: "1px solid #86efac",
                      padding: "10px",
                      borderRadius: "10px",
                      marginBottom: "12px",
                      textAlign: "center",
                      fontWeight: "bold",
                    }}
                  >
                    Private game - no payment required
                  </div>
                )}

                <div
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: "18px",
                    padding: "22px",
                    marginBottom: "14px",
                    background: "#ffffff",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                  }}
                >
                  {fixture.fixture_payments?.length > 0 ? (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1px 1fr",
                        gap: "20px",
                        alignItems: "stretch",
                      }}
                    >
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "18px",
                          textAlign: "center",
                        }}
                      >
                        {homePayments.map((payment: any) => {
                          const amountDue = Number(payment.amount_due || 0);
                          const amountPaid = Number(payment.amount_paid || 0);
                          const remaining = amountDue - amountPaid;
                          const isPaid = remaining <= 0;

                          return (
                            <div key={payment.id}>
                              <div
                                style={{
                                  width: "86px",
                                  height: "86px",
                                  borderRadius: "50%",
                                  background: "#12202f",
                                  color: "#ffffff",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  margin: "0 auto 10px",
                                  fontSize: "30px",
                                  fontWeight: "500",
                                }}
                              >
                                {getInitials(payment.player_name)}
                              </div>

                              <div
                                style={{
                                  fontSize: "22px",
                                  fontWeight: "500",
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
                                    padding: "4px 12px",
                                    borderRadius: "999px",
                                    marginTop: "8px",
                                    fontWeight: "bold",
                                    fontSize: "18px",
                                    color: "#12202f",
                                  }}
                                >
                                  £{amountDue}
                                </div>
                              )}

                              {fixture.is_private_game ? (
                                <div
                                  style={{
                                    marginTop: "12px",
                                    fontSize: "16px",
                                    fontWeight: "bold",
                                    color: "#166534",
                                  }}
                                >
                                  No payment required
                                </div>
                              ) : (
                                <>
                                  <div
                                    style={{
                                      marginTop: "12px",
                                      fontSize: "20px",
                                      fontWeight: "bold",
                                      color: isPaid ? "#12202f" : "#cc0000",
                                    }}
                                  >
                                    {isPaid ? "Paid" : "Not paid"}
                                  </div>

                                  {isPaid ? (
                                    <div
                                      style={{
                                        fontSize: "34px",
                                        marginTop: "8px",
                                      }}
                                    >
                                      🪙
                                    </div>
                                  ) : (
                                    <form
                                      action="/api/create-checkout-session"
                                      method="POST"
                                    >
                                      <input
                                        type="hidden"
                                        name="payment_id"
                                        value={payment.id}
                                      />

                                      <input
                                        type="hidden"
                                        name="amount"
                                        value={remaining}
                                      />

                                      <button
                                        type="submit"
                                        style={{
                                          marginTop: "10px",
                                          background: primary,
                                          color: textColor,
                                          border: "none",
                                          padding: "8px 12px",
                                          borderRadius: "8px",
                                          fontWeight: "bold",
                                          cursor: "pointer",
                                        }}
                                      >
                                        Pay £{remaining}
                                      </button>
                                    </form>
                                  )}
                                </>
                              )}
                            </div>
                          );
                        })}

                        <div
                          style={{
                            gridColumn: "1 / -1",
                            textAlign: "left",
                            fontSize: "34px",
                            fontWeight: "bold",
                            color: "#6b7280",
                            marginTop: "14px",
                          }}
                        >
                          A
                        </div>
                      </div>

                      <div
                        style={{
                          background: "#d1d5db",
                          width: "1px",
                          minHeight: "220px",
                        }}
                      />

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "18px",
                          textAlign: "center",
                        }}
                      >
                        {awayPayments.map((payment: any) => {
                          const amountDue = Number(payment.amount_due || 0);
                          const amountPaid = Number(payment.amount_paid || 0);
                          const remaining = amountDue - amountPaid;
                          const isPaid = remaining <= 0;

                          return (
                            <div key={payment.id}>
                              <div
                                style={{
                                  width: "86px",
                                  height: "86px",
                                  borderRadius: "50%",
                                  background: "#12202f",
                                  color: "#ffffff",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  margin: "0 auto 10px",
                                  fontSize: "30px",
                                  fontWeight: "500",
                                }}
                              >
                                {getInitials(payment.player_name)}
                              </div>

                              <div
                                style={{
                                  fontSize: "22px",
                                  fontWeight: "500",
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
                                    padding: "4px 12px",
                                    borderRadius: "999px",
                                    marginTop: "8px",
                                    fontWeight: "bold",
                                    fontSize: "18px",
                                    color: "#12202f",
                                  }}
                                >
                                  £{amountDue}
                                </div>
                              )}

                              {fixture.is_private_game ? (
                                <div
                                  style={{
                                    marginTop: "12px",
                                    fontSize: "16px",
                                    fontWeight: "bold",
                                    color: "#166534",
                                  }}
                                >
                                  No payment required
                                </div>
                              ) : (
                                <>
                                  <div
                                    style={{
                                      marginTop: "12px",
                                      fontSize: "20px",
                                      fontWeight: "bold",
                                      color: isPaid ? "#12202f" : "#cc0000",
                                    }}
                                  >
                                    {isPaid ? "Paid" : "Not paid"}
                                  </div>

                                  {isPaid ? (
                                    <div
                                      style={{
                                        fontSize: "34px",
                                        marginTop: "8px",
                                      }}
                                    >
                                      🪙
                                    </div>
                                  ) : (
                                    <form
                                      action="/api/create-checkout-session"
                                      method="POST"
                                    >
                                      <input
                                        type="hidden"
                                        name="payment_id"
                                        value={payment.id}
                                      />

                                      <input
                                        type="hidden"
                                        name="amount"
                                        value={remaining}
                                      />

                                      <button
                                        type="submit"
                                        style={{
                                          marginTop: "10px",
                                          background: primary,
                                          color: textColor,
                                          border: "none",
                                          padding: "8px 12px",
                                          borderRadius: "8px",
                                          fontWeight: "bold",
                                          cursor: "pointer",
                                        }}
                                      >
                                        Pay £{remaining}
                                      </button>
                                    </form>
                                  )}
                                </>
                              )}
                            </div>
                          );
                        })}

                        <div
                          style={{
                            gridColumn: "1 / -1",
                            textAlign: "right",
                            fontSize: "34px",
                            fontWeight: "bold",
                            color: "#6b7280",
                            marginTop: "14px",
                          }}
                        >
                          B
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p
                      style={{
                        margin: 0,
                        color: "#555555",
                        fontSize: "13px",
                      }}
                    >
                      No payment records found for this fixture.
                    </p>
                  )}
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
                    {fixture.home_set2}-{fixture.away_set2}
                    {showThirdSet && (
                      <>
                        {" "}
                        | {fixture.home_set3}-{fixture.away_set3}
                      </>
                    )}
                  </div>
                )}

                {isAdmin && !fixture.played && (
                  <form action={submitScore} style={{ marginTop: "10px" }}>
                    <input type="hidden" name="fixture_id" value={fixture.id} />

                    <input
                      type="hidden"
                      name="division_id"
                      value={selectedDivisionId}
                    />

                    {[1, 2].map((set) => (
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

                    <div style={{ marginBottom: "8px" }}>
                      <div
                        style={{
                          fontSize: "13px",
                          fontWeight: "bold",
                          color: "#222222",
                          marginBottom: "4px",
                        }}
                      >
                        Set 3 Decider Only
                      </div>

                      <div style={{ display: "flex", gap: "8px" }}>
                        <input
                          name="home_set3"
                          type="number"
                          placeholder="Home"
                          style={inputStyle}
                        />

                        <input
                          name="away_set3"
                          type="number"
                          placeholder="Away"
                          style={inputStyle}
                        />
                      </div>
                    </div>

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

                {isAdmin && fixture.played && (
                  <form action={resetScore} style={{ marginTop: "10px" }}>
                    <input type="hidden" name="fixture_id" value={fixture.id} />

                    <input
                      type="hidden"
                      name="division_id"
                      value={selectedDivisionId}
                    />

                    <button
                      type="submit"
                      style={{
                        width: "100%",
                        background: "#b91c1c",
                        color: "#ffffff",
                        padding: "12px",
                        borderRadius: "8px",
                        border: "none",
                        marginTop: "6px",
                        fontWeight: "bold",
                        fontSize: "16px",
                        cursor: "pointer",
                      }}
                    >
                      Reset Result
                    </button>
                  </form>
                )}
              </div>
            );
          })}

          <div style={{ textAlign: "center", margin: "14px 0 22px" }}>
            <a
              href="#top"
              style={{
                display: "inline-block",
                background: "#eeeeee",
                color: "#000000",
                padding: "9px 14px",
                borderRadius: "999px",
                textDecoration: "none",
                fontWeight: "bold",
                border: "1px solid #dddddd",
              }}
            >
              ↑ Back to top
            </a>
          </div>
        </div>
      ))}
    </main>
  );
}