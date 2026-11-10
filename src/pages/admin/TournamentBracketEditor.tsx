import { useCallback, useEffect, useState } from "react";
import { api } from "../../lib/api";

type RegisteredTeam = { id: string; team_name: string; status: string; points: number };
type BracketMatch = {
  id: string;
  match_number: number;
  team1_id: string | null;
  team1_name: string | null;
  team2_id: string | null;
  team2_name: string | null;
  winner_team_id: string | null;
  winner_name: string | null;
  status: string;
  is_bye: boolean;
};
type BracketRound = { id: string; name: string; round: number; matches: BracketMatch[] };

export default function TournamentBracketEditor({ tournament, onClose }: { tournament: any; onClose: () => void }) {
  const [tab, setTab] = useState<"Teams" | "Matches">("Teams");
  const [teams, setTeams] = useState<RegisteredTeam[]>([]);
  const [rounds, setRounds] = useState<BracketRound[]>([]);
  const [winners, setWinners] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadData = useCallback(async () => {
    const [registeredTeams, bracket] = await Promise.all([
      api.get<RegisteredTeam[]>(`/tournaments/${tournament.id}/teams/leaderboard?limit=100`),
      api.get<any>(`/tournaments/${tournament.id}/bracket`),
    ]);
    setTeams(registeredTeams.filter(team => team.status === "registered"));
    setRounds(bracket.rounds || []);
  }, [tournament.id]);

  useEffect(() => {
    let active = true;
    Promise.all([
      api.get<RegisteredTeam[]>(`/tournaments/${tournament.id}/teams/leaderboard?limit=100`),
      api.get<any>(`/tournaments/${tournament.id}/bracket`),
    ]).then(([registeredTeams, bracket]) => {
      if (!active) return;
      setTeams(registeredTeams.filter(team => team.status === "registered"));
      setRounds(bracket.rounds || []);
    }).catch(err => { if (active) setError(err.message || "Could not load this tournament's teams."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [tournament.id]);

  const shuffleAndGenerate = async () => {
    if (teams.length < 2) { setError("At least two registered teams are needed to create matches."); return; }
    const shuffled = [...teams.map(team => team.id)];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setSaving(true); setError(""); setNotice("");
    try {
      await api.post(`/admin/tournaments/${tournament.id}/bracket/generate`, { team_ids: shuffled });
      await loadData();
      setNotice("Teams were shuffled and the match bracket was created.");
      setTab("Matches");
    } catch (err: any) { setError(err.message || "Could not create the match bracket."); }
    finally { setSaving(false); }
  };

  const saveWinner = async (match: BracketMatch) => {
    const winnerId = winners[match.id];
    if (!winnerId) { setError("Choose the team that won this match."); return; }
    setSaving(true); setError(""); setNotice("");
    try {
      const winnerIsTeam1 = winnerId === match.team1_id;
      await api.post(`/admin/tournaments/${tournament.id}/bracket/matches/${match.id}/result`, {
        winner_team_id: winnerId,
        score1: winnerIsTeam1 ? 1 : 0,
        score2: winnerIsTeam1 ? 0 : 1,
      });
      await loadData();
      setNotice("Match winner saved.");
    } catch (err: any) { setError(err.message || "Could not save this match winner."); }
    finally { setSaving(false); }
  };

  return <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
    <section role="dialog" aria-modal="true" aria-labelledby="tournament-editor-title" className="glass border border-border rounded-2xl p-6 max-w-5xl w-full max-h-[90vh] overflow-y-auto" onClick={event => event.stopPropagation()}>
      <div className="flex items-start justify-between gap-4 mb-5">
        <div><p className="text-xs uppercase tracking-widest text-violet-300">Tournament editor</p><h2 id="tournament-editor-title" className="text-2xl font-black text-white">{tournament.name}</h2></div>
        <button type="button" onClick={onClose} className="rounded-lg px-3 py-2 bg-secondary text-muted-foreground hover:text-white" aria-label="Close tournament editor">✕</button>
      </div>

      <div className="flex gap-2 border-b border-border mb-5">
        {(["Teams", "Matches"] as const).map(name => <button key={name} type="button" onClick={() => setTab(name)} className={`px-4 py-2 text-sm font-bold ${tab === name ? "border-b-2 border-violet-400 text-white" : "text-muted-foreground hover:text-white"}`}>{name}</button>)}
      </div>

      {error && <p role="alert" className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
      {notice && <p role="status" className="mb-4 rounded-lg border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-300">{notice}</p>}
      {loading ? <p className="py-8 text-center text-cyan-300">Loading teams and matches…</p> : !tournament.team_mode ? <p className="py-8 text-center text-muted-foreground">Team match management is available for team tournaments.</p> : tab === "Teams" ? <div>
        <p className="mb-4 text-sm text-muted-foreground">Registered teams for this tournament. Shuffling creates a randomized single-elimination bracket.</p>
        {teams.length === 0 ? <p className="rounded-lg border border-border p-5 text-center text-muted-foreground">No teams are registered yet.</p> : <div className="grid gap-3 sm:grid-cols-2">{teams.map((team, index) => <div key={team.id} className="flex items-center gap-3 rounded-xl border border-border bg-secondary/50 p-4"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/15 text-sm font-black text-violet-300">{index + 1}</span><span className="font-bold text-white">{team.team_name}</span><span className="ml-auto text-xs text-muted-foreground">{team.points.toLocaleString()} pts</span></div>)}</div>}
      </div> : rounds.length === 0 ? <div className="py-8 text-center"><p className="text-muted-foreground">No matches yet. Shuffle the registered teams to create matchups.</p><button type="button" onClick={() => void shuffleAndGenerate()} disabled={saving || teams.length < 2 || !["open", "closed", "live", "soon"].includes(tournament.status)} className="btn-primary mt-4 disabled:opacity-50">{saving ? "SHUFFLING…" : "SHUFFLE MATCHES"}</button></div> : <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-muted-foreground">Select the winning team for each ready match. Later-round matches fill in as earlier winners are recorded.</p><button type="button" onClick={() => void shuffleAndGenerate()} disabled={saving || teams.length < 2 || rounds.some(round => round.matches.some(match => match.status === "completed")) || !["open", "closed", "live", "soon"].includes(tournament.status)} className="btn-primary disabled:opacity-50">{saving ? "SHUFFLING…" : "SHUFFLE MATCHES"}</button></div>
        {rounds.some(round => round.matches.some(match => match.status === "completed")) && <p className="text-xs text-amber-300">Completed match results lock the bracket from being shuffled again.</p>}
        {rounds.map(round => <section key={round.id}><h3 className="mb-3 text-sm font-black uppercase tracking-widest text-violet-300">{round.name}</h3><div className="grid gap-3 md:grid-cols-2">{round.matches.map(match => <article key={match.id} className="rounded-xl border border-border bg-secondary/50 p-4">
          <p className="mb-3 text-xs uppercase text-muted-foreground">Match {match.match_number} <span className="ml-2">{match.is_bye ? "BYE" : match.status}</span></p>
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-center"><span className="truncate font-bold text-white">{match.team1_name || "TBD"}</span><span className="text-xs text-violet-300">VS</span><span className="truncate font-bold text-white">{match.team2_name || (match.is_bye ? "BYE" : "TBD")}</span></div>
          <div className="mt-4 border-t border-border pt-3"><p className="text-xs text-muted-foreground">Won by</p>{match.status === "completed" || match.is_bye ? <p className="mt-1 font-bold text-green-300">{match.winner_name || "Awaiting winner"}</p> : match.team1_id && match.team2_id ? <div className="mt-2 flex gap-2"><select aria-label={`Winner for match ${match.match_number}`} value={winners[match.id] || ""} onChange={event => setWinners(current => ({ ...current, [match.id]: event.target.value }))} className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-white"><option value="">Choose winner</option><option value={match.team1_id}>{match.team1_name}</option><option value={match.team2_id}>{match.team2_name}</option></select><button type="button" disabled={saving || !winners[match.id]} onClick={() => void saveWinner(match)} className="btn-primary px-3 py-2 text-xs disabled:opacity-50">SAVE</button></div> : <p className="mt-1 text-sm text-muted-foreground">Waiting for previous match winners.</p>}</div>
        </article>)}</div></section>)}
      </div>}
    </section>
  </div>;
}
