import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import { api } from "../lib/api";
import ParticleField from "../components/ParticleField";

function useCountdown(d: number, h: number, m: number) {
  const [time, setTime] = useState({ d, h, m, s: 0 });
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(prev => {
        let { d, h, m, s } = prev;
        if (s > 0) return { d, h, m, s: s - 1 };
        if (m > 0) return { d, h, m: m - 1, s: 59 };
        if (h > 0) return { d, h: h - 1, m: 59, s: 59 };
        if (d > 0) return { d: d - 1, h: 23, m: 59, s: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  return time;
}

function useCounterAnimation(target: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        const start = Date.now();
        const tick = () => {
          const elapsed = Date.now() - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setCount(Math.floor(eased * target));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        observer.disconnect();
      }
    }, { threshold: 0.4 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);
  return { count, ref };
}

function StatCounter({ value, label, suffix = "" }: { value: number; label: string; suffix?: string }) {
  const { count, ref } = useCounterAnimation(value || 0);
  return (
    <div ref={ref} className="text-center fade-up">
      <div
        className="text-5xl md:text-6xl font-black mb-1 gradient-text text-glow"
        style={{ fontFamily: "'Rajdhani', sans-serif" }}
      >
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-xs tracking-widest text-muted-foreground uppercase" style={{ fontFamily: "'Rajdhani', sans-serif", letterSpacing: "0.18em" }}>{label}</div>
    </div>
  );
}

const tierColors: Record<string, string> = {
  legend: "rank-legend", master: "rank-master", diamond: "rank-diamond",
  platinum: "rank-platinum", gold: "rank-gold", silver: "rank-silver", bronze: "rank-bronze"
};

export default function Home() {
  const countdown = useCountdown(2, 14, 38);
  
  const [tournamentsData, setTournamentsData] = useState<any[]>([]);
  const [playersData, setPlayersData] = useState<any[]>([]);
  
  // Track the logged-in user to dynamically update the CTA buttons
  const [me, setMe] = useState<any>(null); 
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Fetch User independently (fails safely to null if logged out)
    api.get("/auth/me")
      .then(userData => setMe(userData))
      .catch(() => setMe(null));

    // 2. Fetch platform data
    Promise.all([
      api.get("/tournaments/"),
      api.get("/players/")
    ])
      .then(([tData, pData]) => {
        setTournamentsData(tData);
        setPlayersData(pData);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch home page data", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-violet-400 font-bold tracking-widest animate-pulse" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
          INITIALIZING V4YT PLATFORM...
        </div>
      </div>
    );
  }

  // Strictly find the next active tournament. If none exist, it will be undefined.
  const next = tournamentsData.find(t => t.status !== "completed");
  
  // Get top 5 players for the leaderboard preview
  const topPlayers = playersData.slice(0, 5);
  
  // Get upcoming tournaments for the grid
  const liveAndUpcoming = tournamentsData.filter(t => t.status !== "completed").slice(0, 4);

  // Dynamically calculate platform statistics
  const totalPoints = playersData.reduce((acc, p) => acc + (p.points || 0), 0);
  const totalChampions = playersData.filter(p => (p.wins || 0) > 0).length;

  return (
    <div>
      {/* ═══ HERO ═══ */}
      <section className="relative min-h-screen flex items-center overflow-hidden scanlines">
        {/* Layered background */}
        <div className="absolute inset-0 bg-grid-dense opacity-60"></div>

        {/* Aurora orbs */}
        <div className="aurora-bg">
          <div className="aurora-orb aurora-orb-1"></div>
          <div className="aurora-orb aurora-orb-2"></div>
          <div className="aurora-orb aurora-orb-3"></div>
        </div>

        {/* Particle field */}
        <ParticleField count={80} />

        {/* Radial vignette */}
        <div className="absolute inset-0 bg-radial-[ellipse_at_center] from-transparent via-transparent to-background/80 pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background pointer-events-none"></div>

        {/* Horizontal laser lines */}
        <div className="absolute top-1/3 left-0 right-0 laser-line opacity-30"></div>
        <div className="absolute bottom-1/3 left-0 right-0 laser-line opacity-20" style={{ animationDelay: "1.5s" }}></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full grid lg:grid-cols-2 gap-12 py-24">
          {/* Left — text */}
          <div className="flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full border border-violet-500/30 bg-violet-500/10 backdrop-blur w-fit fade-up scale-in">
              <div className="w-2 h-2 bg-green-400 rounded-full pulse-dot"></div>
              <span className="text-xs font-bold tracking-widest text-violet-300" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                SEASON 01 — LIVE NOW
              </span>
            </div>

            <h1
              className="text-7xl md:text-8xl lg:text-[7rem] font-black leading-none mb-3 slide-in-left"
              style={{ fontFamily: "'Rajdhani', sans-serif", letterSpacing: "0.04em" }}
            >
              <span className="text-white glitch text-glow-white" data-text="V4YT">V4YT</span>
              <br />
              <span className="gradient-text">OFFICIAL</span>
            </h1>

            <p className="text-2xl md:text-3xl font-bold mb-5 tracking-wider fade-up delay-200 text-shimmer" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
              PLAY. COMPETE. EARN. DOMINATE.
            </p>

            <p className="text-base text-muted-foreground max-w-md mb-8 leading-relaxed fade-up delay-300">
              Join the V4YT gaming community. Compete in tournaments, earn points, climb the leaderboard and become a V4YT legend.
            </p>

            <div className="flex flex-wrap gap-3 fade-up delay-400">
              <Link to="/tournaments" className="btn-primary pulse-glow">JOIN NEXT TOURNAMENT</Link>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="btn-secondary flex items-center gap-2">
                <svg className="w-4 h-4 text-red-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                WATCH ON YOUTUBE
              </a>
            </div>

            {/* Scroll indicator */}
            <div className="mt-16 hidden md:flex items-center gap-3 fade-up delay-700">
              <div className="flex flex-col gap-1">
                <div className="w-px h-6 bg-gradient-to-b from-violet-500 to-transparent mx-auto bounce-subtle"></div>
                <div className="w-1.5 h-1.5 bg-violet-500 rounded-full mx-auto pulse-dot"></div>
              </div>
              <span className="text-xs text-muted-foreground tracking-widest" style={{ fontFamily: "'Rajdhani', sans-serif" }}>SCROLL</span>
            </div>
          </div>

          {/* Right — tournament card */}
          <div className="flex items-center slide-in-right">
            {next ? (
              <div className="w-full neon-conic glass-bright rounded-2xl p-6 float">
                {/* Inner glow */}
                <div className="absolute inset-0 rounded-2xl" style={{ background: "radial-gradient(ellipse at top left, rgba(124,58,237,0.08) 0%, transparent 60%)" }}></div>

                <div className="flex items-center justify-between mb-5">
                  <span className="text-xs font-bold tracking-widest text-violet-300" style={{ fontFamily: "'Rajdhani', sans-serif" }}>NEXT TOURNAMENT</span>
                  <span className={`text-xs px-3 py-1 rounded-full font-bold ${next.status === "live" ? "badge-live" : next.status === "open" ? "badge-open flicker" : "badge-soon"}`} style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                    {next.status === "live" ? "🔴 LIVE NOW" : next.status === "open" ? "REGISTRATION OPEN" : "COMING SOON"}
                  </span>
                </div>

                <h3 className="text-2xl font-black text-white mb-1 text-glow-white" style={{ fontFamily: "'Rajdhani', sans-serif" }}>{next.name}</h3>
                <p className="text-sm text-muted-foreground mb-5">{next.game} · {next.date} · {next.time}</p>

                {/* Countdown */}
                <div className="grid grid-cols-4 gap-2 mb-5">
                  {[{ v: String(countdown.d).padStart(2,"0"), l: "DAYS" }, { v: String(countdown.h).padStart(2,"0"), l: "HRS" }, { v: String(countdown.m).padStart(2,"0"), l: "MIN" }, { v: String(countdown.s).padStart(2,"0"), l: "SEC" }].map(item => (
                    <div key={item.l} className="relative bg-background/80 rounded-xl p-3 text-center border border-violet-500/20 overflow-hidden">
                      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent"></div>
                      <div className="text-2xl font-black text-white font-mono-data" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{item.v}</div>
                      <div className="text-xs text-muted-foreground mt-0.5" style={{ fontFamily: "'Rajdhani', sans-serif", letterSpacing: "0.12em" }}>{item.l}</div>
                    </div>
                  ))}
                </div>

                {/* Progress */}
                <div className="mb-5">
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-muted-foreground">Spots filled</span>
                    <span className="font-bold font-mono-data text-foreground">{next.players_registered} / {next.max_players}</span>
                  </div>
                  <div className="h-2 bg-background/80 rounded-full overflow-hidden xp-bar">
                    <div className="h-full bg-gradient-to-r from-violet-600 via-violet-400 to-cyan-500 rounded-full" style={{ width: `${(next.players_registered / next.max_players) * 100}%`, animation: "fill-bar 1.5s ease-out 0.5s both" }}></div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Prize Pool</p>
                    <p className="text-xl font-black gradient-text-gold text-glow-gold" style={{ fontFamily: "'Rajdhani', sans-serif" }}>{next.prize}</p>
                  </div>
                  <Link to={`/tournaments/${next.id}/register`} className="btn-primary">REGISTER NOW</Link>
                </div>
              </div>
            ) : (
              <div className="w-full neon-conic glass-bright rounded-2xl p-12 float text-center">
                <div className="text-6xl mb-5 drop-shadow-[0_0_15px_rgba(124,58,237,0.5)]">🏆</div>
                <h3 className="text-2xl font-black text-white mb-3 tracking-wider" style={{ fontFamily: "'Rajdhani', sans-serif" }}>UPCOMING TOURNAMENT SOON</h3>
                <p className="text-muted-foreground">The next championship is being scheduled. Stay tuned for announcements!</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ═══ STATS ═══ */}
      <section className="relative py-16 border-y border-border overflow-hidden">
        <div className="absolute inset-0 bg-dots opacity-30"></div>
        <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-violet-500/30 to-transparent"></div>
        <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-cyan-500/30 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 divide-y md:divide-y-0 md:divide-x divide-border">
            <StatCounter value={playersData.length} label="Registered Players" />
            <StatCounter value={tournamentsData.length} label="Tournaments" />
            <StatCounter value={totalPoints} label="Points Earned" />
            <StatCounter value={totalChampions} label="Champions" />
          </div>
        </div>
      </section>

      {/* ═══ TOURNAMENTS ═══ */}
      <section className="relative py-20 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs font-semibold tracking-widest text-violet-400 mb-2 fade-up" style={{ fontFamily: "'Rajdhani', sans-serif" }}>COMPETE</p>
            <h2 className="text-4xl md:text-5xl font-black text-white fade-up delay-100" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
              LIVE &amp; <span className="gradient-text">UPCOMING</span>
            </h2>
          </div>
          <Link to="/tournaments" className="btn-secondary text-xs">VIEW ALL →</Link>
        </div>

        {liveAndUpcoming.length === 0 ? (
          <div className="glass border border-border rounded-xl p-10 text-center">
            <p className="text-muted-foreground">No live or upcoming tournaments at this time.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-5">
            {liveAndUpcoming.map((t, i) => (
              <Link
                key={t.id}
                to={`/tournaments/${t.id}`}
                className={`glass border border-border rounded-2xl overflow-hidden card-hover card-sheen corner-glow group fade-up`}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="h-44 relative overflow-hidden bg-secondary">
                  <img src={t.image || "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=400&fit=crop"} alt={t.name} className="w-full h-full object-cover opacity-50 group-hover:opacity-70 group-hover:scale-105 transition-all duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent"></div>
                  
                  {/* Neon strip at top */}
                  <div className={`absolute top-0 left-0 right-0 h-0.5 ${t.status === "live" ? "bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_20px_rgba(239,68,68,0.8)]" : t.status === "open" ? "bg-gradient-to-r from-transparent via-green-500 to-transparent shadow-[0_0_20px_rgba(34,197,94,0.8)]" : ""}`}></div>
                  
                  <div className="absolute top-3 left-3">
                    <span className={`text-xs px-3 py-1 rounded-full font-bold tracking-wide ${t.status === "live" ? "badge-live" : t.status === "open" ? "badge-open" : t.status === "soon" ? "badge-soon" : "badge-done"}`} style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                      {t.status === "live" ? "🔴 LIVE" : t.status === "open" ? "REGISTRATION OPEN" : t.status === "soon" ? "COMING SOON" : "COMPLETED"}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-xl font-black text-white mb-1 group-hover:text-glow-white transition-all" style={{ fontFamily: "'Rajdhani', sans-serif" }}>{t.name}</h3>
                  <p className="text-xs text-muted-foreground mb-4">{t.game} · {t.date} · {t.time}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>👥 {t.players_registered}/{t.max_players}</span>
                      <span className="text-yellow-400 font-semibold">🏆 {t.prize}</span>
                    </div>
                    <span className="text-xs font-bold text-violet-400 group-hover:text-glow" style={{ fontFamily: "'Rajdhani', sans-serif" }}>VIEW →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ═══ LEADERBOARD PREVIEW ═══ */}
      <section className="relative py-20 overflow-hidden border-y border-border">
        <div className="absolute inset-0 bg-dots opacity-20"></div>
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(6,182,212,0.06) 0%, transparent 70%)" }}></div>

        {/* Animated vertical bars decorative */}
        <div className="absolute left-4 top-0 bottom-0 flex gap-3 opacity-10 pointer-events-none">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="w-px bg-gradient-to-b from-transparent via-cyan-500 to-transparent" style={{ animation: `bar-shine ${2 + i * 0.5}s ease-in-out infinite`, animationDelay: `${i * 0.3}s` }}></div>
          ))}
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs font-semibold tracking-widest text-cyan-400 mb-2" style={{ fontFamily: "'Rajdhani', sans-serif" }}>RANKINGS</p>
              <h2 className="text-4xl md:text-5xl font-black text-white" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                GLOBAL <span className="text-glow-cyan" style={{ color: "#06b6d4" }}>LEADERBOARD</span>
              </h2>
            </div>
            <Link to="/leaderboard" className="btn-secondary text-xs">FULL LEADERBOARD →</Link>
          </div>

          <div className="space-y-2">
            {topPlayers.length === 0 ? (
              <div className="glass border border-border rounded-xl p-10 text-center">
                <p className="text-muted-foreground">No players registered yet.</p>
              </div>
            ) : (
              topPlayers.map((p, i) => (
                <Link
                  key={p.id}
                  to={`/players/${p.id}`}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-all group card-hover fade-up ${i === 0 ? "bg-gradient-to-r from-yellow-500/10 to-transparent border-yellow-500/20 neon-border-gold" : i === 1 ? "bg-gradient-to-r from-slate-400/5 to-transparent border-slate-400/10" : i === 2 ? "bg-gradient-to-r from-orange-700/5 to-transparent border-orange-700/10" : "border-border bg-card/50"}`}
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  {/* Rank number */}
                  <div className={`w-10 text-center font-black text-xl shrink-0 ${i === 0 ? "text-yellow-400 text-glow-gold" : i === 1 ? "text-slate-300" : i === 2 ? "text-orange-500" : "text-muted-foreground"}`} style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                  </div>

                  {/* Avatar */}
                  <div className={`w-11 h-11 rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center text-white font-black text-xs shrink-0 transition-all group-hover:scale-110 ${i === 0 ? "ring-2 ring-yellow-400/60" : ""}`} style={{ boxShadow: i === 0 ? "0 0 20px rgba(245,158,11,0.4)" : "" }}>
                    {p.avatar || "V4"}
                  </div>

                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-white text-sm group-hover:text-glow transition-all truncate" style={{ fontFamily: "'Rajdhani', sans-serif" }}>{p.username}</p>
                    <p className="text-xs text-muted-foreground truncate">Level {p.level} · {p.win_rate || 0}% Win Rate</p>
                  </div>

                  {/* Tier */}
                  <div className="hidden sm:block">
                    <p className={`text-sm font-black uppercase ${tierColors[p.tier] || "text-foreground"}`} style={{ fontFamily: "'Rajdhani', sans-serif" }}>{p.tier}</p>
                  </div>

                  {/* Points */}
                  <div className="text-right">
                    <p className="font-black text-white font-mono-data text-base" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{(p.points || 0).toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">V4YT PTS</p>
                  </div>

                  {/* Animated right arrow */}
                  <div className="text-muted-foreground group-hover:text-violet-400 group-hover:translate-x-1 transition-all">→</div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ═══ VIDEOS (Updated to Placeholder) ═══ */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs font-semibold tracking-widest text-red-400 mb-2" style={{ fontFamily: "'Rajdhani', sans-serif" }}>YOUTUBE</p>
            <h2 className="text-4xl md:text-5xl font-black text-white" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
              LATEST <span style={{ color: "#ef4444", textShadow: "0 0 20px rgba(239,68,68,0.5)" }}>VIDEOS</span>
            </h2>
          </div>
          <Link to="/videos" className="btn-secondary text-xs">WATCH MORE →</Link>
        </div>

        <div className="glass border border-border rounded-xl p-16 text-center fade-up shadow-[0_0_30px_rgba(0,0,0,0.5)]">
          <div className="text-6xl mb-4 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)] inline-block">🎥</div>
          <h3 className="text-2xl font-black text-white mb-2 tracking-wider" style={{ fontFamily: "'Rajdhani', sans-serif" }}>VIDEOS WILL BE UPDATED SOON</h3>
          <p className="text-muted-foreground max-w-md mx-auto">Check back later for the latest tournament highlights, gameplay streams, and community clips.</p>
        </div>
      </section>

      {/* ═══ CTA FINAL ═══ */}
      <section className="relative py-28 overflow-hidden">
        <div className="absolute inset-0 bg-grid-dense opacity-40"></div>
        <ParticleField count={40} />

        <div className="absolute inset-0 aurora-bg">
          <div className="aurora-orb" style={{ width: "700px", height: "400px", background: "radial-gradient(ellipse, rgba(124,58,237,0.2) 0%, transparent 70%)", top: "0%", left: "20%", animation: "aurora-float 6s ease-in-out infinite" }}></div>
        </div>

        <div className="absolute top-0 left-0 right-0 laser-line"></div>
        <div className="absolute bottom-0 left-0 right-0 laser-line" style={{ animationDelay: "1s" }}></div>

        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
          <p className="text-xs font-bold tracking-widest text-violet-400 mb-4 fade-up" style={{ fontFamily: "'Rajdhani', sans-serif" }}>V4YT OFFICIAL · SEASON 01</p>
          <h2 className="text-5xl md:text-7xl font-black text-white mb-4 fade-up delay-100" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
            READY TO<br />
            <span className="gradient-text text-glow">DOMINATE?</span>
          </h2>
          <p className="text-muted-foreground mb-8 fade-up delay-200">Join {playersData.length}+ players already competing in V4YT Season 01.</p>
          <div className="flex flex-wrap gap-4 justify-center fade-up delay-300">
            
            {/* DYNAMIC BUTTON BASED ON LOGIN STATUS */}
            {me ? (
              <Link to="/dashboard" className="btn-primary pulse-glow" style={{ fontSize: "15px", padding: "13px 32px" }}>
                GO TO DASHBOARD
              </Link>
            ) : (
              <Link to="/login" className="btn-primary pulse-glow" style={{ fontSize: "15px", padding: "13px 32px" }}>
                CREATE ACCOUNT FREE
              </Link>
            )}

            <Link to="/tournaments" className="btn-secondary" style={{ fontSize: "15px", padding: "13px 32px" }}>
              BROWSE TOURNAMENTS
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}