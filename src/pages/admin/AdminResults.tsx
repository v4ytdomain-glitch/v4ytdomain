import { useEffect, useState } from "react";
import { api } from "../../lib/api";

type Team = { id: string; team_name: string; status: string; points: number };
type Match = { id: string; match_number: number; team1_id: string | null; team1_name: string | null; team2_id: string | null; team2_name: string | null; winner_team_id: string | null; score1: number; score2: number; status: string; is_bye: boolean };
type Round = { id: string; name: string; round: number; matches: Match[] };

export default function AdminResults() {
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTournament, setSelectedTournament] = useState("");
  const [teamMode, setTeamMode] = useState(false);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [scores, setScores] = useState<Record<string, { winner: string; score1: number; score2: number }>>({});
  const [firstPlace, setFirstPlace] = useState("");
  const [secondPlace, setSecondPlace] = useState("");
  const [thirdPlace, setThirdPlace] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const loadTournament = async (id: string, list = tournaments) => {
    const selected = list.find((row: any) => String(row.id) === String(id));
    const isTeam = Boolean(selected?.team_mode);
    setSelectedTournament(id);
    setTeamMode(isTeam);
    setError(""); setSaved(false); setFirstPlace(""); setSecondPlace(""); setThirdPlace("");
    if (isTeam) {
      const [teamRows, bracket] = await Promise.all([api.get<Team[]>(`/tournaments/${id}/teams/leaderboard?limit=100`), api.get<any>(`/tournaments/${id}/bracket`)]);
      setTeams(teamRows || []);
      setSelectedTeams((teamRows || []).filter(team => team.status === "registered").map(team => team.id));
      setRounds(bracket.rounds || []);
      setPlayers([]);
    } else {
      setRounds([]); setTeams([]); setSelectedTeams([]);
      setPlayers(await api.get<any[]>(`/tournaments/${id}/participants`));
    }
  };

  useEffect(() => {
    api.get<any[]>("/tournaments/").then(async data => {
      const pending = data.filter((t: any) => !["completed", "cancelled"].includes(t.status));
      setTournaments(pending);
      if (pending.length) await loadTournament(String(pending[0].id), pending);
    }).catch(err => setError(err.message || "Failed to load backend data.")).finally(() => setLoading(false));
  }, []);

  const refreshBracket = async () => {
    const bracket = await api.get<any>(`/tournaments/${selectedTournament}/bracket`);
    setRounds(bracket.rounds || []);
  };

  const generateBracket = async () => {
    setSubmitting(true); setError(""); setSaved(false);
    try {
      await api.post(`/admin/tournaments/${selectedTournament}/bracket/generate`, { team_ids: selectedTeams });
      await refreshBracket(); setSaved(true);
    } catch (err: any) { setError(err.message || "Could not generate bracket."); }
    finally { setSubmitting(false); }
  };

  const recordWinner = async (match: Match) => {
    const score = scores[match.id] || { winner: "", score1: 1, score2: 0 };
    if (!score.winner) { setError("Choose a winner for this match."); return; }
    setSubmitting(true); setError(""); setSaved(false);
    try {
      await api.post(`/admin/tournaments/${selectedTournament}/bracket/matches/${match.id}/result`, { winner_team_id: score.winner, score1: score.score1, score2: score.score2 });
      await refreshBracket(); setSaved(true);
    } catch (err: any) { setError(err.message || "Could not save match result."); }
    finally { setSubmitting(false); }
  };

  const handleSoloSubmit = async () => {
    if (!firstPlace || !secondPlace || !thirdPlace) { setError("Select all three winning players."); return; }
    if (new Set([firstPlace, secondPlace, thirdPlace]).size < 3) { setError("A player cannot hold multiple winning spots."); return; }
    setSubmitting(true); setError(""); setSaved(false);
    try {
      const podium = [firstPlace, secondPlace, thirdPlace];
      const remaining = players.filter(player => !podium.includes(player.id)).map((player, index) => ({ user_id: player.id, placement: index + 4, score: 0 }));
      await api.post("/admin/results", { tournament_id: selectedTournament, results: podium.map((user_id, index) => ({ user_id, placement: index + 1, score: 0 })).concat(remaining) });
      setSaved(true); setTournaments(rows => rows.filter(t => String(t.id) !== selectedTournament));
    } catch (err: any) { setError(err.message || "Failed to submit results."); }
    finally { setSubmitting(false); }
  };

  if (loading) return <div className="text-violet-400 font-bold tracking-widest animate-pulse">LOADING RESULT MATRIX...</div>;
  return <div>
    <h1 className="text-3xl font-black text-white mb-6">RESULT MANAGEMENT</h1>
    <div className="glass border border-border rounded-xl p-5 mb-5">
      <h3 className="text-sm font-black text-white mb-4">SELECT PENDING TOURNAMENT</h3>
      {!tournaments.length ? <div className="p-3 bg-secondary border border-border rounded-lg text-sm text-muted-foreground">No pending tournaments available to score.</div> : <select value={selectedTournament} onChange={e => { void loadTournament(e.target.value).catch(err => setError(err.message)); }} className="bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-foreground w-full md:w-auto">{tournaments.map(t => <option key={t.id} value={t.id}>{t.name} ({t.date}){t.team_mode ? " · Team" : " · Solo"}</option>)}</select>}
    </div>
    {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">{error}</div>}
    {saved && <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-sm text-green-400">Saved successfully. Tournament standings have been updated.</div>}

    {selectedTournament && teamMode && <section className="glass border border-border rounded-xl p-5">
      <h2 className="text-lg font-black text-white mb-2">SINGLE ELIMINATION BRACKET</h2>
      {!rounds.length && <><p className="text-sm text-muted-foreground mb-4">Select all registered teams to place them into the bracket. Byes are assigned automatically when needed.</p>
        {!teams.length ? <p className="text-muted-foreground py-4">No registered teams are available for this tournament.</p> : <div className="grid sm:grid-cols-2 gap-2 mb-5">{teams.filter(team => team.status === "registered").map(team => <label key={team.id} className="flex gap-3 items-center rounded border border-border p-3 text-white"><input type="checkbox" checked={selectedTeams.includes(team.id)} onChange={e => setSelectedTeams(current => e.target.checked ? [...current, team.id] : current.filter(id => id !== team.id))} /><span>{team.team_name}</span><span className="ml-auto text-xs text-muted-foreground">{team.points} pts</span></label>)}</div>}
        <button disabled={submitting || selectedTeams.length < 2} onClick={() => void generateBracket()} className="btn-primary disabled:opacity-50">{submitting ? "GENERATING…" : "GENERATE BRACKET"}</button>
      </>}
      {rounds.length > 0 && <div className="flex gap-6 overflow-x-auto pb-4 items-stretch">{rounds.map((round, ri) => <div key={round.id} className="min-w-72 flex-1 flex flex-col justify-around gap-6"><h3 className="text-center text-sm font-black uppercase tracking-widest text-violet-300">{round.name}</h3>{round.matches.map(match => <div key={match.id} className="relative rounded-xl border border-border bg-secondary/70 p-4">{ri < rounds.length - 1 && <span aria-hidden="true" className="absolute -right-6 top-1/2 text-2xl text-violet-400">→</span>}
        <p className={`py-2 text-sm ${match.winner_team_id === match.team1_id ? "font-black text-green-300" : "text-white"}`}>{match.team1_name || "TBD"} {match.status === "completed" ? `· ${match.score1}` : ""}</p><p className={`py-2 text-sm border-t border-border ${match.winner_team_id === match.team2_id ? "font-black text-green-300" : "text-white"}`}>{match.team2_name || (match.is_bye ? "BYE" : "TBD")} {match.status === "completed" ? `· ${match.score2}` : ""}</p>
        {match.status === "scheduled" && match.team1_id && match.team2_id && <div className="mt-3 space-y-2"><select value={scores[match.id]?.winner || ""} onChange={e => setScores(current => ({ ...current, [match.id]: { ...(current[match.id] || { score1: 1, score2: 0 }), winner: e.target.value } }))} className="w-full rounded bg-background border border-border p-2 text-sm text-white"><option value="">Choose match winner</option><option value={match.team1_id}>{match.team1_name}</option><option value={match.team2_id}>{match.team2_name}</option></select><div className="grid grid-cols-2 gap-2"><label className="text-xs text-muted-foreground">{match.team1_name} score<input type="number" min="0" value={scores[match.id]?.score1 ?? 1} onChange={e => setScores(current => ({ ...current, [match.id]: { ...(current[match.id] || { winner: "" }), score1: Number(e.target.value) } }))} className="mt-1 w-full bg-background border border-border rounded p-2 text-white" /></label><label className="text-xs text-muted-foreground">{match.team2_name} score<input type="number" min="0" value={scores[match.id]?.score2 ?? 0} onChange={e => setScores(current => ({ ...current, [match.id]: { ...(current[match.id] || { winner: "" }), score2: Number(e.target.value) } }))} className="mt-1 w-full bg-background border border-border rounded p-2 text-white" /></label></div><button disabled={submitting} onClick={() => void recordWinner(match)} className="btn-primary w-full disabled:opacity-50">SAVE MATCH RESULT</button></div>}
        <div className="mt-2 border-t border-border pt-2 text-xs uppercase text-muted-foreground">{match.is_bye ? "Bye · advances automatically" : match.status}</div>
      </div>)}</div>)}</div>}
    </section>}

    {selectedTournament && !teamMode && <section className="glass border border-border rounded-xl p-5"><h2 className="text-lg font-black text-white mb-4">AWARD SOLO TOURNAMENT RESULTS</h2>{players.length === 0 ? <p className="text-muted-foreground">No registered players to score.</p> : <div className="space-y-3">{[{label:"Champion (1st Place)", value:firstPlace, setter:setFirstPlace},{label:"Runner-up (2nd Place)", value:secondPlace, setter:setSecondPlace},{label:"Third Place (3rd Place)", value:thirdPlace, setter:setThirdPlace}].map(row => <label key={row.label} className="block text-xs font-bold text-muted-foreground">{row.label}<select value={row.value} onChange={e => row.setter(e.target.value)} className="mt-2 w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-white"><option value="">Select player</option>{players.map(p => <option key={p.id} value={p.id}>{p.username}</option>)}</select></label>)}</div>}<button onClick={() => void handleSoloSubmit()} disabled={submitting || players.length === 0} className="btn-primary mt-5 disabled:opacity-50">{submitting ? "PROCESSING…" : "CONFIRM & SUBMIT RESULTS"}</button></section>}
  </div>;
}
