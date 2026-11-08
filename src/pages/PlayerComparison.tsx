import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router";
import { api } from "../lib/api";

const tierColors: Record<string, string> = { legend: "#f59e0b", master: "#c084fc", diamond: "#b9f2ff", platinum: "#00b4d8", gold: "#ffd700", silver: "#c0c0c0", bronze: "#cd7f32" };

function StatBar({ label, a, b, maxVal }: { label: string; a: number; b: number; maxVal: number }) {
  // Ensure the bars don't overflow past 100%
  const aW = Math.min((a / maxVal) * 100, 100);
  const bW = Math.min((b / maxVal) * 100, 100);
  const aWins = a >= b;

  return (
    <div className="py-3 border-b border-border/50 last:border-0">
      <div className="flex justify-between items-center mb-2">
        <span className={`text-sm font-bold font-mono-data ${aWins ? "text-violet-400" : "text-foreground"}`}>{typeof a === "number" && a > 100 ? a.toLocaleString() : a}</span>
        <span className="text-xs text-muted-foreground text-center" style={{ fontFamily: "'Rajdhani', sans-serif" }}>{label.toUpperCase()}</span>
        <span className={`text-sm font-bold font-mono-data ${!aWins ? "text-cyan-400" : "text-foreground"}`}>{typeof b === "number" && b > 100 ? b.toLocaleString() : b}</span>
      </div>
      <div className="flex gap-1 h-2">
        <div className="flex-1 bg-secondary rounded-l-full overflow-hidden flex justify-end">
          <div className={`h-full rounded-l-full transition-all duration-1000 ${aWins ? "bg-violet-600" : "bg-secondary-foreground/30"}`} style={{ width: `${aW}%` }}></div>
        </div>
        <div className="flex-1 bg-secondary rounded-r-full overflow-hidden">
          <div className={`h-full rounded-r-full transition-all duration-1000 ${!aWins ? "bg-cyan-500" : "bg-secondary-foreground/30"}`} style={{ width: `${bW}%` }}></div>
        </div>
      </div>
    </div>
  );
}

export default function PlayerComparison() {
  const [params] = useSearchParams();
  const aId = Number(params.get("a") || 1);
  const bId = Number(params.get("b") || 2);
  
  const [a, setA] = useState<any>(null);
  const [b, setB] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch both players at the exact same time
    Promise.all([
      api.get(`/players/${aId}`),
      api.get(`/players/${bId}`)
    ])
      .then(([playerA, playerB]) => {
        setA(playerA);
        setB(playerB);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load players for comparison", err);
        setError("One or both players could not be found.");
        setLoading(false);
      });
  }, [aId, bId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-cyan-400 font-bold tracking-widest animate-pulse" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
          ANALYZING PLAYER DATA...
        </div>
      </div>
    );
  }

  if (error || !a || !b) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-black text-white mb-2" style={{ fontFamily: "'Rajdhani', sans-serif" }}>COMPARISON FAILED</h2>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Link to="/leaderboard" className="btn-primary">RETURN TO LEADERBOARD</Link>
      </div>
    );
  }

  // Map backend data to stats, ensuring fallbacks if 0
  const stats = [
    { label: "Points", a: a.points || 0, b: b.points || 0, max: Math.max(a.points || 0, b.points || 0, 1000) },
    { label: "Level", a: a.level || 1, b: b.level || 1, max: Math.max(a.level || 1, b.level || 1, 10) },
    { label: "Wins", a: a.wins || 0, b: b.wins || 0, max: Math.max(a.wins || 0, b.wins || 0, 5) },
    { label: "Win Rate %", a: a.win_rate || 0, b: b.win_rate || 0, max: 100 },
    { label: "XP", a: a.xp || 0, b: b.xp || 0, max: Math.max(a.xp || 0, b.xp || 0, 1000) },
    { label: "Streak", a: a.streak || 0, b: b.streak || 0, max: Math.max(a.streak || 0, b.streak || 0, 3) },
  ];

  const aScore = stats.filter(s => s.a >= s.b).length;
  const bScore = stats.length - aScore;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <Link to="/players" className="text-xs text-muted-foreground hover:text-foreground mb-6 inline-block transition-colors">← Back to Leaderboard</Link>
      
      <h1 className="text-4xl md:text-5xl font-black text-white mb-8 text-center" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
        <span className="text-violet-400 text-glow truncate block md:inline">{a.username}</span>
        <span className="text-muted-foreground mx-4 text-3xl hidden md:inline">VS</span>
        <span className="text-cyan-400 text-glow-cyan truncate block md:inline">{b.username}</span>
      </h1>

      {/* Player cards */}
      <div className="grid grid-cols-2 gap-4 md:gap-6 mb-8">
        {[
          { p: a, color: "#7c3aed", gradient: "from-violet-600 to-violet-900", score: aScore }, 
          { p: b, color: "#06b6d4", gradient: "from-cyan-600 to-cyan-900", score: bScore }
        ].map(({ p, color, gradient, score }) => (
          <Link key={p.id} to={`/players/${p.id}`}
            className="glass border rounded-2xl p-5 text-center card-hover transition-all"
            style={{ borderColor: `${color}40` }}>
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-black text-xl mx-auto mb-3 shadow-[0_0_20px_rgba(0,0,0,0.5)]`}>
              {p.avatar || "V4"}
            </div>
            <h3 className="text-lg font-black text-white mb-0.5 truncate" style={{ fontFamily: "'Rajdhani', sans-serif" }}>{p.username}</h3>
            <p className="text-xs font-bold mb-1 uppercase tracking-widest" style={{ color, fontFamily: "'Rajdhani', sans-serif" }}>{p.tier}</p>
            <p className="text-xs text-muted-foreground">Level {p.level}</p>
            <div className="mt-4 text-3xl font-black" style={{ fontFamily: "'Rajdhani', sans-serif", color }}>{score}/{stats.length}</div>
            <div className="text-xs text-muted-foreground tracking-widest" style={{ fontFamily: "'Rajdhani', sans-serif" }}>STATS WON</div>
          </Link>
        ))}
      </div>

      {/* Winner badge */}
      <div className="text-center mb-10 fade-up">
        <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-yellow-500/10 border border-yellow-500/30 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
          <span className="text-yellow-400 text-xl">🏆</span>
          <span className="text-base font-black text-yellow-400 tracking-widest" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
            {aScore > bScore ? a.username : bScore > aScore ? b.username : "IT'S A TIE!"} LEADS
          </span>
        </div>
      </div>

      {/* Stats comparison */}
      <div className="glass border border-border rounded-2xl px-6 py-4 fade-up delay-100">
        <h3 className="text-sm font-black text-white mb-4 text-center tracking-widest" style={{ fontFamily: "'Rajdhani', sans-serif" }}>STAT BREAKDOWN</h3>
        {stats.map(s => <StatBar key={s.label} label={s.label} a={s.a} b={s.b} maxVal={s.max} />)}
      </div>
    </div>
  );
}