import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { api } from "../lib/api";
import ParticleField from "../components/ParticleField";

export default function Dashboard() {
  const [me, setMe] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch the logged-in user's profile
    Promise.all([api.get("/auth/me"), api.get("/tournaments/"), api.get("/achievements/")])
      .then(([data, tournamentData, achievementData]) => {
        setMe(data); setTournaments(tournamentData); setAchievements(achievementData);
        setLoading(false);
      })
      .catch(err => {
        console.error("Authentication failed", err);
        // Kick unauthorized users back to login
        navigate("/login"); 
      });
  }, [navigate]);

  if (loading || !me) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-violet-400 font-bold tracking-widest animate-pulse" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
          LOADING DASHBOARD...
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Welcome banner */}
      <div className="relative border-b border-border overflow-hidden">
        <div className="absolute inset-0 bg-grid-dense opacity-40"></div>
        <ParticleField count={50} />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 60% 80% at 20% 50%, rgba(124,58,237,0.12) 0%, transparent 70%)" }}></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background pointer-events-none"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex flex-wrap items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center text-white font-black text-2xl neon-conic float"
              style={{ boxShadow: "0 0 30px rgba(124,58,237,0.5)" }}>
              {me.avatar}
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-0.5">Welcome back,</p>
              <h1 className="text-4xl md:text-5xl font-black text-white text-glow-white" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                {me.username} <span className="gradient-text">⚡</span>
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-1.5">
                <span className="text-xs font-black text-violet-400 px-2 py-0.5 rounded-full border border-violet-500/30 bg-violet-500/10" style={{ fontFamily: "'Rajdhani', sans-serif" }}>LVL {me.level}</span>
                <span className="text-xs font-black rank-legend px-2 py-0.5 rounded-full border border-yellow-500/20 bg-yellow-500/5" style={{ fontFamily: "'Rajdhani', sans-serif", textTransform: "uppercase" }}>👑 {me.tier}</span>
              </div>
            </div>
            <div className="ml-auto hidden md:block">
              <Link to={`/players/${me.id}`} className="btn-secondary text-xs">VIEW PROFILE →</Link>
            </div>
          </div>

          {/* XP Bar */}
          <div className="mt-6 max-w-xl">
            <div className="flex justify-between text-xs mb-2">
              <span className="text-muted-foreground">Level {me.level} XP Progress</span>
              <span className="font-mono-data text-violet-400">{me.xp.toLocaleString()} / 10,000</span>
            </div>
            <div className="h-3 bg-secondary rounded-full overflow-hidden xp-bar neon-border" style={{ padding: "1px" }}>
              <div className="h-full bg-gradient-to-r from-violet-600 via-violet-400 to-cyan-500 rounded-full"
                style={{ width: `${(me.xp / 10000) * 100}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Quick stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Tournament Wins", val: me.wins || 0, icon: "🏆", color: "from-yellow-500/10 to-transparent border-yellow-500/20" },
                { label: "Matches Played", val: 0, icon: "📊", color: "from-cyan-500/10 to-transparent border-cyan-500/20" },
                { label: "Win Rate", val: `${me.win_rate || 0}%`, icon: "⚡", color: "from-violet-500/10 to-transparent border-violet-500/20" },
                { label: "Streak", val: `${me.streak || 0} 🔥`, icon: "🎯", color: "from-red-500/10 to-transparent border-red-500/20" },
              ].map(({ label, val, icon, color }, i) => (
                <div key={label} className={`glass bg-gradient-to-b ${color} border rounded-xl p-4 text-center card-hover fade-up`} style={{ animationDelay: `${i * 0.08}s` }}>
                  <div className="text-2xl mb-1">{icon}</div>
                  <p className="text-2xl font-black text-white mb-0.5 font-mono-data" style={{ fontFamily: "'Rajdhani', sans-serif" }}>{val}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>

            {/* Points total */}
            <div className="relative rounded-2xl neon-conic overflow-hidden fade-up delay-200" style={{ background: "rgba(10,12,22,0.9)" }}>
              <div className="absolute inset-0 bg-grid-dense opacity-30"></div>
              <div className="relative p-5 flex items-center gap-5">
                <div className="text-4xl">⚡</div>
                <div>
                  <p className="text-xs text-muted-foreground">Total V4YT Points</p>
                  <p className="text-4xl font-black text-white font-mono-data gradient-text" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                    {(me.points || 0).toLocaleString()}
                  </p>
                </div>
                <div className="ml-auto">
                  <Link to="/rewards" className="btn-primary text-xs">SPEND POINTS</Link>
                </div>
              </div>
            </div>

            {/* Next tournament */}
            <div className="glass neon-border rounded-xl p-5 fade-up delay-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-black text-white" style={{ fontFamily: "'Rajdhani', sans-serif" }}>UPCOMING TOURNAMENT</h3>
                <span className="text-xs px-2.5 py-1 rounded-full badge-open font-bold flicker" style={{ fontFamily: "'Rajdhani', sans-serif" }}>REGISTERED ✓</span>
              </div>
              <h4 className="text-xl font-black text-white mb-1 text-glow-white" style={{ fontFamily: "'Rajdhani', sans-serif" }}>{tournaments[0]?.name || "No upcoming tournaments"}</h4>
              <p className="text-sm text-muted-foreground mb-4">{tournaments[0] ? `${tournaments[0].game} · ${tournaments[0].date}` : "Check back soon for events."}</p>
              <p className="text-xs text-muted-foreground mb-2 tracking-widest" style={{ fontFamily: "'Rajdhani', sans-serif" }}>MATCH STARTS IN:</p>
              <div className="grid grid-cols-4 gap-2 mb-4">
                {[{ v: "01", l: "DAYS" }, { v: "04", l: "HRS" }, { v: "32", l: "MIN" }, { v: "18", l: "SEC" }].map(item => (
                  <div key={item.l} className="relative bg-background/80 rounded-xl p-3 text-center border border-violet-500/20 overflow-hidden">
                    <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-violet-500/40 to-transparent"></div>
                    <div className="text-2xl font-black text-white font-mono-data" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{item.v}</div>
                    <div className="text-xs text-muted-foreground mt-0.5 tracking-wider" style={{ fontFamily: "'Rajdhani', sans-serif" }}>{item.l}</div>
                  </div>
                ))}
              </div>
              {tournaments[0] && <Link to={`/tournaments/${tournaments[0].id}`} className="btn-primary w-full text-center block text-xs">VIEW TOURNAMENT</Link>}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Achievements */}
            <div className="glass border border-border rounded-xl p-5 fade-up delay-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-black text-white" style={{ fontFamily: "'Rajdhani', sans-serif" }}>ACHIEVEMENTS</h3>
                <Link to="/achievements" className="text-xs text-violet-400 hover:text-violet-300 transition-colors">View all</Link>
              </div>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {achievements.slice(0, 8).map(a => (
                  <div key={a.id} title={a.name}
                    className={`glass border rounded-lg p-2 text-center transition-all hover:scale-110 ${a.unlocked ? "border-violet-500/30 hover:border-violet-500/60 hover:shadow-[0_0_15px_rgba(124,58,237,0.3)]" : "border-border opacity-35 grayscale"}`}>
                    <div className="text-xl">{a.icon}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rank card */}
            <div className="relative glass neon-border rounded-xl p-5 overflow-hidden fade-up delay-300">
              <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 100% 100%, rgba(124,58,237,0.08) 0%, transparent 60%)" }}></div>
              <div className="relative">
                <h3 className="text-sm font-black text-white mb-3" style={{ fontFamily: "'Rajdhani', sans-serif" }}>RANK STATUS</h3>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-4xl float">👑</span>
                  <div>
                    <p className="text-xl font-black rank-legend uppercase" style={{ fontFamily: "'Rajdhani', sans-serif" }}>{me.tier}</p>
                    <p className="text-xs text-muted-foreground">{(me.points || 0).toLocaleString()} V4YT Points</p>
                  </div>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden xp-bar">
                  <div className="h-full rounded-full" style={{ width: "82%", background: "linear-gradient(90deg, #f59e0b, #ef4444, #a855f7)" }}></div>
                </div>
                <p className="text-xs text-muted-foreground mt-1.5">Season 01 Active Rank</p>
              </div>
            </div>
            
            {/* Quick links */}
            <div className="glass border border-border rounded-xl p-5 fade-up delay-400">
              <h3 className="text-sm font-black text-white mb-4" style={{ fontFamily: "'Rajdhani', sans-serif" }}>QUICK ACCESS</h3>
              <div className="space-y-1">
                {[["🏆 Tournaments", "/tournaments"], ["📊 Leaderboard", "/leaderboard"], ["🎖️ Rewards", "/rewards"], ["👥 Teams", "/teams"], ["⚙️ Settings", "/settings"]].map(([label, path]) => (
                  <Link key={path} to={path}
                    className="flex items-center justify-between text-sm text-muted-foreground hover:text-white px-3 py-2.5 rounded-lg hover:bg-violet-500/8 transition-all group cyber-line">
                    <span>{label}</span>
                    <span className="text-xs opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-violet-400">→</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
