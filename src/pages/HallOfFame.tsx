import { useState, useEffect } from "react";
import { Link } from "react-router";
import { api } from "../lib/api";
import ParticleField from "../components/ParticleField";

export default function HallOfFame() {
  const [hallOfFame, setHallOfFame] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch results, tournaments, and players simultaneously
    Promise.all([
      api.get("/tournaments/results"),
      api.get("/tournaments/"),
      api.get("/players/")
    ])
      .then(([resultsData, tournamentsData, playersData]) => {
        // Stitch the relational data together
        const formattedResults = resultsData.map((res: any) => {
          const t = tournamentsData.find((x: any) => x.id === res.tournament_id);
          const first = playersData.find((x: any) => x.id === res.first_place_id);
          const second = playersData.find((x: any) => x.id === res.second_place_id);
          const third = playersData.find((x: any) => x.id === res.third_place_id);

          // Extract just the year from the date string if possible
          const year = t && t.date ? t.date.split(",")[1]?.trim() || new Date().getFullYear().toString() : new Date().getFullYear().toString();

          return {
            id: res.id,
            year: year,
            tournament: t ? t.name : "Unknown Tournament",
            champion: first ? first.username : "Unknown Player",
            championId: first ? first.id : null,
            runnerUp: second ? second.username : "Unknown Player",
            third: third ? third.username : "Unknown Player",
            date: t ? t.date : "Unknown Date",
            avatar: first ? first.avatar : "🏆"
          };
        });

        setHallOfFame(formattedResults);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load Hall of Fame data", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-yellow-500 font-bold tracking-widest animate-pulse" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
          LOADING THE LEGENDS...
        </div>
      </div>
    );
  }

  if (hallOfFame.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <div className="text-6xl mb-4 float">🏆</div>
        <h2 className="text-3xl font-black text-white mb-2" style={{ fontFamily: "'Rajdhani', sans-serif" }}>NO CHAMPIONS YET</h2>
        <p className="text-muted-foreground mb-6">The Hall of Fame is waiting for its first legend.</p>
        <Link to="/tournaments" className="btn-primary">COMPETE NOW</Link>
      </div>
    );
  }

  const [latest, ...rest] = hallOfFame;

  return (
    <div>
      {/* Cinematic header */}
      <div className="relative min-h-[50vh] flex items-center overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-grid-dense opacity-40"></div>
        <ParticleField count={50} />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 70% 90% at 50% 0%, rgba(245,158,11,0.15) 0%, transparent 70%)" }}></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background pointer-events-none"></div>

        {/* Golden laser lines */}
        <div className="absolute top-1/3 left-0 right-0 h-px opacity-30" style={{ background: "linear-gradient(90deg, transparent, #f59e0b, #fbbf24, #f59e0b, transparent)", boxShadow: "0 0 20px rgba(245,158,11,0.5)" }}></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center w-full">
          <div className="text-6xl mb-4 float">🏆</div>
          <p className="text-xs font-semibold tracking-widest text-yellow-500 mb-3 fade-up" style={{ fontFamily: "'Rajdhani', sans-serif" }}>V4YT OFFICIAL</p>
          <h1 className="text-6xl md:text-8xl font-black mb-3 fade-up delay-100" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
            <span className="gradient-text-gold text-glow-gold">HALL OF FAME</span>
          </h1>
          <p className="text-muted-foreground fade-up delay-200">The legends who conquered the V4YT arena.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        {/* Reigning champion */}
        <div className="relative rounded-2xl overflow-hidden mb-14 scale-in neon-border-gold" style={{ boxShadow: "0 0 60px rgba(245,158,11,0.15), 0 20px 60px rgba(0,0,0,0.4)" }}>
          <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.1) 0%, rgba(245,158,11,0.03) 40%, rgba(6,182,212,0.05) 100%)" }}></div>
          <div className="absolute inset-0 bg-grid-dense opacity-30"></div>

          {/* Decorative corner accents */}
          <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-yellow-500/50 rounded-tl-2xl" style={{ boxShadow: "inset 0 0 15px rgba(245,158,11,0.2)" }}></div>
          <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-yellow-500/50 rounded-tr-2xl" style={{ boxShadow: "inset 0 0 15px rgba(245,158,11,0.2)" }}></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-yellow-500/30 rounded-bl-2xl"></div>
          <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-yellow-500/30 rounded-br-2xl"></div>

          <div className="relative p-8 md:p-14 flex flex-col md:flex-row items-center gap-10">
            {/* Trophy */}
            <div className="shrink-0">
              <div className="text-8xl md:text-9xl float" style={{ filter: "drop-shadow(0 0 30px rgba(245,158,11,0.5))" }}>🏆</div>
            </div>

            {/* Info */}
            <div className="text-center md:text-left flex-1">
              <span className="inline-flex items-center gap-2 text-xs font-black tracking-widest text-yellow-500 px-4 py-1.5 rounded-full border border-yellow-500/30 bg-yellow-500/10 mb-5" style={{ fontFamily: "'Rajdhani', sans-serif", boxShadow: "0 0 20px rgba(245,158,11,0.2)" }}>
                <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full pulse-dot"></div>
                {latest.year} REIGNING CHAMPION
              </span>
              
              {latest.championId ? (
                <Link to={`/players/${latest.championId}`} className="block hover:scale-[1.02] transition-transform origin-left">
                  <h2 className="text-5xl md:text-7xl font-black mb-3 gradient-text-gold text-glow-gold" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                    {latest.champion}
                  </h2>
                </Link>
              ) : (
                <h2 className="text-5xl md:text-7xl font-black mb-3 gradient-text-gold text-glow-gold" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                  {latest.champion}
                </h2>
              )}

              <p className="text-xl text-foreground/80 mb-1 font-bold" style={{ fontFamily: "'Rajdhani', sans-serif" }}>{latest.tournament}</p>
              <p className="text-muted-foreground mb-6">{latest.date}</p>

              <div className="flex flex-wrap gap-6 justify-center md:justify-start">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Runner-up</p>
                  <p className="text-base font-black text-foreground" style={{ fontFamily: "'Rajdhani', sans-serif" }}>🥈 {latest.runnerUp}</p>
                </div>
                <div className="w-px bg-border hidden sm:block"></div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Third Place</p>
                  <p className="text-base font-black text-foreground" style={{ fontFamily: "'Rajdhani', sans-serif" }}>🥉 {latest.third}</p>
                </div>
              </div>
            </div>

            {/* Avatar */}
            <div className="shrink-0">
              <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-yellow-500 via-orange-500 to-yellow-600 flex items-center justify-center text-white font-black text-3xl float-delay"
                style={{ boxShadow: "0 0 40px rgba(245,158,11,0.5), 0 0 80px rgba(245,158,11,0.2)" }}>
                {latest.avatar}
              </div>
              <p className="text-center text-xs text-yellow-400 mt-2 font-bold tracking-widest" style={{ fontFamily: "'Rajdhani', sans-serif" }}>CHAMPION</p>
            </div>
          </div>
        </div>

        {/* Previous champions */}
        {rest.length > 0 && (
          <div className="mb-8">
            <div className="laser-line mb-8"></div>
            <h2 className="text-3xl font-black text-white mb-8" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
              PREVIOUS <span className="text-muted-foreground">CHAMPIONS</span>
            </h2>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {rest.map((h, i) => (
                <div key={h.id} className="glass border border-border rounded-xl p-5 card-hover card-sheen corner-glow fade-up" style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white font-black text-sm border border-border" style={{ boxShadow: "0 4px 15px rgba(0,0,0,0.3)" }}>
                      {h.avatar}
                    </div>
                    <div>
                      <span className="text-xs font-black text-yellow-500/70 tracking-widest" style={{ fontFamily: "'Rajdhani', sans-serif" }}>🥇 CHAMPION</span>
                      {h.championId ? (
                        <Link to={`/players/${h.championId}`} className="block hover:text-yellow-400 transition-colors">
                          <h3 className="text-xl font-black text-white" style={{ fontFamily: "'Rajdhani', sans-serif" }}>{h.champion}</h3>
                        </Link>
                      ) : (
                        <h3 className="text-xl font-black text-white" style={{ fontFamily: "'Rajdhani', sans-serif" }}>{h.champion}</h3>
                      )}
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-foreground mb-1 truncate">{h.tournament}</p>
                  <p className="text-xs text-muted-foreground mb-3">{h.date}</p>
                  <div className="flex gap-4 text-xs text-muted-foreground border-t border-border pt-3">
                    <span className="truncate flex-1">🥈 {h.runnerUp}</span>
                    <span className="truncate flex-1">🥉 {h.third}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}