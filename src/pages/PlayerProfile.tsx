import { useState, useEffect } from "react";
import { Link, useParams } from "react-router";
import { api } from "../lib/api";
import { pointHistory } from "../data/mock"; // Keep pointHistory mocked for now

const tierColors: Record<string, string> = { legend: "#f59e0b", master: "#c084fc", diamond: "#b9f2ff", platinum: "#00b4d8", gold: "#ffd700", silver: "#c0c0c0", bronze: "#cd7f32" };

export default function PlayerProfile() {
  const { id } = useParams();
  const [player, setPlayer] = useState<any>(null);
  const [playerBadges, setPlayerBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch the player AND their unlocked badges simultaneously
    Promise.all([
      api.get(`/players/${id}`),
      api.get(`/achievements/user/${id}`)
    ])
      .then(([playerData, badgesData]) => {
        setPlayer(playerData);
        setPlayerBadges(badgesData);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load player", err);
        setError("Player not found in the database.");
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-cyan-400 font-bold tracking-widest animate-pulse" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
          LOADING PLAYER DATA...
        </div>
      </div>
    );
  }

  if (error || !player) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center">
        <div className="text-6xl mb-4">👻</div>
        <h2 className="text-2xl font-black text-white mb-2" style={{ fontFamily: "'Rajdhani', sans-serif" }}>PLAYER NOT FOUND</h2>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Link to="/leaderboard" className="btn-primary">RETURN TO LEADERBOARD</Link>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Section */}
      <div className="relative bg-card border-b border-border overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-20"></div>
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 60% 80% at 30% 50%, rgba(124,58,237,0.15) 0%, transparent 70%)" }}></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex flex-wrap items-center gap-6">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center text-white font-black text-3xl neon-border shadow-[0_0_30px_rgba(124,58,237,0.3)]">
              {player.avatar || "V4"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h1 className="text-4xl font-black text-white" style={{ fontFamily: "'Rajdhani', sans-serif" }}>{player.username}</h1>
                <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/20 border border-violet-500/30 text-violet-400 font-bold" style={{ fontFamily: "'Rajdhani', sans-serif" }}>LVL {player.level}</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-widest" style={{ background: "rgba(124,58,237,0.1)", border: `1px solid ${tierColors[player.tier] || "#fff"}40`, color: tierColors[player.tier] || "#fff", fontFamily: "'Rajdhani', sans-serif" }}>
                  {player.tier}
                </span>
                {player.is_admin && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 font-bold tracking-widest" style={{ fontFamily: "'Rajdhani', sans-serif" }}>ADMIN</span>
                )}
              </div>
              <p className="text-muted-foreground text-sm mb-3">V4YT-{String(player.id).padStart(5,"0")}</p>
              <div className="flex flex-wrap gap-4 text-sm">
                {[
                  ["Points", (player.points || 0).toLocaleString()], 
                  ["Wins", player.wins || 0], 
                  ["Win Rate", `${player.win_rate || 0}%`], 
                  ["Streak", `${player.streak || 0}🔥`]
                ].map(([label, val]) => (
                  <div key={label as string}>
                    <span className="text-muted-foreground">{label}: </span>
                    <span className="font-bold text-foreground font-mono-data">{val}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <Link to={`/players/compare?a=${player.id}&b=2`} className="btn-secondary text-xs">⚖ COMPARE</Link>
            </div>
          </div>

          {/* XP bar */}
          <div className="mt-6 max-w-xl">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-muted-foreground">Level {player.level} → Level {player.level + 1}</span>
              <span className="font-mono-data text-violet-400">{(player.xp || 0).toLocaleString()} / 10,000 XP</span>
            </div>
            <div className="h-2.5 bg-secondary rounded-full overflow-hidden neon-border" style={{ padding: "1px" }}>
              <div className="h-full bg-gradient-to-r from-violet-600 to-cyan-500 rounded-full transition-all" style={{ width: `${((player.xp || 0) / 10000) * 100}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Stats */}
            <div>
              <h2 className="text-xl font-black text-white mb-4" style={{ fontFamily: "'Rajdhani', sans-serif" }}>STATISTICS</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  ["Tournament Wins", player.wins || 0, "🏆"], 
                  ["Runner-ups", Math.floor((player.wins || 0) * 0.5), "🥈"], 
                  ["3rd Places", Math.floor((player.wins || 0) * 0.3), "🥉"], 
                  ["Matches Played", (player.wins || 0) * 3, "⚔️"], 
                  ["Win Rate", `${player.win_rate || 0}%`, "📊"], 
                  ["Streak", player.streak || 0, "🔥"], 
                  ["XP Earned", (player.xp || 0).toLocaleString(), "⚡"]
                ].map(([label, val, icon]) => (
                  <div key={label as string} className="glass border border-border rounded-xl p-4 card-hover">
                    <div className="text-xl mb-1">{icon}</div>
                    <div className="text-xl font-black text-white font-mono-data" style={{ fontFamily: "'Rajdhani', sans-serif" }}>{val}</div>
                    <div className="text-xs text-muted-foreground">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent results (Mocked for now) */}
            <div>
              <h2 className="text-xl font-black text-white mb-4" style={{ fontFamily: "'Rajdhani', sans-serif" }}>RECENT RESULTS</h2>
              <div className="space-y-2">
                {[{ t: "V4YT Championship #12", pos: "🥇 1st", pts: "+500" }, { t: "V4YT Championship #11", pos: "🥈 2nd", pts: "+300" }].map((r, i) => (
                  <div key={i} className="flex items-center gap-4 glass border border-border rounded-lg px-4 py-3">
                    <span className="text-lg">{r.pos.split(" ")[0]}</span>
                    <span className="flex-1 text-sm font-medium text-foreground">{r.t}</span>
                    <span className="text-sm font-bold text-green-400 font-mono-data">{r.pts} PTS</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Point history (Mocked for now) */}
            <div>
              <h2 className="text-xl font-black text-white mb-4" style={{ fontFamily: "'Rajdhani', sans-serif" }}>POINT HISTORY</h2>
              <div className="glass border border-border rounded-xl overflow-hidden">
                {pointHistory.slice(0, 5).map(h => (
                  <div key={h.id} className="flex items-center gap-4 px-4 py-3 border-b border-border/50 last:border-0 hover:bg-white/5 transition-colors">
                    <span className={`text-base font-black font-mono-data ${h.type === "gain" ? "text-green-400" : "text-red-400"}`}>
                      {h.type === "gain" ? "+" : ""}{h.points}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{h.action}</p>
                      <p className="text-xs text-muted-foreground">{h.event}</p>
                    </div>
                    <span className="text-xs text-muted-foreground font-mono-data">{h.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* ACHIEVEMENTS BLOCK (UPDATED) */}
            <div>
              <h2 className="text-xl font-black text-white mb-4" style={{ fontFamily: "'Rajdhani', sans-serif" }}>ACHIEVEMENTS</h2>
              {playerBadges.length === 0 ? (
                <div className="glass border border-border rounded-xl p-5 text-center">
                  <p className="text-sm text-muted-foreground">No badges unlocked yet.</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-2">
                    {playerBadges.slice(0, 6).map(badge => (
                      <div key={badge.id} title={badge.description} className="glass border border-yellow-500/30 bg-yellow-500/5 shadow-[0_0_10px_rgba(245,158,11,0.1)] rounded-xl p-3 text-center transition-transform hover:scale-105 cursor-help">
                        <div className="text-2xl mb-1 drop-shadow-[0_0_10px_rgba(245,158,11,0.4)]">{badge.icon}</div>
                        <div className="text-[10px] text-white font-bold truncate" style={{ fontFamily: "'Rajdhani', sans-serif" }}>{badge.name}</div>
                      </div>
                    ))}
                  </div>
                  {playerBadges.length > 6 && (
                    <Link to="/achievements" className="btn-secondary w-full text-center block mt-3 text-xs">VIEW ALL {playerBadges.length}</Link>
                  )}
                </>
              )}
            </div>

            {/* Rank progress */}
            <div className="glass neon-border rounded-xl p-5">
              <h3 className="text-sm font-black text-white mb-4" style={{ fontFamily: "'Rajdhani', sans-serif" }}>RANK PROGRESS</h3>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">👑</span>
                <div>
                  <p className="text-lg font-black uppercase" style={{ fontFamily: "'Rajdhani', sans-serif", color: tierColors[player.tier] || "#fff" }}>{player.tier}</p>
                  <p className="text-xs text-muted-foreground">{(player.points || 0).toLocaleString()} V4YT Points</p>
                </div>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden mb-2">
                <div className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full" style={{ width: "82%" }}></div>
              </div>
              <p className="text-xs text-muted-foreground">Keep competing to rank up!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}