import { useState, useEffect } from "react";
import { api } from "../../lib/api";

export default function AdminDashboard() {
  const [players, setPlayers] = useState<any[]>([]);
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch all players and tournaments simultaneously 
    Promise.all([
      api.get("/admin/players"),
      api.get("/tournaments/")
    ])
      .then(([playersData, tournamentsData]) => {
        setPlayers(playersData);
        setTournaments(tournamentsData);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load admin data", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="text-violet-400 font-bold tracking-widest animate-pulse" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
        GATHERING SYSTEM DATA...
      </div>
    );
  }

  // Dynamically calculate platform statistics
  const totalPoints = players.reduce((sum, p) => sum + (p.points || 0), 0);
  const totalRegistrations = tournaments.reduce((sum, t) => sum + (t.players_registered || 0), 0);
  const activePlayers = players.filter(p => p.level > 1 || p.points > 0).length;

  const stats = [
    { label: "Total Players", value: players.length.toString(), icon: "👥", change: "System wide" },
    { label: "Active Players", value: activePlayers.toString(), icon: "🟢", change: "Level 2+ or with points" },
    { label: "Tournaments", value: tournaments.length.toString(), icon: "🏆", change: "Total events" },
    { label: "Registrations", value: totalRegistrations.toString(), icon: "📝", change: "Across all tournaments" },
    { label: "Points Distributed", value: totalPoints.toLocaleString(), icon: "⚡", change: "Total platform points" },
    { label: "Admins", value: players.filter(p => p.is_admin).length.toString(), icon: "🛡️", change: "Authorized accounts" },
  ];

  return (
    <div>
      <h1 className="text-3xl font-black text-white mb-6" style={{ fontFamily: "'Rajdhani', sans-serif" }}>ADMIN DASHBOARD</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className="glass border border-border rounded-xl p-4">
            <div className="flex items-start justify-between mb-2">
              <span className="text-2xl">{s.icon}</span>
              <span className="text-xs text-muted-foreground">{s.change}</span>
            </div>
            <p className="text-2xl font-black text-white font-mono-data" style={{ fontFamily: "'Rajdhani', sans-serif" }}>{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent players */}
        <div className="glass border border-border rounded-xl p-5">
          <h3 className="text-sm font-black text-white mb-4" style={{ fontFamily: "'Rajdhani', sans-serif" }}>ALL REGISTERED PLAYERS</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
            {players.length === 0 ? (
              <p className="text-xs text-muted-foreground">No players found.</p>
            ) : (
              // Reverse the array to show newest registrations first
              [...players].reverse().map(p => (
                <div key={p.id} className="flex items-center gap-3 text-sm border-b border-border/40 pb-2 last:border-0 last:pb-0">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center text-white font-black text-xs shrink-0">
                    {p.avatar || "V4"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-bold text-foreground truncate block">{p.username}</span>
                    <span className="text-[10px] text-muted-foreground truncate block">{p.email}</span>
                  </div>
                  <span className="text-muted-foreground text-xs font-mono-data">Lv.{p.level}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold tracking-widest ${p.is_admin ? "bg-red-500/20 text-red-400 border border-red-500/30" : "badge-open"}`} style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                    {p.is_admin ? "ADMIN" : "PLAYER"}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Tournaments */}
        <div className="glass border border-border rounded-xl p-5">
          <h3 className="text-sm font-black text-white mb-4" style={{ fontFamily: "'Rajdhani', sans-serif" }}>TOURNAMENT STATUS</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
            {tournaments.length === 0 ? (
              <p className="text-xs text-muted-foreground">No tournaments created yet.</p>
            ) : (
              tournaments.map(t => (
                <div key={t.id} className="flex items-center gap-3 text-sm border-b border-border/40 pb-2 last:border-0 last:pb-0">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${t.status === "live" ? "bg-red-500 pulse-dot" : t.status === "open" ? "bg-green-500" : t.status === "soon" ? "bg-cyan-500" : "bg-muted-foreground"}`}></div>
                  <div className="flex-1 min-w-0">
                    <span className="text-foreground font-bold truncate block">{t.name}</span>
                    <span className="text-[10px] text-muted-foreground">{t.date} · {t.game}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground block font-mono-data">{t.players_registered}/{t.max_players}</span>
                    <span className="text-[10px] text-violet-400">PLAYERS</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}