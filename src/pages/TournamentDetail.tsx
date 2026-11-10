import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { api } from "../lib/api";

type TeamRow = { id: string; team_name: string; status: string; points: number; rank: number };
type BracketMatch = { id: string; match_number: number; team1_id: string | null; team1_name: string | null; team2_id: string | null; team2_name: string | null; winner_team_id: string | null; winner_name: string | null; score1: number; score2: number; status: string; is_bye: boolean };
type BracketRound = { id: string; name: string; round: number; matches: BracketMatch[] };

export default function TournamentDetail() {
  const { id } = useParams();
  const [t, setTournament] = useState<any>(null);
  const [results, setResults] = useState<any[]>([]);
  const [teamRows, setTeamRows] = useState<TeamRow[]>([]);
  const [teamPage, setTeamPage] = useState(0);
  const [teamTotal, setTeamTotal] = useState(0);
  const [bracket, setBracket] = useState<BracketRound[]>([]);
  const [tab, setTab] = useState("Overview");
  const [loading, setLoading] = useState(true);
  const [teamLoading, setTeamLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let live = true;
    setLoading(true);
    Promise.all([api.get<any>(`/tournaments/${id}`), api.get<any>(`/tournaments/${id}/results`), api.get<any>(`/tournaments/${id}/bracket`)]).then(([tournament, scores, bracketData]) => {
      if (!live) return;
      setTournament(tournament);
      setResults(scores.items || scores);
      setBracket(bracketData.rounds || []);
    }).catch(e => { if (live) setError(e.message); }).finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [id]);

  useEffect(() => {
    if (!t?.team_mode) return;
    let live = true;
    setTeamLoading(true);
    api.getPage<any>(`/tournaments/${id}/teams/leaderboard?limit=10&offset=${teamPage * 10}`).then(page => {
      if (!live) return;
      setTeamRows(page.items || []);
      setTeamTotal(page.total || 0);
    }).catch(e => { if (live) setError(e.message); }).finally(() => { if (live) setTeamLoading(false); });
    return () => { live = false; };
  }, [id, t?.team_mode, teamPage]);

  if (loading) return <div className="max-w-5xl mx-auto p-10 text-cyan-400">Loading tournament…</div>;
  if (error) return <div className="max-w-5xl mx-auto p-10 text-red-400">{error}</div>;
  if (!t) return null;
  const tabs = ["Overview", "Rules", "Team Leaderboard", "Results"];
  const maxTeamPage = Math.max(0, Math.ceil(teamTotal / 10) - 1);

  return <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
    <div className="glass neon-border rounded-2xl p-8 mb-8"><span className="text-xs text-violet-400">{t.status.toUpperCase()}</span><h1 className="text-4xl font-black text-white mt-2">{t.name}</h1><p className="text-muted-foreground">{t.game} · {t.date} · {t.time}</p><p className="mt-4 text-muted-foreground">{t.description}</p></div>
    <div className="flex flex-wrap gap-3 mb-6">{tabs.map(x => <button key={x} onClick={() => setTab(x)} className={`px-4 py-2 rounded ${tab === x ? "bg-violet-600 text-white" : "bg-secondary text-muted-foreground"}`}>{x}</button>)}</div>
    {tab === "Overview" && <div className="glass border border-border rounded-xl p-5"><p>Prize pool: {t.prize}</p><p>Teams: {t.players}/{t.maxPlayers}</p><p>Registration deadline: {t.registration_closes_at || t.date}</p></div>}
    {tab === "Rules" && <ul className="space-y-2">{(t.rules || []).map((rule: string, i: number) => <li key={i} className="glass border border-border rounded p-3">{rule}</li>)}</ul>}
    {tab === "Team Leaderboard" && <section className="glass border border-border rounded-xl p-5">
      <p className="text-sm text-muted-foreground mb-4">Team points are the sum of the current points held by active registered members.</p>
      <div className="overflow-x-auto"><table className="w-full text-left"><thead><tr className="text-xs uppercase text-muted-foreground border-b border-border"><th className="p-3">Rank</th><th className="p-3">Team</th><th className="p-3">Status</th><th className="p-3 text-right">Points</th></tr></thead><tbody>
        {teamRows.map(row => <tr key={row.id} className="border-b border-border/60 text-white"><td className="p-3">#{row.rank}</td><td className="p-3 font-bold">{row.team_name}</td><td className="p-3 capitalize">{row.status}</td><td className="p-3 text-right font-mono">{row.points.toLocaleString()}</td></tr>)}
      </tbody></table></div>
      {teamLoading && <p className="py-6 text-center text-cyan-400">Loading team leaderboard…</p>}
      {!teamLoading && teamRows.length === 0 && <p className="py-6 text-center text-muted-foreground">No registered teams yet.</p>}
      {teamTotal > 10 && <div className="mt-4 flex items-center justify-between text-sm"><span className="text-muted-foreground">Page {teamPage + 1} of {maxTeamPage + 1} · {teamTotal} teams</span><div className="flex gap-2"><button disabled={teamPage === 0} onClick={() => setTeamPage(p => p - 1)} className="rounded bg-secondary px-3 py-2 disabled:opacity-40">Previous</button><button disabled={teamPage >= maxTeamPage} onClick={() => setTeamPage(p => p + 1)} className="rounded bg-secondary px-3 py-2 disabled:opacity-40">Next</button></div></div>}
    </section>}
    {tab === "Results" && t.team_mode ? <section className="glass border border-border rounded-xl p-5">
      {bracket.length === 0 ? <p className="py-8 text-center text-muted-foreground">The single-elimination bracket has not been created yet.</p> : <>
      <div className="flex gap-6 overflow-x-auto pb-4 items-stretch">
        {bracket.map((round, roundIndex) => <div key={round.id} className="min-w-64 flex-1 flex flex-col justify-around gap-6"><h3 className="text-center text-sm font-black uppercase tracking-widest text-violet-300">{round.name}</h3>{round.matches.map(match => <div key={match.id} className="relative rounded-xl border border-border bg-secondary/70 p-4 text-sm">
          {roundIndex < bracket.length - 1 && <span aria-hidden="true" className="absolute -right-6 top-1/2 text-2xl text-violet-400">→</span>}
          {[{id: match.team1_id, name: match.team1_name, score: match.score1}, {id: match.team2_id, name: match.team2_name, score: match.score2}].map((team, i) => <div key={team.id || `empty-${i}`} className={`flex justify-between gap-3 py-2 ${team.id && team.id === match.winner_team_id ? "font-black text-green-300" : "text-white"}`}><span>{team.name || "TBD"}</span><span>{team.id ? team.score : ""}</span></div>)}
          <div className="mt-2 border-t border-border pt-2 text-xs uppercase text-muted-foreground">{match.is_bye ? "Bye" : match.status}</div>
        </div>)}</div>)}
      </div>
      <div className="mt-6 overflow-x-auto">
        <h3 className="mb-3 text-lg font-black text-white">MATCH RESULTS</h3>
        <table className="w-full min-w-[560px] text-left">
          <thead><tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground"><th className="p-3">Round</th><th className="p-3">Team 1</th><th className="p-3">Team 2</th><th className="p-3">Won by</th></tr></thead>
          <tbody>{bracket.flatMap(round => round.matches.map(match => <tr key={match.id} className="border-b border-border/60 text-sm text-white"><td className="p-3 text-violet-300">{round.name}</td><td className="p-3">{match.team1_name || "TBD"}</td><td className="p-3">{match.team2_name || (match.is_bye ? "Bye" : "TBD")}</td><td className="p-3 font-bold text-green-300">{match.winner_name || "—"}</td></tr>))}</tbody>
        </table>
      </div>
      </>}
    </section> : tab === "Results" && <div className="space-y-2">{results.map((p: any) => <div key={p.user_id} className="glass border border-border rounded p-3 text-white">#{p.placement} · {p.username} · {p.score} pts</div>)}{!results.length && <p className="text-muted-foreground">Results will be posted after the tournament ends.</p>}</div>}
    {t.status === "open" && <Link to={`/tournaments/${t.id}/register`} className="btn-primary mt-6 inline-block">REGISTER NOW</Link>}
  </div>;
}
