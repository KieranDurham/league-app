import { supabase } from "@/lib/supabase";

export default async function Home() {
  const { data: teams, error: teamsError } = await supabase
    .from("teams")
    .select("*")
    .order("points", { ascending: false });

  const { data: fixtures, error: fixturesError } = await supabase
    .from("fixtures")
    .select("*")
    .order("fixture_date", { ascending: true });

  if (teamsError) return <p>Error loading teams: {teamsError.message}</p>;
  if (fixturesError) return <p>Error loading fixtures: {fixturesError.message}</p>;

  const getTeamName = (id: number) => {
    return teams?.find((team: any) => team.id === id)?.name || "Unknown team";
  };

  return (
    <main style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>Division 1</h1>

      {/* LEAGUE TABLE */}
      <h2>League Table</h2>

      <table style={{ borderCollapse: "collapse", width: "650px", marginBottom: "40px" }}>
        <thead>
          <tr style={{ borderBottom: "2px solid black" }}>
            <th style={{ textAlign: "left", padding: "8px" }}>Team</th>
            <th style={{ padding: "8px" }}>P</th>
            <th style={{ padding: "8px" }}>W</th>
            <th style={{ padding: "8px" }}>L</th>
            <th style={{ padding: "8px" }}>Pts</th>
          </tr>
        </thead>
        <tbody>
          {teams?.map((team: any) => (
            <tr key={team.id} style={{ borderBottom: "1px solid #ccc" }}>
              <td style={{ padding: "8px" }}>{team.name}</td>
              <td style={{ padding: "8px", textAlign: "center" }}>{team.played}</td>
              <td style={{ padding: "8px", textAlign: "center" }}>{team.won}</td>
              <td style={{ padding: "8px", textAlign: "center" }}>{team.lost}</td>
              <td style={{ padding: "8px", textAlign: "center", fontWeight: "bold" }}>
                {team.points}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* FIXTURES */}
      <h2>Fixtures</h2>

      <table style={{ borderCollapse: "collapse", width: "750px" }}>
        <thead>
          <tr style={{ borderBottom: "2px solid black" }}>
            <th style={{ textAlign: "left", padding: "8px" }}>Date</th>
            <th style={{ textAlign: "left", padding: "8px" }}>Home</th>
            <th style={{ padding: "8px" }}></th>
            <th style={{ textAlign: "left", padding: "8px" }}>Away</th>
          </tr>
        </thead>
        <tbody>
          {fixtures?.map((fixture: any) => (
            <tr key={fixture.id} style={{ borderBottom: "1px solid #ccc" }}>
              <td style={{ padding: "8px" }}>{fixture.fixture_date || "TBC"}</td>
              <td style={{ padding: "8px" }}>{getTeamName(fixture.home_team_id)}</td>
              <td style={{ padding: "8px", textAlign: "center" }}>
                {fixture.played
                  ? `${fixture.home_score} - ${fixture.away_score}`
                  : "vs"}
              </td>
              <td style={{ padding: "8px" }}>{getTeamName(fixture.away_team_id)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}