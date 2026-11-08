import { useState } from "react";
import { Link, useParams } from "react-router";
import { tournaments, players } from "../data/mock";

const tabs = ["Overview", "Rules", "Schedule", "Participants", "Results"];

export default function TournamentDetail() {
  const { id } = useParams();
  const t = tournaments.find(x => x.id === Number(id)) || tournaments[0];
  const [activeTab, setActiveTab] = useState("Overview");

  return (
    <div>
      {/* Banner */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <img src={t.image} alt={t.name} className="w-full h-full object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 pb-8">
          <span className={`inline-block text-xs px-3 py-1 rounded-full font-bold tracking-wide mb-3 ${t.status === "live" ? "badge-live" : t.status === "open" ? "badge-open" : t.status === "soon" ? "badge-soon" : "badge-done"}`} style={{ fontFamily: "'Rajdhani', sans-serif" }}>
            {t.status === "live" ? "🔴 LIVE NOW" : t.status === "open" ? "REGISTRATION OPEN" : t.status === "soon" ? "COMING SOON" : "COMPLETED"}
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-white" style={{ fontFamily: "'Rajdhani', sans-serif" }}>{t.name}</h1>
          <p className="text-muted-foreground">{t.game} · {t.date} · {t.time}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="flex gap-1 mb-6 border-b border-border pb-0 overflow-x-auto">
              {tabs.map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2.5 text-sm font-bold tracking-wide whitespace-nowrap transition-colors border-b-2 -mb-px ${activeTab === tab ? "border-violet-500 text-violet-400" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                  style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                  {tab.toUpperCase()}
                </button>
              ))}
            </div>

            {activeTab === "Overview" && (
              <div className="space-y-5">
                <p className="text-muted-foreground leading-relaxed">{t.description}</p>
                {t.status === "completed" && t.results && (
                  <div className="glass neon-border rounded-2xl p-6">
                    <h3 className="text-lg font-black text-white mb-5" style={{ fontFamily: "'Rajdhani', sans-serif" }}>TOURNAMENT RESULTS</h3>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      {[{ place: "🥈 2ND", name: t.results.second, pts: "+300" }, { place: "🥇 CHAMPION", name: t.results.first, pts: "+500" }, { place: "🥉 3RD", name: t.results.third, pts: "+200" }].map((r, i) => (
                        <div key={i} className={`rounded-xl p-4 border ${i === 1 ? "bg-yellow-500/10 border-yellow-500/30 scale-105" : "bg-secondary border-border"}`}>
                          <p className="text-xs mb-2" style={{ fontFamily: "'Rajdhani', sans-serif", letterSpacing: "0.08em" }}>{r.place}</p>
                          <p className={`text-lg font-black ${i === 1 ? "text-yellow-400" : "text-white"}`} style={{ fontFamily: "'Rajdhani', sans-serif" }}>{r.name}</p>
                          <p className="text-xs text-green-400 mt-1 font-mono-data">{r.pts} PTS</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "Rules" && (
              <div className="glass border border-border rounded-xl p-6">
                <h3 className="text-lg font-black text-white mb-4" style={{ fontFamily: "'Rajdhani', sans-serif" }}>TOURNAMENT RULES</h3>
                <ul className="space-y-3">
                  {(t.rules.length ? t.rules : ["Solo mode only", "No hacks or cheats tolerated", "Must have a valid V4YT Player ID", "Admin decision is final", "Players must join the lobby 15 minutes before start time", "Match screenshots are required as proof", "Unsportsmanlike conduct will result in disqualification"]).map((r, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                      <span className="w-5 h-5 rounded bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-violet-400 font-bold text-xs shrink-0 mt-0.5">{i + 1}</span>
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {activeTab === "Schedule" && (
              <div className="space-y-3">
                {(t.schedule.length ? t.schedule : [{ round: "Registration Closes", time: "30 min before", type: "Admin" }, { round: "Round 1", time: "8:00 PM", type: "Battle Royale" }, { round: "Round 2", time: "9:00 PM", type: "Battle Royale" }, { round: "Grand Finals", time: "10:00 PM", type: "Championship" }]).map((s, i) => (
                  <div key={i} className="flex items-center gap-4 glass border border-border rounded-xl p-4">
                    <div className="w-8 h-8 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-violet-400 font-bold text-sm shrink-0">{i + 1}</div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-white" style={{ fontFamily: "'Rajdhani', sans-serif" }}>{s.round}</p>
                      <p className="text-xs text-muted-foreground">{s.type}</p>
                    </div>
                    <div className="text-sm font-mono-data text-cyan-400">{s.time}</div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "Participants" && (
              <div className="space-y-2">
                {players.slice(0, 8).map((p, i) => (
                  <Link key={p.id} to={`/players/${p.id}`} className="flex items-center gap-3 glass border border-border rounded-lg px-4 py-3 hover:border-violet-500/30 transition-colors">
                    <span className="text-muted-foreground text-xs w-5 font-mono-data">#{i + 1}</span>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center text-white font-black text-xs">{p.avatar}</div>
                    <span className="flex-1 text-sm font-bold text-white" style={{ fontFamily: "'Rajdhani', sans-serif" }}>{p.username}</span>
                    <span className="text-xs text-muted-foreground">Lv. {p.level}</span>
                    <span className="text-xs text-muted-foreground">{p.points.toLocaleString()} pts</span>
                  </Link>
                ))}
                <p className="text-center text-xs text-muted-foreground pt-2">{t.players} players registered · {t.maxPlayers - t.players} spots remaining</p>
              </div>
            )}

            {activeTab === "Results" && t.status === "completed" && t.results && (
              <div className="space-y-3">
                {[{ pos: "🥇 Champion", name: t.results.first, pts: "+500 V4YT Points" }, { pos: "🥈 Runner-up", name: t.results.second, pts: "+300 V4YT Points" }, { pos: "🥉 Third Place", name: t.results.third, pts: "+200 V4YT Points" }].map((r, i) => (
                  <div key={i} className={`flex items-center gap-4 rounded-xl p-4 border ${i === 0 ? "bg-yellow-500/10 border-yellow-500/30" : "glass border-border"}`}>
                    <span className="text-2xl">{["🥇","🥈","🥉"][i]}</span>
                    <div>
                      <p className="text-xs text-muted-foreground" style={{ fontFamily: "'Rajdhani', sans-serif" }}>{r.pos}</p>
                      <p className="text-lg font-black text-white" style={{ fontFamily: "'Rajdhani', sans-serif" }}>{r.name}</p>
                    </div>
                    <div className="ml-auto text-sm font-bold text-green-400">{r.pts}</div>
                  </div>
                ))}
              </div>
            )}
            {activeTab === "Results" && t.status !== "completed" && (
              <div className="text-center py-16 text-muted-foreground">
                <div className="text-4xl mb-3">⏳</div>
                <p>Results will be posted after the tournament ends.</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Stats card */}
            <div className="glass neon-border rounded-xl p-5">
              <h3 className="text-sm font-black text-white mb-4" style={{ fontFamily: "'Rajdhani', sans-serif" }}>TOURNAMENT INFO</h3>
              <div className="space-y-3">
                {[
                  { label: "Prize Pool", value: t.prize, highlight: true },
                  { label: "Participants", value: `${t.players} / ${t.maxPlayers}` },
                  { label: "Game", value: t.game },
                  { label: "Date", value: t.date },
                  { label: "Time", value: t.time },
                ].map(item => (
                  <div key={item.label} className="flex justify-between items-center border-b border-border pb-2 last:border-0 last:pb-0">
                    <span className="text-xs text-muted-foreground">{item.label}</span>
                    <span className={`text-sm font-bold ${item.highlight ? "text-yellow-400" : "text-foreground"}`}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {t.status === "open" && (
              <Link to={`/tournaments/${t.id}/register`} className="btn-primary w-full text-center block">REGISTER NOW</Link>
            )}
            {t.status === "live" && (
              <Link to={`/tournaments/${t.id}/live`} className="btn-cyan w-full text-center block">🔴 WATCH LIVE</Link>
            )}

            <div className="glass border border-border rounded-xl p-5">
              <h3 className="text-sm font-black text-white mb-3" style={{ fontFamily: "'Rajdhani', sans-serif" }}>POINT REWARDS</h3>
              <div className="space-y-2">
                {[["Champion", "+500"], ["Runner-up", "+300"], ["3rd Place", "+200"], ["Participation", "+50"], ["Per Match Win", "+100"]].map(([label, pts]) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-mono-data text-green-400 font-bold">{pts} PTS</span>
                  </div>
                ))}
              </div>
            </div>

            <Link to="/tournaments" className="btn-secondary w-full text-center block text-xs">← BACK TO TOURNAMENTS</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
