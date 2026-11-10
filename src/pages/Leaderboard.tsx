import { useState, useEffect } from "react";
import { Link } from "react-router";
import { api } from "../lib/api";
import ParticleField from "../components/ParticleField";

const tabs = ["GLOBAL", "WEEKLY", "MONTHLY", "SEASON", "GAME", "TEAM"];
const tierColors: Record<string, string> = { legend: "#f59e0b", master: "#c084fc", diamond: "#b9f2ff", platinum: "#00b4d8", gold: "#ffd700", silver: "#c0c0c0", bronze: "#cd7f32" };
const tierIcons: Record<string, string> = { legend: "👑", master: "🔮", diamond: "💎", platinum: "💠", gold: "🥇", silver: "🥈", bronze: "🥉" };
const tierGlow: Record<string, string> = { legend: "0 0 20px rgba(245,158,11,0.4)", master: "0 0 20px rgba(192,132,252,0.4)", diamond: "0 0 20px rgba(185,242,255,0.3)", platinum: "0 0 20px rgba(0,180,216,0.35)", gold: "0 0 20px rgba(255,215,0,0.4)" };

export default function Leaderboard() {
  const [activeTab, setActiveTab] = useState("GLOBAL");
  const [search, setSearch] = useState("");
  const [hovered, setHovered] = useState<number | null>(null);
  
  // New state variables for API data
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const period = activeTab === "MONTHLY" || activeTab === "WEEKLY" ? "monthly" : activeTab === "GAME" ? "game" : activeTab === "TEAM" ? "team" : "all-time";
    setLoading(true);
    api.get(`/leaderboard/${period}`)
      .then(data => {
        setPlayers(activeTab === "TEAM" ? data.map((team: any) => ({ ...team, username: team.name, avatar: team.name.slice(0, 2), tier: "team" })) : data);
        setLoadError("");
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load leaderboard", err);
        setLoadError(err.message || "Unable to load leaderboard.");
        setLoading(false);
      });
  }, [activeTab]);

  const filtered = players.filter(p => p.username.toLowerCase().includes(search.toLowerCase()));
  const top3 = filtered.slice(0, 3);
  const rest = filtered.slice(3);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-cyan-400 font-bold tracking-widest animate-pulse" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
        LOADING LEADERBOARD...
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="relative border-b border-border overflow-hidden" style={{ minHeight: "220px" }}>
        <div className="absolute inset-0 bg-grid-dense opacity-50"></div>
        <ParticleField count={40} />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 60% 80% at 50% 0%, rgba(6,182,212,0.12) 0%, transparent 70%)" }}></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <p className="text-xs font-semibold tracking-widest text-cyan-400 mb-2 fade-up" style={{ fontFamily: "'Rajdhani', sans-serif" }}>RANKINGS</p>
          <h1 className="text-6xl md:text-7xl font-black text-white fade-up delay-100" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
            LEADER<span style={{ color: "#06b6d4", textShadow: "0 0 30px rgba(6,182,212,0.6)" }}>BOARD</span>
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {loadError && <p role="alert" className="text-red-400 mb-4">{loadError}</p>}
        {/* Tabs */}
        <div className="flex gap-0 border-b border-border mb-10 overflow-x-auto">
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`relative px-6 py-3 text-sm font-black tracking-widest whitespace-nowrap transition-all border-b-2 -mb-px ${activeTab === tab ? "border-cyan-500 text-cyan-400" : "border-transparent text-muted-foreground hover:text-foreground"}`}
              style={{ fontFamily: "'Rajdhani', sans-serif" }}>
              {activeTab === tab && (
                <span className="absolute inset-0 bg-cyan-500/5"></span>
              )}
              {tab}
            </button>
          ))}
        </div>

        {players.length === 0 ? (
           <div className="text-center py-20 glass border border-border rounded-xl">
             <div className="text-5xl mb-4">👑</div>
             <h3 className="text-2xl font-black text-white mb-2" style={{ fontFamily: "'Rajdhani', sans-serif" }}>NO PLAYERS YET</h3>
             <p className="text-muted-foreground">The arena is empty. Register to claim the #1 spot!</p>
           </div>
        ) : (
          <>
            {/* Podium */}
            {!search && top3.length > 0 && (
              <div className="relative flex items-end justify-center gap-2 sm:gap-6 mb-14">
                {/* Background glow */}
                <div className="absolute inset-0 flex items-end justify-center pointer-events-none">
                  <div className="w-64 h-32 rounded-full" style={{ background: "radial-gradient(ellipse, rgba(255,215,0,0.08) 0%, transparent 70%)", filter: "blur(20px)" }}></div>
                </div>

                {/* Reorder top 3 for podium display (2nd, 1st, 3rd) */}
                {[top3[1], top3[0], top3[2]].map((p, idx) => {
                  if (!p) return null;
                  const isFirst = idx === 1;
                  const heightMap = ["h-28", "h-44", "h-24"];
                  const podiumBg = ["bg-slate-400/10 border-slate-400/20", "bg-yellow-500/10 border-yellow-500/30", "bg-orange-500/8 border-orange-500/20"];
                  const medals = ["🥈", "🥇", "🥉"];
                  const labelColors = ["text-slate-300", "text-yellow-400", "text-orange-400"];

                  return (
                    <Link key={p.id} to={activeTab === "TEAM" ? "/teams" : `/players/${p.id}`}
                      className={`flex flex-col items-center group ${isFirst ? "z-10" : ""}`}>
                      {/* Avatar */}
                      <div className={`relative mb-2 ${isFirst ? "scale-in" : "fade-up"}`} style={{ animationDelay: isFirst ? "0.1s" : "0.2s" }}>
                        {isFirst && (
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-3xl float">👑</div>
                        )}
                        <div
                          className={`${isFirst ? "w-20 h-20" : "w-14 h-14"} rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center text-white font-black ${isFirst ? "text-lg ring-2 ring-yellow-400/70" : "text-sm"} transition-transform group-hover:scale-110`}
                          style={{ boxShadow: isFirst ? "0 0 30px rgba(245,158,11,0.5), 0 0 60px rgba(245,158,11,0.2)" : tierGlow[p.tier] || "" }}
                        >
                          {p.avatar}
                        </div>
                      </div>

                      <p className={`font-black text-white text-center mb-0.5 ${isFirst ? "text-base" : "text-sm"} group-hover:text-glow transition-all`} style={{ fontFamily: "'Rajdhani', sans-serif" }}>{p.username}</p>
                      <p className="text-xs font-mono-data mb-1" style={{ color: tierColors[p.tier] }}>{(p.points || 0).toLocaleString()}</p>

                      {/* Podium block */}
                      <div className={`${heightMap[idx]} w-20 sm:w-28 rounded-t-xl border flex flex-col items-center justify-start pt-3 transition-all group-hover:border-opacity-60 ${podiumBg[idx]}`}>
                        <span className={`text-2xl mb-1`}>{medals[idx]}</span>
                        <span className={`text-xs font-black ${labelColors[idx]}`} style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                          {["2ND", "1ST", "3RD"][idx]}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Search */}
            <div className="mb-6 flex gap-3">
              <div className="relative flex-1 max-w-sm">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search player..."
                  className="w-full bg-secondary border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder-muted-foreground outline-none focus:border-cyan-500/50 focus:shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all" />
              </div>
            </div>

            {/* Full table */}
            <div className="glass border border-border rounded-2xl overflow-hidden" style={{ boxShadow: "0 0 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(124,58,237,0.05)" }}>
              {/* Header */}
              <div className="grid grid-cols-12 gap-2 px-5 py-3.5 border-b border-border" style={{ background: "rgba(14,16,32,0.8)" }}>
                {["RANK", "PLAYER", "LEVEL", "TIER", "POINTS", "WINS"].map((h, i) => (
                  <span key={h} className={`text-xs font-black text-muted-foreground tracking-widest ${i === 1 ? "col-span-4 md:col-span-3" : i >= 5 ? "hidden md:block" : "col-span-2"}`}
                    style={{ fontFamily: "'Rajdhani', sans-serif" }}>{h}</span>
                ))}
              </div>

              {(search ? filtered : rest).map((p, i) => {
                // Calculate the true rank based on index. If searching, we show relative rank or a dash.
                const trueRank = players.findIndex(x => x.id === p.id) + 1;
                const isHovered = hovered === p.id;
                
                return (
                  <Link key={p.id} to={activeTab === "TEAM" ? "/teams" : `/players/${p.id}`}
                    onMouseEnter={() => setHovered(p.id)}
                    onMouseLeave={() => setHovered(null)}
                    className="grid grid-cols-12 gap-2 px-5 py-4 border-b border-border/40 last:border-0 items-center transition-all"
                    style={{ background: isHovered ? "rgba(124,58,237,0.05)" : "transparent", borderLeft: isHovered ? "2px solid rgba(124,58,237,0.4)" : "2px solid transparent" }}>
                    
                    <span className="col-span-2 text-sm font-black text-muted-foreground font-mono-data">#{trueRank}</span>
                    
                    <div className="col-span-4 md:col-span-3 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center text-white font-black text-xs shrink-0 transition-transform" style={{ transform: isHovered ? "scale(1.1)" : "scale(1)", boxShadow: isHovered ? "0 0 15px rgba(124,58,237,0.4)" : "" }}>
                        {p.avatar}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-black text-white transition-all truncate" style={{ fontFamily: "'Rajdhani', sans-serif", textShadow: isHovered ? "0 0 15px rgba(124,58,237,0.5)" : "" }}>{p.username}</p>
                        <p className="text-xs text-muted-foreground truncate">V4YT-{String(p.id).padStart(5,"0")}</p>
                      </div>
                    </div>
                    
                    <span className="col-span-2 text-sm text-muted-foreground font-mono-data">Lv.{p.level}</span>
                    
                    <div className="col-span-2 flex items-center gap-1.5">
                      <span className="text-base">{tierIcons[p.tier] || "🥉"}</span>
                      <span className="text-[10px] font-black hidden lg:block" style={{ color: tierColors[p.tier], textShadow: `0 0 10px ${tierColors[p.tier]}60` }}>{p.tier.toUpperCase()}</span>
                    </div>
                    
                    <span className="col-span-2 text-sm font-black font-mono-data text-white">{(p.points || 0).toLocaleString()}</span>
                    
                    <span className="col-span-2 text-sm text-muted-foreground hidden md:block font-mono-data">{p.wins || 0}</span>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
