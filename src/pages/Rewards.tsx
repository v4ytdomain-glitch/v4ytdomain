import { useState } from "react";
import { rewards } from "../data/mock";

export default function Rewards() {
  const [claimed, setClaimed] = useState<number[]>([]);
  const myPoints = 12450;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-8">
        <p className="text-xs font-semibold tracking-widest text-violet-400 mb-2" style={{ fontFamily: "'Rajdhani', sans-serif" }}>EARN MORE</p>
        <h1 className="text-5xl md:text-6xl font-black text-white mb-2" style={{ fontFamily: "'Rajdhani', sans-serif" }}>REWARDS</h1>
        <p className="text-muted-foreground">Unlock exclusive rewards with V4YT Points.</p>
      </div>

      {/* Points balance */}
      <div className="glass neon-border rounded-xl p-5 mb-8 flex items-center gap-5">
        <div className="text-4xl">💰</div>
        <div>
          <p className="text-xs text-muted-foreground">Your Balance</p>
          <p className="text-3xl font-black text-white font-mono-data" style={{ fontFamily: "'Rajdhani', sans-serif" }}>{myPoints.toLocaleString()} <span className="text-lg text-violet-400">V4YT PTS</span></p>
        </div>
      </div>

      {/* Point earning guide */}
      <div className="glass border border-border rounded-xl p-5 mb-8">
        <h3 className="text-sm font-black text-white mb-4" style={{ fontFamily: "'Rajdhani', sans-serif" }}>HOW TO EARN POINTS</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[["🏆 Champion", "+500"], ["🥈 Runner-up", "+300"], ["🥉 Third Place", "+200"], ["🎮 Participate", "+50"], ["⚔️ Match Win", "+100"], ["🔥 Daily Login", "+5"], ["✨ Challenge", "+25"], ["👥 Refer Friend", "+20"]].map(([label, pts]) => (
            <div key={label as string} className="bg-secondary border border-border rounded-lg p-3 text-center">
              <p className="text-sm mb-1">{label}</p>
              <p className="text-sm font-black text-green-400 font-mono-data">{pts} PTS</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {rewards.map(r => {
          const canAfford = myPoints >= r.cost;
          const isClaimed = claimed.includes(r.id);
          return (
            <div key={r.id} className={`glass border rounded-xl p-5 transition-all ${isClaimed ? "border-green-500/30" : canAfford ? "border-violet-500/20 card-hover" : "border-border opacity-60"}`}>
              <div className="text-4xl mb-3">{r.icon}</div>
              <h3 className="text-lg font-black text-white mb-1" style={{ fontFamily: "'Rajdhani', sans-serif" }}>{r.name}</h3>
              <p className="text-xs text-muted-foreground mb-4 leading-relaxed">{r.desc}</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Cost</p>
                  <p className={`text-lg font-black font-mono-data ${canAfford ? "text-violet-400" : "text-muted-foreground"}`} style={{ fontFamily: "'Rajdhani', sans-serif" }}>{r.cost.toLocaleString()} PTS</p>
                </div>
                {isClaimed ? (
                  <span className="text-sm font-bold text-green-400" style={{ fontFamily: "'Rajdhani', sans-serif" }}>✓ CLAIMED</span>
                ) : (
                  <button
                    onClick={() => canAfford && setClaimed(c => [...c, r.id])}
                    disabled={!canAfford}
                    className={`px-4 py-2 rounded-lg text-xs font-bold tracking-wide ${canAfford ? "btn-primary" : "bg-secondary border border-border text-muted-foreground cursor-not-allowed"}`}
                    style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                    {canAfford ? "CLAIM" : "NOT ENOUGH PTS"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
