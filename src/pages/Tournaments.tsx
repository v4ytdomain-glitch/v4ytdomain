import { useState, useEffect } from "react";
import { Link } from "react-router";
import { api } from "../lib/api";
import ParticleField from "../components/ParticleField";

const filters = ["All", "Upcoming", "Live", "Completed"];

export default function Tournaments() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch real data on component mount
  useEffect(() => {
    api.get("/tournaments/")
      .then(data => {
        setTournaments(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load tournaments", err);
        setLoading(false);
      });
  }, []);

  const filtered = tournaments.filter(t => {
    if (activeFilter === "All") return true;
    if (activeFilter === "Live") return t.status === "live";
    if (activeFilter === "Completed") return t.status === "completed";
    if (activeFilter === "Upcoming") return t.status === "open" || t.status === "soon";
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-violet-400 font-bold tracking-widest animate-pulse" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
          LOADING TOURNAMENTS...
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="relative border-b border-border overflow-hidden" style={{ minHeight: "220px" }}>
        <div className="absolute inset-0 bg-grid-dense opacity-50"></div>
        <ParticleField count={40} />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 60% 80% at 50% 0%, rgba(124,58,237,0.14) 0%, transparent 70%)" }}></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background pointer-events-none"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <p className="text-xs font-semibold tracking-widest text-violet-400 mb-2 fade-up" style={{ fontFamily: "'Rajdhani', sans-serif" }}>V4YT OFFICIAL</p>
          <h1 className="text-6xl md:text-7xl font-black text-white mb-2 fade-up delay-100" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
            TOURNA<span className="gradient-text">MENTS</span>
          </h1>
          <p className="text-muted-foreground fade-up delay-200">Compete. Climb. Become a Champion.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Filters */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {filters.map(f => (
            <button key={f} onClick={() => setActiveFilter(f)}
              className={`relative px-5 py-2 rounded-xl text-sm font-bold tracking-widest transition-all overflow-hidden ${activeFilter === f ? "text-white border border-violet-500/50" : "bg-secondary border border-border text-muted-foreground hover:text-white hover:border-violet-500/30"}`}
              style={{ fontFamily: "'Rajdhani', sans-serif" }}>
              {activeFilter === f && (
                <>
                  <span className="absolute inset-0 bg-gradient-to-r from-violet-600/80 to-violet-700/80"></span>
                  <span className="absolute inset-0" style={{ boxShadow: "inset 0 0 20px rgba(124,58,237,0.3)" }}></span>
                </>
              )}
              <span className="relative">{f.toUpperCase()}</span>
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center glass border border-border rounded-2xl">
            <div className="text-6xl mb-4 float">🎮</div>
            <h3 className="text-2xl font-black text-white mb-2" style={{ fontFamily: "'Rajdhani', sans-serif" }}>NO TOURNAMENTS FOUND</h3>
            <p className="text-muted-foreground mb-6">No tournaments match this filter or database is empty.</p>
            <button onClick={() => setActiveFilter("All")} className="btn-primary">VIEW ALL TOURNAMENTS</button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {filtered.map((t, i) => (
              <div key={t.id} className={`glass border border-border rounded-2xl overflow-hidden card-hover card-sheen corner-glow group fade-up`} style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="relative h-56 bg-secondary overflow-hidden">
                  <img src={t.image || "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=400&fit=crop"} alt={t.name} className="w-full h-full object-cover opacity-50 group-hover:opacity-70 group-hover:scale-105 transition-all duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent"></div>

                  {/* Status strip */}
                  <div className={`absolute top-0 left-0 right-0 h-0.5`}
                    style={{
                      background: t.status === "live"
                        ? "linear-gradient(90deg, transparent, #ef4444, transparent)"
                        : t.status === "open"
                          ? "linear-gradient(90deg, transparent, #22c55e, transparent)"
                          : t.status === "soon"
                            ? "linear-gradient(90deg, transparent, #06b6d4, transparent)"
                            : "none",
                      boxShadow: t.status === "live" ? "0 0 15px rgba(239,68,68,0.7)" : t.status === "open" ? "0 0 15px rgba(34,197,94,0.6)" : t.status === "soon" ? "0 0 15px rgba(6,182,212,0.5)" : "none",
                    }}>
                  </div>

                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    {t.status === "live" && <div className="w-2 h-2 bg-red-500 rounded-full pulse-dot"></div>}
                    <span className={`text-xs px-3 py-1 rounded-full font-bold tracking-wide ${t.status === "live" ? "badge-live" : t.status === "open" ? "badge-open" : t.status === "soon" ? "badge-soon" : "badge-done"}`} style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                      {t.status === "live" ? "LIVE NOW" : t.status === "open" ? "REGISTRATION OPEN" : t.status === "soon" ? "COMING SOON" : "COMPLETED"}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-xl font-black text-white mb-1 group-hover:text-glow-white transition-all" style={{ fontFamily: "'Rajdhani', sans-serif" }}>{t.name}</h3>
                  <p className="text-xs text-muted-foreground mb-4">{t.game} · {t.date} · {t.time}</p>

                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {[
                      { label: "Players", val: `${t.players_registered}/${t.max_players}` },
                      { label: "Prize", val: t.prize, highlight: true },
                      { label: "Status", val: t.status === "live" ? "LIVE" : t.status === "open" ? "OPEN" : t.status === "soon" ? "SOON" : "DONE", color: t.status === "live" ? "#ef4444" : t.status === "open" ? "#22c55e" : t.status === "soon" ? "#06b6d4" : "" },
                    ].map(item => (
                      <div key={item.label} className="bg-secondary/80 rounded-lg p-2.5 text-center border border-border">
                        <p className="text-xs text-muted-foreground mb-0.5">{item.label}</p>
                        <p className={`text-xs font-bold ${item.highlight ? "text-yellow-400" : ""}`} style={{ color: item.color || undefined }}>{item.val}</p>
                      </div>
                    ))}
                  </div>

                  {t.status !== "completed" && (
                    <div className="mb-4">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Registration</span>
                        <span className="font-mono-data">{t.players_registered}/{t.max_players}</span>
                      </div>
                      <div className="h-1.5 bg-secondary rounded-full overflow-hidden xp-bar">
                        <div className="h-full bg-gradient-to-r from-violet-600 to-cyan-500 rounded-full" style={{ width: `${(t.players_registered / t.max_players) * 100}%` }}></div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Link to={`/tournaments/${t.id}`} className="btn-secondary flex-1 text-center text-xs">VIEW DETAILS</Link>
                    {t.status === "open" && <Link to={`/tournaments/${t.id}/register`} className="btn-primary flex-1 text-center text-xs">REGISTER NOW</Link>}
                    {t.status === "live" && <Link to={`/tournaments/${t.id}/live`} className="btn-cyan flex-1 text-center text-xs">🔴 WATCH LIVE</Link>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}