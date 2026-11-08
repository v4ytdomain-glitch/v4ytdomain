import { Link } from "react-router";

export default function Footer() {
  return (
    <footer className="relative border-t border-border overflow-hidden pb-20 lg:pb-0" style={{ background: "linear-gradient(to bottom, var(--background), rgba(10,12,22,0.98))" }}>
      {/* Top laser */}
      <div className="absolute top-0 left-0 right-0 laser-line"></div>

      {/* Background grid */}
      <div className="absolute inset-0 bg-dots opacity-20 pointer-events-none"></div>

      {/* Corner glows */}
      <div className="absolute top-0 left-0 w-64 h-64 rounded-full" style={{ background: "radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 70%)", transform: "translate(-30%, -30%)" }}></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full" style={{ background: "radial-gradient(circle, rgba(6,182,212,0.06) 0%, transparent 70%)", transform: "translate(30%, 30%)" }}></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-14 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center text-white font-black text-sm" style={{ boxShadow: "0 0 20px rgba(124,58,237,0.4)" }}>V4</div>
              <div>
                <span className="text-white font-black text-lg tracking-widest" style={{ fontFamily: "'Rajdhani', sans-serif" }}>V4YT</span>
                <span className="text-violet-400 ml-1.5 text-xs font-bold tracking-widest">OFFICIAL</span>
              </div>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">Play. Compete. Earn. Dominate.</p>

            <div className="flex items-center gap-2">
              {[
                { label: "YouTube", icon: "▶", color: "hover:border-red-500/50 hover:text-red-400 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)]" },
                { label: "Instagram", icon: "◉", color: "hover:border-pink-500/50 hover:text-pink-400 hover:shadow-[0_0_15px_rgba(236,72,153,0.3)]" },
                { label: "Discord", icon: "◈", color: "hover:border-indigo-500/50 hover:text-indigo-400 hover:shadow-[0_0_15px_rgba(99,102,241,0.3)]" },
                { label: "WhatsApp", icon: "◎", color: "hover:border-green-500/50 hover:text-green-400 hover:shadow-[0_0_15px_rgba(34,197,94,0.3)]" },
              ].map(s => (
                <button key={s.label} className={`w-9 h-9 rounded-lg bg-secondary border border-border flex items-center justify-center text-muted-foreground transition-all text-xs ${s.color}`} title={s.label}>
                  {s.icon}
                </button>
              ))}
            </div>
          </div>

          {/* Nav */}
          <div>
            <h4 className="text-xs font-black tracking-widest text-muted-foreground mb-4" style={{ fontFamily: "'Rajdhani', sans-serif" }}>NAVIGATE</h4>
            <div className="space-y-2.5">
              {[["Tournaments", "/tournaments"], ["Leaderboard", "/leaderboard"], ["Players", "/players"], ["Videos", "/videos"], ["Hall of Fame", "/hall-of-fame"]].map(([label, path]) => (
                <Link key={path} to={path} className="block text-sm text-muted-foreground hover:text-violet-400 transition-colors cyber-line pb-px">{label}</Link>
              ))}
            </div>
          </div>

          {/* Community */}
          <div>
            <h4 className="text-xs font-black tracking-widest text-muted-foreground mb-4" style={{ fontFamily: "'Rajdhani', sans-serif" }}>COMMUNITY</h4>
            <div className="space-y-2.5">
              {[["Announcements", "/announcements"], ["Teams", "/teams"], ["Rewards", "/rewards"], ["Achievements", "/achievements"], ["Dashboard", "/dashboard"]].map(([label, path]) => (
                <Link key={path} to={path} className="block text-sm text-muted-foreground hover:text-cyan-400 transition-colors cyber-line pb-px">{label}</Link>
              ))}
            </div>
          </div>

          {/* Legal + Season */}
          <div>
            <h4 className="text-xs font-black tracking-widest text-muted-foreground mb-4" style={{ fontFamily: "'Rajdhani', sans-serif" }}>LEGAL</h4>
            <div className="space-y-2.5 mb-6">
              {["Privacy Policy", "Terms of Service", "Community Guidelines", "Tournament Rules"].map(label => (
                <button key={label} className="block text-sm text-muted-foreground hover:text-foreground transition-colors text-left">{label}</button>
              ))}
            </div>

            {/* Season badge */}
            <div className="relative p-4 rounded-xl neon-border overflow-hidden">
              <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.08) 0%, transparent 60%)" }}></div>
              <div className="relative">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full pulse-dot"></div>
                  <span className="text-xs font-black text-green-400" style={{ fontFamily: "'Rajdhani', sans-serif" }}>SEASON 01 ACTIVE</span>
                </div>
                <p className="text-xs text-muted-foreground">Aug – Oct 2026</p>
                <p className="text-xs text-violet-400 mt-1 font-bold">2,481 Players Competing</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 relative">
          <div className="laser-line mb-6"></div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">© 2026 V4YT OFFICIAL. All rights reserved.</p>
            <p className="text-xs font-mono-data text-muted-foreground">V4YT SEASON 01 · 2,481 PLAYERS · 18 TOURNAMENTS</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
