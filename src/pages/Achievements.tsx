import { useState, useEffect } from "react";
import { Link } from "react-router";
import { api } from "../lib/api";
import ParticleField from "../components/ParticleField";

export default function Achievements() {
  const [allBadges, setAllBadges] = useState<any[]>([]);
  const [myBadges, setMyBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        // Fetch all platform badges
        const all = await api.get("/achievements/");
        setAllBadges(all);

        // Check if user is logged in and fetch their specific unlocked badges
        const me = await api.get("/auth/me").catch(() => null);
        if (me) {
          setIsLoggedIn(true);
          const mine = await api.get(`/achievements/user/${me.id}`);
          setMyBadges(mine);
        }
      } catch (err) {
        console.error("Error loading achievements", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBadges();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-yellow-400 font-bold tracking-widest animate-pulse" style={{ fontFamily: "'Rajdhani', sans-serif" }}>LOADING BADGES...</div>;
  }

  // Create an array of IDs the user has unlocked for easy checking
  const unlockedIds = myBadges.map(b => b.id);

  return (
    <div>
      {/* Header */}
      <div className="relative border-b border-border overflow-hidden py-16">
        <div className="absolute inset-0 bg-grid-dense opacity-40"></div>
        <ParticleField count={30} />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 60% 80% at 50% 10%, rgba(245,158,11,0.1) 0%, transparent 70%)" }}></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-5xl md:text-6xl font-black text-white mb-4" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
            V4YT <span className="gradient-text-gold text-glow-gold">ACHIEVEMENTS</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Complete challenges, win tournaments, and participate in community events to unlock exclusive profile badges.
          </p>
          
          {isLoggedIn ? (
            <div className="mt-6 inline-flex items-center gap-3 px-6 py-2 rounded-full border border-yellow-500/30 bg-yellow-500/10">
              <span className="text-xl">🏆</span>
              <span className="text-sm font-black text-yellow-400 tracking-widest" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                YOU HAVE UNLOCKED {myBadges.length} / {allBadges.length} BADGES
              </span>
            </div>
          ) : (
            <div className="mt-6 inline-flex flex-col items-center gap-3">
              <p className="text-sm text-muted-foreground">Log in to track your progression.</p>
              <Link to="/login" className="btn-primary text-xs">LOGIN TO TRACK</Link>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {allBadges.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            No achievements have been created by the admins yet.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {allBadges.map((badge, i) => {
              const unlocked = unlockedIds.includes(badge.id);
              
              return (
                <div 
                  key={badge.id} 
                  className={`glass border rounded-2xl p-5 flex flex-col items-center text-center transition-all duration-500 card-hover fade-up ${
                    unlocked 
                      ? "border-yellow-500/40 bg-yellow-500/5 shadow-[0_0_20px_rgba(245,158,11,0.15)]" 
                      : "border-border/50 opacity-60 grayscale hover:grayscale-0 hover:opacity-100"
                  }`}
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <div className={`text-5xl mb-4 transition-transform duration-500 ${unlocked ? "scale-110 drop-shadow-[0_0_15px_rgba(245,158,11,0.6)]" : ""}`}>
                    {badge.icon}
                  </div>
                  <h3 className="text-base font-black text-white mb-2" style={{ fontFamily: "'Rajdhani', sans-serif" }}>{badge.name}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed flex-1">{badge.description}</p>
                  
                  <div className="mt-4 pt-4 border-t border-border/50 w-full">
                    {unlocked ? (
                      <span className="text-xs font-bold text-yellow-400 tracking-widest" style={{ fontFamily: "'Rajdhani', sans-serif" }}>✓ UNLOCKED</span>
                    ) : (
                      <span className="text-xs font-bold text-muted-foreground tracking-widest" style={{ fontFamily: "'Rajdhani', sans-serif" }}>LOCKED</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}