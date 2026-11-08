import { useSearchParams, Link } from "react-router";
import { players, tournaments, videos } from "../data/mock";

export default function Search() {
  const [params] = useSearchParams();
  const q = params.get("q") || "";

  const matchPlayers = players.filter(p => p.username.toLowerCase().includes(q.toLowerCase()));
  const matchTournaments = tournaments.filter(t => t.name.toLowerCase().includes(q.toLowerCase()));
  const matchVideos = videos.filter(v => v.title.toLowerCase().includes(q.toLowerCase()));

  const total = matchPlayers.length + matchTournaments.length + matchVideos.length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-4xl font-black text-white mb-1" style={{ fontFamily: "'Rajdhani', sans-serif" }}>SEARCH RESULTS</h1>
      {q && <p className="text-muted-foreground mb-8">"{q}" — {total} result{total !== 1 ? "s" : ""}</p>}

      {total === 0 && q ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-2xl font-black text-white mb-2" style={{ fontFamily: "'Rajdhani', sans-serif" }}>NO RESULTS</h3>
          <p className="text-muted-foreground">No results found for "{q}".</p>
        </div>
      ) : (
        <div className="space-y-8">
          {matchPlayers.length > 0 && (
            <div>
              <h3 className="text-xs font-black text-muted-foreground tracking-widest mb-3" style={{ fontFamily: "'Rajdhani', sans-serif" }}>PLAYERS ({matchPlayers.length})</h3>
              <div className="space-y-2">
                {matchPlayers.map(p => (
                  <Link key={p.id} to={`/players/${p.id}`} className="flex items-center gap-3 glass border border-border rounded-xl p-4 hover:border-violet-500/30 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center text-white font-black text-xs">{p.avatar}</div>
                    <div>
                      <p className="font-bold text-white" style={{ fontFamily: "'Rajdhani', sans-serif" }}>{p.username}</p>
                      <p className="text-xs text-muted-foreground">Level {p.level} · Rank #{p.rank}</p>
                    </div>
                    <div className="ml-auto text-sm font-mono-data text-violet-400">{p.points.toLocaleString()} pts</div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {matchTournaments.length > 0 && (
            <div>
              <h3 className="text-xs font-black text-muted-foreground tracking-widest mb-3" style={{ fontFamily: "'Rajdhani', sans-serif" }}>TOURNAMENTS ({matchTournaments.length})</h3>
              <div className="space-y-2">
                {matchTournaments.map(t => (
                  <Link key={t.id} to={`/tournaments/${t.id}`} className="flex items-center gap-3 glass border border-border rounded-xl p-4 hover:border-violet-500/30 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-secondary border border-border flex items-center justify-center text-xl">🏆</div>
                    <div>
                      <p className="font-bold text-white" style={{ fontFamily: "'Rajdhani', sans-serif" }}>{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.game} · {t.date}</p>
                    </div>
                    <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-bold ${t.status === "live" ? "badge-live" : t.status === "open" ? "badge-open" : "badge-done"}`} style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                      {t.status.toUpperCase()}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {matchVideos.length > 0 && (
            <div>
              <h3 className="text-xs font-black text-muted-foreground tracking-widest mb-3" style={{ fontFamily: "'Rajdhani', sans-serif" }}>VIDEOS ({matchVideos.length})</h3>
              <div className="space-y-2">
                {matchVideos.map(v => (
                  <div key={v.id} className="flex items-center gap-3 glass border border-border rounded-xl p-4">
                    <div className="w-10 h-10 rounded-lg bg-secondary border border-border flex items-center justify-center text-xl">▶</div>
                    <div>
                      <p className="font-bold text-white" style={{ fontFamily: "'Rajdhani', sans-serif" }}>{v.title}</p>
                      <p className="text-xs text-muted-foreground">{v.views} views · {v.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
