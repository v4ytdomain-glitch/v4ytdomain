import { useState } from "react";
import { Link } from "react-router";
import { players } from "../data/mock";

const tierColors: Record<string, string> = { legend: "#f59e0b", master: "#c084fc", diamond: "#b9f2ff", platinum: "#00b4d8", gold: "#ffd700", silver: "#c0c0c0", bronze: "#cd7f32" };

export default function Players() {
  const [search, setSearch] = useState("");
  const [compareMode, setCompareMode] = useState(false);
  const [selected, setSelected] = useState<number[]>([]);

  const filtered = players.filter(p => p.username.toLowerCase().includes(search.toLowerCase()));

  const toggleSelect = (id: number) => {
    if (selected.includes(id)) setSelected(s => s.filter(x => x !== id));
    else if (selected.length < 2) setSelected(s => [...s, id]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-xs font-semibold tracking-widest text-violet-400 mb-2" style={{ fontFamily: "'Rajdhani', sans-serif" }}>COMMUNITY</p>
          <h1 className="text-5xl md:text-6xl font-black text-white" style={{ fontFamily: "'Rajdhani', sans-serif" }}>PLAYERS</h1>
        </div>
        <div className="flex gap-3">
          <button onClick={() => { setCompareMode(!compareMode); setSelected([]); }}
            className={`px-4 py-2 rounded-lg text-xs font-bold tracking-widest transition-all ${compareMode ? "bg-violet-600 text-white" : "btn-secondary"}`}
            style={{ fontFamily: "'Rajdhani', sans-serif" }}>
            {compareMode ? "CANCEL COMPARE" : "⚖ COMPARE PLAYERS"}
          </button>
          {compareMode && selected.length === 2 && (
            <Link to={`/players/compare?a=${selected[0]}&b=${selected[1]}`} className="btn-primary text-xs">COMPARE →</Link>
          )}
        </div>
      </div>

      {compareMode && (
        <div className="mb-5 p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-sm text-cyan-400">
          Select 2 players to compare. {selected.length}/2 selected.
        </div>
      )}

      <div className="mb-6">
        <div className="relative max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search players..."
            className="w-full bg-secondary border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-foreground placeholder-muted-foreground outline-none focus:border-violet-500" />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(p => (
          <div key={p.id} onClick={() => compareMode && toggleSelect(p.id)}
            className={`glass border rounded-xl p-5 card-hover ${compareMode ? "cursor-pointer" : ""} ${selected.includes(p.id) ? "border-violet-500 bg-violet-500/10" : "border-border"} transition-all`}>
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center text-white font-black text-sm">{p.avatar}</div>
              <div className="text-right">
                <span className="text-xs font-bold" style={{ color: tierColors[p.tier], fontFamily: "'Rajdhani', sans-serif" }}>{p.tier.toUpperCase()}</span>
                <p className="text-xs text-muted-foreground">Rank #{p.rank}</p>
              </div>
            </div>
            <h3 className="text-lg font-black text-white mb-0.5" style={{ fontFamily: "'Rajdhani', sans-serif" }}>{p.username}</h3>
            <p className="text-xs text-muted-foreground mb-4">Level {p.level} · {p.winRate}% Win Rate</p>
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="bg-secondary rounded-lg p-2 text-center border border-border">
                <p className="text-xs text-muted-foreground">Points</p>
                <p className="text-sm font-black text-white font-mono-data">{p.points.toLocaleString()}</p>
              </div>
              <div className="bg-secondary rounded-lg p-2 text-center border border-border">
                <p className="text-xs text-muted-foreground">Wins</p>
                <p className="text-sm font-black text-white font-mono-data">{p.wins}</p>
              </div>
            </div>
            <div className="mb-4">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">XP</span>
                <span className="font-mono-data">{p.xp.toLocaleString()} / 10,000</span>
              </div>
              <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-violet-600 to-cyan-500 rounded-full" style={{ width: `${(p.xp / 10000) * 100}%` }}></div>
              </div>
            </div>
            {!compareMode && (
              <Link to={`/players/${p.id}`} className="block text-center btn-secondary text-xs w-full">VIEW PROFILE</Link>
            )}
            {compareMode && selected.includes(p.id) && (
              <div className="text-center text-xs font-bold text-violet-400" style={{ fontFamily: "'Rajdhani', sans-serif" }}>✓ SELECTED</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
