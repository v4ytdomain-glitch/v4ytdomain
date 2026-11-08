import { useState, useEffect } from "react";
import { players } from "../data/mock";

export default function LiveTournament() {
  const [elapsed, setElapsed] = useState(0);
  const [elims, setElims] = useState([
    { player: "CYBER_WOLF", position: 40, time: "2:14 ago" },
    { player: "INFERNO_ACE", position: 39, time: "1:52 ago" },
    { player: "GAMER_777", position: 38, time: "0:34 ago" },
  ]);

  useEffect(() => {
    const t = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2,"0")}:${String(s % 60).padStart(2,"0")}`;
  const remaining = 22;
  const liveRankings = players.slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Live header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2.5 h-2.5 bg-red-500 rounded-full pulse-dot"></div>
            <span className="text-sm font-black text-red-400 tracking-widest" style={{ fontFamily: "'Rajdhani', sans-serif" }}>LIVE NOW</span>
          </div>
          <h1 className="text-4xl font-black text-white" style={{ fontFamily: "'Rajdhani', sans-serif" }}>V4YT WEEKLY SHOWDOWN</h1>
          <p className="text-muted-foreground">Round 2 — Battle Royale · Free Fire</p>
        </div>
        <div className="glass border border-red-500/30 rounded-xl px-5 py-3 text-center">
          <p className="text-xs text-muted-foreground mb-0.5">MATCH TIME</p>
          <p className="text-2xl font-black text-red-400 font-mono-data" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{fmt(elapsed)}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Current match info */}
        <div className="lg:col-span-2 space-y-5">
          {/* Stats bar */}
          <div className="grid grid-cols-3 gap-4">
            {[{ label: "Players Remaining", value: remaining, icon: "👥" }, { label: "Safe Zone", value: "Zone 3", icon: "🔵" }, { label: "Current Round", value: "Round 2", icon: "⚔️" }].map(s => (
              <div key={s.label} className="glass border border-border rounded-xl p-4 text-center">
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className="text-xl font-black text-white" style={{ fontFamily: "'Rajdhani', sans-serif" }}>{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Live leaderboard */}
          <div className="glass border border-border rounded-xl p-5">
            <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
              <span className="w-2 h-2 bg-red-500 rounded-full pulse-dot"></span> LIVE RANKINGS
            </h3>
            <div className="space-y-2">
              {liveRankings.map((p, i) => (
                <div key={p.id} className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${i === 0 ? "bg-yellow-500/10 border-yellow-500/20" : "bg-secondary/50 border-border"}`}>
                  <span className={`w-7 text-center font-black text-sm ${i === 0 ? "text-yellow-400" : i === 1 ? "text-slate-300" : i === 2 ? "text-orange-500" : "text-muted-foreground"}`} style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                    {["🥇","🥈","🥉"][i] || `#${i+1}`}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center text-white font-black text-xs shrink-0">{p.avatar}</div>
                  <span className="flex-1 text-sm font-bold text-white" style={{ fontFamily: "'Rajdhani', sans-serif" }}>{p.username}</span>
                  <div className="text-right">
                    <p className="text-xs font-mono-data text-cyan-400">{Math.floor(Math.random() * 8) + 1} kills</p>
                    <p className="text-xs text-muted-foreground">alive</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Eliminations feed */}
          <div className="glass border border-border rounded-xl p-5">
            <h3 className="text-lg font-black text-white mb-4" style={{ fontFamily: "'Rajdhani', sans-serif" }}>ELIMINATION FEED</h3>
            <div className="space-y-2">
              {elims.map((e, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 bg-red-500/5 border border-red-500/10 rounded-lg">
                  <span className="text-red-400">💀</span>
                  <span className="text-sm text-foreground font-semibold">{e.player}</span>
                  <span className="text-xs text-muted-foreground">eliminated</span>
                  <span className="ml-auto text-xs text-muted-foreground font-mono-data">#{e.position}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="glass neon-border-cyan rounded-xl p-5">
            <h3 className="text-sm font-black text-white mb-4" style={{ fontFamily: "'Rajdhani', sans-serif" }}>NEXT MATCH</h3>
            <p className="text-lg font-bold text-foreground" style={{ fontFamily: "'Rajdhani', sans-serif" }}>GRAND FINALS</p>
            <p className="text-xs text-muted-foreground mb-3">Top 10 players advance</p>
            <div className="flex items-center gap-2 text-xs text-cyan-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Starting when Round 2 ends
            </div>
          </div>

          <div className="glass border border-border rounded-xl p-5">
            <h3 className="text-sm font-black text-white mb-4" style={{ fontFamily: "'Rajdhani', sans-serif" }}>PRIZES</h3>
            <div className="space-y-2">
              {[["🥇 Champion", "+500 PTS"], ["🥈 Runner-up", "+300 PTS"], ["🥉 Third", "+200 PTS"], ["Top 10", "+50 PTS"]].map(([pos, pts]) => (
                <div key={pos} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{pos}</span>
                  <span className="text-green-400 font-mono-data font-bold">{pts}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass border border-border rounded-xl p-5">
            <h3 className="text-sm font-black text-white mb-2" style={{ fontFamily: "'Rajdhani', sans-serif" }}>ZONE TIMER</h3>
            <div className="h-2 bg-secondary rounded-full overflow-hidden mb-2">
              <div className="h-full bg-gradient-to-r from-green-500 to-yellow-500 rounded-full" style={{ width: "60%" }}></div>
            </div>
            <p className="text-xs text-muted-foreground">Zone 3 closes in ~2 minutes</p>
          </div>
        </div>
      </div>
    </div>
  );
}
