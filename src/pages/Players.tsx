import { useEffect, useState } from "react";
import { Link } from "react-router";
import { api } from "../lib/api";

export default function Players() {
  const [search, setSearch] = useState("");
  const [players, setPlayers] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.get<any[]>("/players/").then(setPlayers).catch(e => setError(e.message)).finally(() => setLoading(false)); }, []);
  const filtered = players.filter(p => p.username.toLowerCase().includes(search.toLowerCase()));
  return <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
    <p className="text-xs font-semibold tracking-widest text-violet-400 mb-2">COMMUNITY</p><h1 className="text-5xl font-black text-white mb-8">PLAYERS</h1>
    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search players..." className="mb-6 w-full max-w-sm bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm" />
    {error && <p role="alert" className="text-red-400 mb-4">{error}</p>}
    {loading && <p className="text-muted-foreground">Loading players…</p>}
    {!loading && !players.length && !error && <p className="text-muted-foreground">No players yet.</p>}
    {players.length > 0 && !filtered.length && <p className="text-muted-foreground">No players match your search.</p>}
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">{filtered.map(p => <div key={p.id} className="glass border border-border rounded-xl p-5">
      <div className="flex justify-between"><span className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center text-white font-black">{p.avatar}</span><span className="text-xs text-cyan-400">{p.tier} · #{p.rank}</span></div>
      <h3 className="text-lg font-black text-white mt-4">{p.username}</h3><p className="text-xs text-muted-foreground">Level {p.level} · {p.winRate}% Win Rate</p>
      <div className="grid grid-cols-2 gap-2 my-4"><div className="bg-secondary rounded-lg p-2 text-center"><p className="text-xs">Points</p><b>{p.points.toLocaleString()}</b></div><div className="bg-secondary rounded-lg p-2 text-center"><p className="text-xs">Wins</p><b>{p.wins}</b></div></div>
      <Link to={`/players/${p.id}`} className="block text-center btn-secondary text-xs">VIEW PROFILE</Link>
    </div>)}</div>
  </div>;
}
